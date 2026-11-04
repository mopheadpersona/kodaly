import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TYPES,LEVELS,BARS,totalBeats,beatsOf,partsOf,genItems} from '../src/rhythm.js';

// Small seeded random generator, so a failing line can be reproduced.
function mulberry32(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

const METERS=[2,3,4],LEVEL_IDS=[1,2,3],RUNS=2000;

// Calls fn(items, label) for many generated lines in every meter and level.
function eachLine(fn){
  for(const meter of METERS)for(const level of LEVEL_IDS){
    const rng=mulberry32(meter*100+level);
    for(let n=0;n<RUNS;n++){
      const items=genItems({meter,level,rng});
      fn(items,{meter,level},`${meter}/4, level ${level}, line ${n}: ${items.map(i=>i.type).join(' ')}`);
    }
  }
}

test('every bar is filled exactly and the line has the right length',()=>{
  eachLine((items,{meter},label)=>{
    assert.equal(beatsOf(items),totalBeats(meter),label);
    const perBar=new Array(BARS[meter]).fill(0);
    for(const it of items)perBar[Math.floor(it.start/meter)]+=TYPES[it.type].beats;
    assert.deepEqual(perBar,new Array(BARS[meter]).fill(meter),label);
  });
});

test('pieces follow each other with no gaps',()=>{
  eachLine((items,_,label)=>{
    let pos=0;
    for(const it of items){assert.equal(it.start,pos,label);pos+=TYPES[it.type].beats;}
  });
});

test('no piece crosses a bar line',()=>{
  eachLine((items,{meter},label)=>{
    for(const it of items){
      const first=Math.floor(it.start/meter),last=Math.floor((it.start+TYPES[it.type].beats-1)/meter);
      assert.equal(first,last,label);
    }
  });
});

test('a line never starts with a rest',()=>{
  eachLine((items,_,label)=>assert.notEqual(items[0].type,'rest',label));
});

test('never two rests in a row',()=>{
  eachLine((items,_,label)=>{
    for(let i=1;i<items.length;i++)assert.ok(!(items[i].type==='rest'&&items[i-1].type==='rest'),label);
  });
});

test('ta-a-a-a only at the start of a bar',()=>{
  eachLine((items,{meter},label)=>{
    for(const it of items)if(it.type==='taaaa')assert.equal(it.start%meter,0,label);
  });
});

test('only pieces of the chosen level',()=>{
  eachLine((items,{level},label)=>{
    for(const it of items)assert.ok(LEVELS[level].includes(it.type),label);
  });
});

test('works with the default Math.random too',()=>{
  for(const meter of METERS){
    const items=genItems({meter,level:3});
    assert.equal(beatsOf(items),totalBeats(meter));
  }
});

test('partsOf splits ti-ti and tam-ti into two sounds each',()=>{
  const P=partsOf([{type:'ta',start:0},{type:'titi',start:1},{type:'tamti',start:2},{type:'rest',start:4}]);
  assert.deepEqual(P.map(p=>[p.syl,p.start,p.d,p.rest]),[
    ['ta',0,1,false],
    ['ti',1,.5,false],['ti',1.5,.5,false],
    ['tam',2,1.5,false],['ti',3.5,.5,false],
    ['sh',4,1,true]
  ]);
});

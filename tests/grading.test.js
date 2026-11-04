import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gradeOf,windowAt,findMatch} from '../src/grading.js';

test('on the beat: up to and including 70 ms, early or late',()=>{
  for(const d of [0,.01,.069,.07,-.03,-.07])assert.equal(gradeOf(d),'good',`${d*1000} ms`);
});

test('close: over 70 ms up to and including 150 ms',()=>{
  for(const d of [.0701,.1,.149,.15,-.0701,-.12,-.15])assert.equal(gradeOf(d),'ok',`${d*1000} ms`);
});

test('miss: over 150 ms',()=>{
  for(const d of [.1501,.2,.28,-.1501,-.25])assert.equal(gradeOf(d),'miss',`${d*1000} ms`);
});

const at=(...ts)=>ts.map(t=>({t,graded:false}));

test('window is at most 280 ms',()=>{
  const os=at(0,1,2);  // one second apart: 48% would be 480 ms
  assert.equal(windowAt(os,1),.28);
  assert.equal(windowAt(os,0),.28); // first note: only the next one counts
  assert.equal(windowAt(at(5),0),.28); // a lone note
});

test('window is 48% of the gap to the closer neighbour',()=>{
  const os=at(0,.5,.75,2); // gaps 0.5, 0.25, 1.25
  assert.ok(Math.abs(windowAt(os,0)-.24)<1e-12);  // 48% of 0.5
  assert.ok(Math.abs(windowAt(os,1)-.12)<1e-12);  // 48% of 0.25
  assert.ok(Math.abs(windowAt(os,2)-.12)<1e-12);
  assert.equal(windowAt(os,3),.28);               // 48% of 1.25 is over the cap
});

test('a tap matches the closest ungraded note',()=>{
  const os=at(0,.5,1);
  assert.deepEqual(findMatch(os,0,.52),{index:1,delta:.52-.5});
  const m=findMatch(os,0,.9);
  assert.equal(m.index,2);
  assert.ok(m.delta<0,'early tap gives a negative delta');
});

test('a graded note is skipped',()=>{
  const os=at(0,.5,1);
  os[1].graded=true;
  assert.equal(findMatch(os,0,.5),null);  // the only note near 0.5 is already graded
  os[1].graded=false;os[0].graded=true;
  assert.equal(findMatch(os,0,.02),null); // the only note near 0.02 is already graded
  assert.equal(findMatch(os,0,.48).index,1);
});

test('a tap outside every window matches nothing',()=>{
  const os=at(0,1);
  assert.equal(findMatch(os,0,.5),null);  // 500 ms from both notes, windows are 280 ms
  assert.equal(findMatch(os,0,-.3),null); // before the first note
});

test('search starts from the given index',()=>{
  const os=at(0,.5,1);
  assert.equal(findMatch(os,1,0),null);
  assert.equal(findMatch(os,1,.5).index,1);
});

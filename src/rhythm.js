// Rhythm model and random generator. Pure functions: no DOM, no audio.
// Durations are in beats (one beat = one quarter note = one metronome click).

export const TYPES={
  ta:   {beats:1, parts:[{d:1,s:'та'}]},
  titi: {beats:1, parts:[{d:.5,s:'ти'},{d:.5,s:'ти'}]},
  taa:  {beats:2, parts:[{d:2,s:'та-а'}]},
  taaa: {beats:3, parts:[{d:3,s:'та-а-а'}]},
  taaaa:{beats:4, parts:[{d:4,s:'та-а-а-а'}]},
  rest: {beats:1, parts:[{d:1,s:'ш',rest:true}]},
  tamti:{beats:2, parts:[{d:1.5,s:'там'},{d:.5,s:'ти'}]}
};
export const LABEL={ta:'та',titi:'ти-ти',taa:'та-а',taaa:'та-а-а',taaaa:'та-а-а-а',rest:'пауза',tamti:'там-ти'};
export const CHIP_ORDER=['ta','titi','taa','taaa','taaaa','rest','tamti'];
export const LEVELS={1:['ta','taa','taaa','taaaa','rest'],2:['ta','titi','taa','taaa','taaaa','rest'],3:['ta','titi','taa','taaa','taaaa','rest','tamti']};
// How often each piece is picked by the generator.
export const W8={ta:5,titi:4,taa:2.2,taaa:.9,taaaa:.7,rest:1.3,tamti:1.8};
// Bars per line for each meter: 8–9 beats a line.
export const BARS={2:4,3:3,4:2};

export const totalBeats=meter=>meter*BARS[meter];
export const beatsOf=items=>items.reduce((a,it)=>a+TYPES[it.type].beats,0);

// Items → individual sounds (ti-ti and tam-ti are two sounds each).
export function partsOf(items){
  const out=[];
  items.forEach((it,ii)=>{let p=it.start;TYPES[it.type].parts.forEach((pt,k)=>{out.push({type:it.type,ii,k,start:p,d:pt.d,s:pt.s,rest:!!pt.rest});p+=pt.d;});});
  return out;
}

export function pick(c,rng=Math.random){const sum=c.reduce((a,t)=>a+W8[t],0);let r=rng()*sum;for(const t of c){r-=W8[t];if(r<=0)return t;}return c[c.length-1];}

// Fills every bar exactly. Never starts with a rest, never two rests in a row,
// a piece never crosses a bar line, ta-a-a-a only at the start of a bar.
// Up to 40 tries to also get a "good" line (has the level's new piece, does not end on a rest).
export function genItems({meter,level,rng=Math.random}){
  const allowed=LEVELS[level];let best=null;
  for(let tries=0;tries<40;tries++){
    const items=[];let pos=0;
    for(let b=0;b<BARS[meter];b++){
      let left=meter;
      while(left>0){
        const inBar=meter-left;
        let c=allowed.filter(t=>TYPES[t].beats<=left).filter(t=>t!=='taaaa'||inBar===0);
        if(pos===0)c=c.filter(t=>t!=='rest');
        const prev=items[items.length-1];
        if(prev&&prev.type==='rest')c=c.filter(t=>t!=='rest');
        const t=pick(c,rng);items.push({type:t,start:pos});pos+=TYPES[t].beats;left-=TYPES[t].beats;
      }
    }
    const ty=new Set(items.map(i=>i.type));
    const ok=(level<2||ty.has('titi'))&&(level<3||ty.has('tamti'))&&items.length>=4&&items[items.length-1].type!=='rest';
    best=items;if(ok)break;
  }
  return best;
}

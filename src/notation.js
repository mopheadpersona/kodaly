// Rhythm notation as SVG strings: data in, markup out. No DOM access.
import {TYPES,BARS,beatsOf} from './rhythm.js';

// One piece (ta, ti-ti, …) on the one-line staff. xs: x of each sound, idx: index of each sound in the line.
export function svgItem(type,xs,ly,st,sc,idx,gr){
  const sx=x=>x+5.7*sc;
  const stem=x=>`<line class="stem" x1="${sx(x)}" y1="${ly-1}" x2="${sx(x)}" y2="${ly-st}"/>`;
  const head=(x,filled,bh)=>`<ellipse class="${filled?'nf':'nh'}" cx="${x}" cy="${ly}" rx="${(bh?7.4:6.3)*sc}" ry="${(bh?5:4.4)*sc}" transform="rotate(-20 ${x} ${ly})"/>`;
  const dot=x=>`<circle class="nf" cx="${x+12*sc}" cy="${ly-3.5*sc}" r="${2*sc}"/>`;
  const g=(k,inner)=>{const gg=gr&&gr[idx[k]];return `<g class="pt${gg?' '+gg:''}" data-i="${idx[k]}">${inner}</g>`;};
  switch(type){
    case 'ta': return g(0,head(xs[0],1)+stem(xs[0]));
    case 'titi': return g(0,head(xs[0],1)+stem(xs[0]))+g(1,head(xs[1],1)+stem(xs[1]))+`<rect class="nf" x="${sx(xs[0])-.75}" y="${ly-st}" width="${sx(xs[1])-sx(xs[0])+1.5}" height="${4.2*sc}"/>`;
    case 'taa': return g(0,head(xs[0],0)+stem(xs[0]));
    case 'taaa': return g(0,head(xs[0],0)+stem(xs[0])+dot(xs[0]));
    case 'taaaa': return g(0,head(xs[0],0,1));
    case 'rest': {const x=xs[0],k=sc;return g(0,`<path class="restg" d="M${x-2.5*k} ${ly-13*k} L${x+3*k} ${ly-6.5*k} L${x-2*k} ${ly-.5*k} L${x+3.5*k} ${ly+5.5*k} Q${x-4.5*k} ${ly+3*k} ${x-1*k} ${ly+11*k}"/>`);}
    case 'tamti': {const fx=sx(xs[1]);return g(0,head(xs[0],1)+stem(xs[0])+dot(xs[0]))+g(1,head(xs[1],1)+stem(xs[1])+`<path class="flag" d="M${fx} ${ly-st} c${.6*sc} ${5*sc} ${8*sc} ${7*sc} ${6.2*sc} ${15*sc}"/>`);}
  }
  return '';
}

// Layout for a line: W — strip width in px, T — beats in the line, view — 'notes' or 'bars'.
export function geo(W,T,view){
  const ppb=W/T,notes=view==='notes';
  if(notes){
    const sc=Math.min(1.35,Math.max(1,ppb/30));
    const ly=66;
    return {W,T,ppb,notes,sc,off:Math.min(11*sc,ppb*.24),ly,st:Math.min(40,30*sc),H:114,sylY:ly+40,fs:Math.max(13,Math.min(17,ppb*.4)),tick:[ly+12,ly+22],bl:16*sc};
  }
  return {W,T,ppb,notes,sc:1,off:Math.min(11,ppb*.22),ly:56,st:28,H:150,by:80,bh:24,sylY:124,fs:Math.max(12,Math.min(15,ppb*.36)),tick:[76,108],bl:16};
}

// A whole line. showSlots: draw empty dashed slots for beats not filled yet (only when nothing plays).
export function rowSvg(row,G,{isNext,endless,meter,showSlots}){
  const {W,T,ppb,notes,sc,off,ly,st,H,bl}=G;const P=row.P;
  let s=`<svg class="row${isNext?' next':''}" data-row="${row.id}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${isNext?'Дальше':'Ритм'}: ${P.map(p=>p.s).join(', ')}">`;
  s+=`<line class="staff" x1="0" y1="${ly}" x2="${W}" y2="${ly}"/>`;
  for(let b=1;b<BARS[meter];b++){
    const x=b*meter*ppb;
    s+=`<line class="bar" x1="${x}" y1="${ly-bl}" x2="${x}" y2="${ly+bl}"/>`;
    if(!notes)s+=`<line class="barsoft" x1="${x}" y1="${G.by-6}" x2="${x}" y2="${G.by+G.bh+6}"/>`;
  }
  if(endless)s+=`<line class="bar" x1="${W-1}" y1="${ly-bl}" x2="${W-1}" y2="${ly+bl}"/>`;
  else s+=`<line class="bar" x1="${W-6.5}" y1="${ly-bl}" x2="${W-6.5}" y2="${ly+bl}"/><line class="bar-end" x1="${W-2}" y1="${ly-bl}" x2="${W-2}" y2="${ly+bl}"/>`;
  for(let k=0;k<T;k++){const n=k%meter;s+=`<text class="cnt${n===0?' one':''}" x="${k*ppb+off}" y="16" text-anchor="middle">${n+1}</text>`;}
  P.forEach(p=>{if(p.start%1===.5)s+=`<text class="cnt" x="${p.start*ppb+off}" y="16" text-anchor="middle">и</text>`;});
  row.items.forEach((it,ii)=>{
    const idx=[],xs=[];P.forEach((p,i)=>{if(p.ii===ii){idx.push(i);xs.push(p.start*ppb+off);}});
    s+=svgItem(it.type,xs,ly,st,sc,idx,row.grades);
  });
  const fs=G.fs.toFixed(1);
  P.forEach((p,i)=>{
    if(!notes){const x=p.start*ppb+2,w=Math.max(4,p.d*ppb-4);s+=`<rect class="blk${p.rest?' rest':''}" data-i="${i}" x="${x}" y="${G.by}" width="${w}" height="${G.bh}" rx="6"/>`;}
    s+=`<text class="syl${p.rest?' rest':''}" x="${p.start*ppb+(notes?Math.max(1,off-6*sc):3)}" y="${G.sylY}" font-size="${fs}">${p.s}</text>`;
  });
  if(showSlots){for(let k=beatsOf(row.items);k<T;k++){
    if(notes)s+=`<rect class="slot" x="${k*ppb+3}" y="${ly-20}" width="${Math.max(4,ppb-6)}" height="34" rx="6"/>`;
    else s+=`<rect class="slot" x="${k*ppb+2}" y="${G.by}" width="${Math.max(4,ppb-4)}" height="${G.bh}" rx="6"/>`;
  }}
  if(!notes)Object.keys(row.grades).forEach(i=>{s+=`<circle class="g-${row.grades[i]}" cx="${P[i].start*ppb+off}" cy="${H-6}" r="4.5"/>`;});
  s+='<g class="ticks">';
  row.ticks.forEach(t=>{s+=tickStr(t,G);});
  s+='</g>';
  if(!notes&&!isNext)s+=`<line class="ph" x1="0" y1="22" x2="0" y2="${G.by+G.bh+4}" visibility="hidden"/>`;
  return s+'</svg>';
}

// A tap mark on the line.
export function tickStr(t,G){const x=Math.max(1,Math.min(G.W-1,t.pos*G.ppb));return `<line class="tick${t.extra?' extra':''}" x1="${x}" x2="${x}" y1="${G.tick[0]}" y2="${G.tick[1]}"/>`;}

// Small picture on a piece button in "Build your own".
export function chipSvg(t){
  const pp=26,off=9,W=TYPES[t].beats*pp+4,ly=28,st=21;let p=0;const xs=[],idx=[];let blocks='';
  TYPES[t].parts.forEach((pt,k)=>{xs.push(p*pp+off);idx.push(k);blocks+=`<rect class="blk${pt.rest?' rest':''}" x="${p*pp+1.5}" y="44" width="${pt.d*pp-3}" height="9" rx="3"/>`;p+=pt.d;});
  return `<svg width="${W}" height="56" viewBox="0 0 ${W} 56" aria-hidden="true"><line class="staff" x1="0" y1="${ly}" x2="${W}" y2="${ly}"/>${svgItem(t,xs,ly,st,1,idx,null)}${blocks}</svg>`;
}

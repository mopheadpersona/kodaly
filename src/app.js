// Entry point: state, screen, sound, buttons.
import {TYPES,LABEL,CHIP_ORDER,totalBeats,beatsOf,partsOf,genItems} from './rhythm.js';
import {gradeOf,windowAt,findMatch} from './grading.js';
import {geo,rowSvg,tickStr,chipSvg} from './notation.js';
import {plural} from './i18n.js';

const $=id=>document.getElementById(id);
const WORDS=['раз','два','три','четыре'];
const NUM=['','','два','три','четыре'];
const NS='http://www.w3.org/2000/svg';

/* ---------- state ---------- */
const S={meter:2,level:1,bpm:60,view:'notes',endless:false,tapSnd:false,items:[],custom:false,lastRow:null};
try{
  const sv=JSON.parse(localStorage.getItem('tatiti')||'{}');
  if([2,3,4].includes(sv.meter))S.meter=sv.meter;
  if([1,2,3].includes(sv.level))S.level=sv.level;
  if(sv.bpm>=40&&sv.bpm<=120)S.bpm=sv.bpm;
  if(sv.view==='notes'||sv.view==='bars')S.view=sv.view;
  if(typeof sv.endless==='boolean')S.endless=sv.endless;
  if(typeof sv.tapSnd==='boolean')S.tapSnd=sv.tapSnd;
}catch(e){}
function save(){try{localStorage.setItem('tatiti',JSON.stringify({meter:S.meter,level:S.level,bpm:S.bpm,view:S.view,endless:S.endless,tapSnd:S.tapSnd}))}catch(e){}}

const stripEl=$('strip'),stage=$('stage'),big=$('big'),hint=$('hint'),dotsEl=$('dots'),explain=$('explain');
const btnListen=$('listen'),btnTap=$('tapBtn'),btnFresh=$('fresh'),bpmIn=$('bpm'),bpmOut=$('bpmOut'),btnEndless=$('endless');
const chipsEl=$('chips'),leftEl=$('left'),undoBtn=$('undo'),clearBtn=$('clear');
const meterBtns=[...document.querySelectorAll('.mbtn')],lvBtns=[...document.querySelectorAll('[data-l]')],viewBtns=[...document.querySelectorAll('[data-v]')];

const total=()=>totalBeats(S.meter);
const used=()=>beatsOf(S.items);
let rowSeq=0;
function newRow(items){return {id:++rowSeq,items,P:partsOf(items),grades:{},ticks:[],start:0};}

function makeRhythm(){S.items=genItems({meter:S.meter,level:S.level});S.custom=false;clearMarks();}
function clearMarks(){S.lastRow=null;}
function nextItems(){return S.custom?S.items.map(x=>({...x})):genItems({meter:S.meter,level:S.level});}

/* ---------- notation on screen ---------- */
let run=null;
let refs={G:null,curSvg:null,ph:null,active:-1,onEls:[]};
function shownRows(){
  if(run)return [run.rows[run.cur],run.endless?run.rows[run.cur+1]:null];
  return [S.lastRow||newRow(S.items),null];
}
function renderStrip(){
  const G=geo(Math.round(stripEl.clientWidth)||640,total(),S.view),[a,b]=shownRows(),endless=run?run.endless:S.endless;
  const opts={endless,meter:S.meter,showSlots:!run};
  let html=rowSvg(a,G,{...opts,isNext:false});
  if(b)html+=`<div class="nextlab">Дальше</div>`+rowSvg(b,G,{...opts,isNext:true});
  stripEl.innerHTML=html;
  refs.G=G;refs.curSvg=stripEl.querySelector(`svg[data-row="${a.id}"]`);
  refs.ph=refs.curSvg?refs.curSvg.querySelector('.ph'):null;refs.active=-1;refs.onEls=[];
}
function svgOf(row){return stripEl.querySelector(`svg[data-row="${row.id}"]`);}
function gradeDom(row,i,g){
  const sv=svgOf(row);if(!sv)return;
  const pt=sv.querySelector(`.pt[data-i="${i}"]`);if(pt)pt.classList.add(g);
  const G=refs.G;
  if(G&&!G.notes){const c=document.createElementNS(NS,'circle');c.setAttribute('class','g-'+g);c.setAttribute('cx',row.P[i].start*G.ppb+G.off);c.setAttribute('cy',G.H-6);c.setAttribute('r',4.5);sv.appendChild(c);}
}
function tickDom(row,t){
  const sv=svgOf(row);if(!sv||!refs.G)return;
  const g=sv.querySelector('.ticks');if(g)g.insertAdjacentHTML('beforeend',tickStr(t,refs.G));
}
function highlight(i){
  if(refs.active===i)return;
  refs.onEls.forEach(e=>e.classList.remove('on'));refs.onEls=[];
  if(i>=0&&refs.curSvg){refs.onEls=[...refs.curSvg.querySelectorAll(`[data-i="${i}"]`)];refs.onEls.forEach(e=>e.classList.add('on'));}
  refs.active=i;
}
function showPh(pos){
  if(!refs.ph)return;
  if(pos==null){refs.ph.setAttribute('visibility','hidden');return;}
  const x=pos*refs.G.ppb;refs.ph.setAttribute('x1',x);refs.ph.setAttribute('x2',x);refs.ph.setAttribute('visibility','visible');
}

/* ---------- stage ---------- */
function renderDots(){dotsEl.innerHTML='';for(let i=0;i<S.meter;i++){const d=document.createElement('span');d.className='dot'+(i===0?' one':'');dotsEl.appendChild(d);}}
let lastStage='';
function setStage(text,beatIdx,cls){
  const key=text+'|'+beatIdx+'|'+cls;if(key===lastStage)return;lastStage=key;
  big.textContent=text;big.className='big'+(cls?' '+cls:'');
  [...dotsEl.children].forEach((d,i)=>d.classList.toggle('on',i===beatIdx));
}
function idle(text,h,cls){lastStage='';setStage(text,-1,cls||'dim');hint.textContent=h;}
let flashT=0;
function flash(g){
  stage.classList.remove('hit','hit-good','hit-ok','hit-miss');
  void stage.offsetWidth;
  stage.classList.add(g?'hit-'+g:'hit');
  clearTimeout(flashT);flashT=setTimeout(()=>stage.classList.remove('hit','hit-good','hit-ok','hit-miss'),110);
}
function renderExplain(){explain.innerHTML=`<b>${S.meter}/4</b> — в такте ${NUM[S.meter]} «та». Такт — кусок между вертикальными чертами. Нижняя 4 значит, что «та» — это четверть: чёрная нота с палочкой.`;}

/* ---------- audio ---------- */
let ctx=null,master=null;
function ensureAudio(){
  if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();master=ctx.createGain();master.gain.value=.9;master.connect(ctx.destination);}
  if(ctx.state==='suspended')ctx.resume();
  return true;
}
function track(o){if(!run)return;const r=run;r.nodes.add(o);o.onended=()=>r.nodes.delete(o);}
function click(t,accent,vol){
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.type='sine';o.frequency.value=accent?1760:1320;
  const peak=(accent?.34:.22)*vol;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.045);
  o.connect(g).connect(master);o.start(t);o.stop(t+.06);track(o);
}
function tone(t,dur){
  const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=1600;f.Q.value=.3;
  const g=ctx.createGain(),g2=ctx.createGain();g2.gain.value=.35;
  const o1=ctx.createOscillator(),o2=ctx.createOscillator();
  o1.type='triangle';o1.frequency.value=220;o2.type='sine';o2.frequency.value=440;o2.detune.value=7;
  o1.connect(f);o2.connect(g2).connect(f);f.connect(g).connect(master);
  const end=t+Math.max(.08,dur-.05);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.008);g.gain.setTargetAtTime(.11,t+.008,.12);g.gain.setTargetAtTime(0,end,.035);
  o1.start(t);o2.start(t);o1.stop(end+.3);o2.stop(end+.3);track(o1);track(o2);
}
function tapSound(){
  const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
  o.type='sine';o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(170,t+.06);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.5,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.11);
  o.connect(g).connect(master);o.start(t);o.stop(t+.13);
}
function hardStop(){if(run)run.nodes.forEach(o=>{try{o.stop()}catch(e){}});run=null;}

/* ---------- playing ---------- */
function setRunningUI(mode){
  btnListen.textContent=mode==='listen'?'Стоп':'Слушать';
  btnTap.textContent=mode==='tap'?'Стоп':'Стучать';
  btnListen.disabled=mode==='tap';btnTap.disabled=mode==='listen';
  btnFresh.disabled=!!mode;bpmIn.disabled=!!mode;btnEndless.disabled=!!mode;
  meterBtns.forEach(b=>b.disabled=!!mode);lvBtns.forEach(b=>b.disabled=!!mode);
  stage.classList.toggle('armed',mode==='tap');
  updateChips();
}

// Schedules the whole line ahead on the audio clock.
function scheduleRow(row){
  const b=run.beat;
  for(let i=0;i<run.T;i++)click(row.start+i*b,i%S.meter===0,run.vol);
  row.P.forEach((p,i)=>{
    if(p.rest)return;
    if(run.mode==='listen')tone(row.start+p.start*b,p.d*b);
    else run.onsets.push({t:row.start+p.start*b,row,i,graded:false});
  });
}
function addRow(){const last=run.rows[run.rows.length-1];const r=newRow(nextItems());r.start=last.start+run.rowDur;run.rows.push(r);scheduleRow(r);}

function start(mode){
  if(used()<total()){hint.textContent='Сначала дособери такты: осталось '+plural(total()-used())+'.';return;}
  if(!ensureAudio()){hint.textContent='Этот браузер не умеет играть звук.';return;}
  hardStop();clearMarks();
  const beat=60/S.bpm,lat=(ctx.outputLatency||ctx.baseLatency||0),T=total();
  const t0=ctx.currentTime+.15;
  run={mode,beat,lat,T,rowDur:T*beat,endless:S.endless,rows:[],cur:0,onsets:[],oi:0,nodes:new Set(),vol:mode==='listen'?.6:1,stats:{good:0,ok:0,miss:0,extra:0,sum:0,cnt:0}};
  for(let i=0;i<S.meter;i++)click(t0+i*beat,i===0,run.vol);
  const r0=newRow(S.items.map(x=>({...x})));r0.start=t0+S.meter*beat;run.rows.push(r0);scheduleRow(r0);
  if(run.endless)addRow();
  setRunningUI(mode);renderStrip();
  if(mode==='listen')hint.textContent=run.endless?'Первый такт — счёт. Дальше ритмы идут без остановки, проговаривай вместе со звуком.':'Первый такт — счёт. Потом проговаривай слоги вместе со звуком.';
  else hint.textContent=run.endless?'Первый такт — счёт. Стучи пробелом, Enter или по площадке. Ритмы идут без остановки, следующая строчка видна заранее. Esc — стоп.':'Первый такт — счёт. Потом стучи начало каждой ноты: пробел, Enter или по площадке.';
  if(mode==='tap'){try{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();}catch(e){}stage.focus({preventScroll:true});}
  requestAnimationFrame(frame);
}

function applyGrade(o,g,d){
  o.graded=true;o.row.grades[o.i]=g;run.stats[g]++;
  if(g!=='miss'){run.stats.sum+=d;run.stats.cnt++;}
  gradeDom(o.row,o.i,g);
}
// Notes whose window has passed without a tap become misses.
function sweep(now){
  const os=run.onsets;
  while(run.oi<os.length){
    const o=os[run.oi];
    if(o.graded){run.oi++;continue;}
    if(o.t+windowAt(os,run.oi)<now){applyGrade(o,'miss',0);run.oi++;}else break;
  }
}
function matchTap(t){
  const m=findMatch(run.onsets,run.oi,t);
  if(!m)return null;
  const o=run.onsets[m.index],g=gradeOf(m.delta);
  applyGrade(o,g,m.delta);return {o,g};
}
function rowAt(t){
  const b=run.beat;
  for(const r of run.rows){if(t>=r.start-.5*b&&t<r.start+run.rowDur-.5*b)return r;}
  return run.rows[run.rows.length-1];
}

function frame(){
  if(!run)return;
  const now=ctx.currentTime-run.lat;
  if(run.mode==='tap')sweep(now);
  let row=run.rows[run.cur];
  if(run.endless){
    let moved=false;
    while(now>=row.start+run.rowDur){run.cur++;addRow();row=run.rows[run.cur];moved=true;}
    if(moved)renderStrip();
  }else if(now>=row.start+run.rowDur+.3){finish();return;}
  const pos=(now-row.start)/run.beat;
  if(pos<0){
    const cb=Math.floor(pos+S.meter);
    if(cb>=0)setStage(WORDS[cb],cb,'count');
    showPh(null);
  }else if(pos<run.T){
    const bi=Math.floor(pos)%S.meter;showPh(pos);
    if(run.mode==='listen'){
      const i=row.P.findIndex(p=>pos>=p.start&&pos<p.start+p.d);highlight(i);
      const p=row.P[i];if(p)setStage(p.s,bi,p.rest?'rest':'');
    }else{
      const st=run.stats,gr=st.good+st.ok+st.miss;
      setStage(gr?`${st.good+st.ok} из ${gr}`:'стучи',bi,gr?'':'count small');
    }
  }else{showPh(null);highlight(-1);}
  requestAnimationFrame(frame);
}

function finish(){
  const r=run;hardStop();setRunningUI(null);
  if(r.mode==='tap'){S.lastRow=r.rows[0];renderStrip();summary(r.stats,false);}
  else{renderStrip();idle('Твой ход','Нажми «Стучать» и повтори этот ритм сам.','dim small');}
}
function userStop(){
  const r=run;if(!r)return;
  if(r.mode==='tap')sweep(ctx.currentTime-r.lat);
  hardStop();setRunningUI(null);
  const row=r.rows[r.cur];
  if(r.endless&&!S.custom)S.items=row.items;
  if(r.mode==='tap'){S.lastRow=r.endless?row:r.rows[0];renderStrip();summary(r.stats,r.endless);}
  else{clearMarks();renderStrip();idle('та','Остановлено. Можно начать заново или взять новый ритм.');}
}
function summary(st,endless){
  const n=st.good+st.ok+st.miss;
  if(!n&&!st.extra){idle('Тишина','Стучи по площадке или пробелом, когда пойдёт ритм.','dim small');return;}
  let h=(st.good===n&&!st.extra)?`Все ${n} в точку.`:`В точку ${st.good}, почти ${st.ok}, мимо ${st.miss}. Зелёные ноты — в точку, жёлтые — почти, красные — мимо.`;
  if(st.extra)h+=` Лишних ударов: ${st.extra}.`;
  if(st.cnt>=3){const m=st.sum/st.cnt;
    if(m>.06)h+=` В среднем ты позже щелчка на ${Math.round(m*1000)} мс. В Bluetooth-наушниках часть этого — их задержка.`;
    else if(m<-.06)h+=` Ты чуть спешишь: в среднем на ${Math.round(-m*1000)} мс раньше.`;}
  if(!endless)h+=' Дальше — «Новый ритм» или режим «Без конца».';
  lastStage='';setStage(`${st.good+st.ok} из ${n}`,-1,'');hint.textContent=h;
}

/* ---------- builder ---------- */
function renderChips(){
  chipsEl.innerHTML='';
  CHIP_ORDER.forEach(t=>{
    if(TYPES[t].beats>S.meter)return;
    const b=document.createElement('button');b.type='button';b.className='chip';b.id='chip-'+t;b.dataset.t=t;
    b.setAttribute('aria-label',`Добавить: ${LABEL[t]}, ${plural(TYPES[t].beats)}`);
    b.innerHTML=chipSvg(t)+`<span class="s">${LABEL[t]}</span>`;
    b.addEventListener('click',()=>addPiece(t));chipsEl.appendChild(b);
  });
  updateChips();
}
function updateChips(){
  const u=used(),T=total(),left=S.meter-(u%S.meter);
  [...chipsEl.children].forEach(b=>{const t=b.dataset.t;b.disabled=!!run||(S.custom&&(u>=T||TYPES[t].beats>left));});
  undoBtn.disabled=!!run||!S.custom||!S.items.length;
  clearBtn.disabled=!!run||(S.custom&&!S.items.length);
  if(!S.custom)leftEl.textContent='Сейчас на дорожке случайный ритм.';
  else leftEl.textContent=u<T?`Осталось ${plural(T-u)}.`:'Готово, жми «Слушать» или «Стучать».';
}
function addPiece(t){
  if(run)return;
  if(!S.custom){S.items=[];S.custom=true;}
  clearMarks();
  const u=used(),T=total(),left=S.meter-(u%S.meter);
  if(u>=T||TYPES[t].beats>left)return;
  S.items.push({type:t,start:u});
  renderStrip();updateChips();
  if(used()===T)idle('Готово','Твой ритм. Послушай, как он звучит, или сразу стучи.','dim small');
  else idle(LABEL[t],'Добавлено. Собирай дальше.','dim');
}

/* ---------- wiring ---------- */
function syncControls(){
  meterBtns.forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.m===S.meter)));
  lvBtns.forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.l===S.level)));
  viewBtns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===S.view)));
  btnEndless.setAttribute('aria-pressed',String(S.endless));
  $('tapSnd').setAttribute('aria-pressed',String(S.tapSnd));
  bpmIn.value=S.bpm;bpmOut.textContent=S.bpm;
}
meterBtns.forEach(b=>b.addEventListener('click',()=>{
  if(run)return;S.meter=+b.dataset.m;save();syncControls();renderDots();renderExplain();
  makeRhythm();renderStrip();renderChips();
  idle('та',`Теперь ${S.meter}/4: в каждом такте ${NUM[S.meter]} щелчка. Нажми «Слушать».`);
}));
lvBtns.forEach(b=>b.addEventListener('click',()=>{
  if(run)return;S.level=+b.dataset.l;save();syncControls();
  makeRhythm();renderStrip();updateChips();
  idle('та',S.level===1?'Только длинные и короткие ноты и паузы.':S.level===2?'Добавились ти-ти: два звука на один щелчок.':'Добавились там-ти: длинный звук и короткий, на два щелчка.');
}));
viewBtns.forEach(b=>b.addEventListener('click',()=>{S.view=b.dataset.v;save();syncControls();renderStrip();}));
btnEndless.addEventListener('click',()=>{
  if(run)return;S.endless=!S.endless;save();syncControls();renderStrip();
  idle('та',S.endless?(S.custom?'Твой ритм будет крутиться по кругу, пока не нажмёшь «Стоп».':'Ритмы пойдут подряд без остановки, следующая строчка видна заранее.'):'Один ритм и стоп, потом оценка.');
});
$('tapSnd').addEventListener('click',()=>{S.tapSnd=!S.tapSnd;save();syncControls();});
bpmIn.addEventListener('input',()=>{S.bpm=+bpmIn.value;bpmOut.textContent=S.bpm;save();});
btnListen.addEventListener('click',()=>{if(run&&run.mode==='listen')userStop();else start('listen');});
btnTap.addEventListener('click',()=>{if(run&&run.mode==='tap')userStop();else start('tap');});
btnFresh.addEventListener('click',()=>{if(run)return;makeRhythm();renderStrip();updateChips();idle('та','Новый случайный ритм. Сначала послушай или сразу стучи.');});
undoBtn.addEventListener('click',()=>{if(run||!S.custom)return;S.items.pop();clearMarks();renderStrip();updateChips();idle('та','Последний кусочек убран.');});
clearBtn.addEventListener('click',()=>{if(run)return;S.items=[];S.custom=true;clearMarks();renderStrip();updateChips();idle('та','Дорожка пустая. Нажимай кусочки внизу.');});

function tap(){
  if(!ensureAudio())return;
  if(S.tapSnd)tapSound();
  if(!(run&&run.mode==='tap')){flash('');return;}
  const t=ctx.currentTime-run.lat;
  if(t<run.rows[0].start-.5*run.beat){flash('');return;}
  const m=matchTap(t);
  let row,extra;
  if(m){row=m.o.row;extra=false;flash(m.g);}
  else{row=rowAt(t);extra=true;run.stats.extra++;flash('miss');}
  const pos=(t-row.start)/run.beat;
  if(pos>-.7&&pos<run.T+.5){const tk={pos,extra};row.ticks.push(tk);tickDom(row,tk);}
}
stage.addEventListener('pointerdown',e=>{e.preventDefault();tap();});
const isTapKey=e=>e.code==='Space'||e.key===' '||e.key==='Spacebar'||e.key==='Enter'||e.code==='Enter'||e.code==='NumpadEnter';
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&run){userStop();return;}
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(run&&run.mode==='tap'){
    if(isTapKey(e)||(e.key&&e.key.length===1)){e.preventDefault();e.stopPropagation();if(!e.repeat)tap();}
    return;
  }
  const tg=e.target,onCtl=tg&&tg.closest&&tg.closest('button,input,select,textarea');
  if(isTapKey(e)&&!onCtl){e.preventDefault();if(!e.repeat)tap();}
},true);
window.addEventListener('keyup',e=>{if(run&&run.mode==='tap'&&isTapKey(e)){e.preventDefault();e.stopPropagation();}},true);

let rz=0;
if('ResizeObserver' in window){new ResizeObserver(()=>{cancelAnimationFrame(rz);rz=requestAnimationFrame(renderStrip);}).observe(stripEl);}
else window.addEventListener('resize',renderStrip);

syncControls();renderDots();renderExplain();makeRhythm();renderStrip();renderChips();
idle('та','Нажми «Слушать», а потом «Стучать» и повтори сам.');

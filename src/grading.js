// Tap grading. Times are in seconds. Pure functions: no DOM, no audio.

export const GOOD=.07;         // up to 70 ms off: on the beat
export const OK=.15;           // up to 150 ms off: close; further: miss
export const MAX_WINDOW=.28;   // a tap is matched to a note at most 280 ms away...
export const WINDOW_SHARE=.48; // ...and at most 48% of the gap to the neighbouring note
const LOOK_AHEAD=.35;          // notes further ahead than this are not searched

export function gradeOf(delta){const a=Math.abs(delta);return a<=GOOD?'good':a<=OK?'ok':'miss';}

// Search window around note i. onsets: [{t, graded}] sorted by time.
export function windowAt(onsets,i){
  const prev=i>0?onsets[i].t-onsets[i-1].t:9,next=i<onsets.length-1?onsets[i+1].t-onsets[i].t:9;
  return Math.min(MAX_WINDOW,WINDOW_SHARE*Math.min(prev,next));
}

// Closest ungraded note (from index `from` on) whose window holds a tap at time t.
// Returns {index, delta} (delta > 0: tap was late) or null.
export function findMatch(onsets,from,t){
  let best=-1,bd=0;
  for(let i=from;i<onsets.length;i++){
    const o=onsets[i];if(o.t-t>LOOK_AHEAD)break;if(o.graded)continue;
    const w=windowAt(onsets,i),d=t-o.t;
    if(Math.abs(d)<=w&&(best<0||Math.abs(d)<Math.abs(bd))){best=i;bd=d;}
  }
  return best<0?null:{index:best,delta:bd};
}

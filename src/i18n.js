// All texts in two languages. English is the default.
// Strings may hold {name} placeholders; t('key', {name: value}) fills them.

export const LANGS=['en','ru'];
let lang='en';
export const getLang=()=>lang;
export function setLang(l){if(LANGS.includes(l))lang=l;}

const D={
  en:{
    title:'Ta-ti-ti',
    lead:'Rhythm as a toy: listen, tap it yourself, build your own. One metronome click is one “ta”.',
    langLabel:'Language',
    meterLabel:'Time signature',
    meterBtn:'Time signature {m}/4',
    explain:'<b>{m}/4</b>: each bar holds {num} “ta”. A bar is the stretch between two vertical lines. The bottom 4 means “ta” is a quarter note: a black note with a stem.',
    num:['','','two','three','four'],
    scoreLabel:'Rhythm',
    caption:'Notes on one line, like in the book. The “With blocks” view also shows how long each sound lasts, like the piano roll in GarageBand. Numbers are the count; “&” falls exactly between clicks.',
    padLabel:'Tap pad',
    controlsLabel:'Controls',
    listen:'Listen',tap:'Tap',stop:'Stop',fresh:'New rhythm',
    tempo:'Tempo',perMin:'clicks per minute',
    mode:'Mode',endless:'Endless',tapSnd:'Tap sound',
    view:'View',vNotes:'Notes only',vBars:'With blocks',
    rhythms:'Rhythms',lv1:'No ti-ti',lv2:'With ti-ti',lv3:'With tam-ti',
    fine:'On iPhone, turn off silent mode, or there will be no sound. On a computer, tap with Space or Enter; Esc stops.',
    buildH:'Build your own',
    buildNote:'Tap the pieces and they fill the bars in order. The longer the piece, the longer it sounds. The first tap clears the track. With “Endless”, your rhythm loops.',
    undo:'Remove last',clear:'Clear',
    rowNow:'Rhythm',rowNext:'Next',
    and:'&',
    count:['one','two','three','four'],
    syl:{ta:'ta',ti:'ti',taa:'ta-a',taaa:'ta-a-a',taaaa:'ta-a-a-a',sh:'sh',tam:'tam'},
    piece:{ta:'ta',titi:'ti-ti',taa:'ta-a',taaa:'ta-a-a',taaaa:'ta-a-a-a',rest:'rest',tamti:'tam-ti'},
    clicks:{one:'click',other:'clicks'},
    needFill:'Fill the bars first: {left} left.',
    noAudio:'This browser can’t play sound.',
    listenEndless:'The first bar is a count-in. Then rhythms keep coming without a break; say them along with the sound.',
    listenOnce:'The first bar is a count-in. Then say the syllables along with the sound.',
    tapEndless:'The first bar is a count-in. Tap with Space, Enter or on the pad. Rhythms keep coming; the next line shows in advance. Esc stops.',
    tapOnce:'The first bar is a count-in. Then tap the start of each note: Space, Enter or the pad.',
    tapNow:'tap',
    score:'{a} of {n}',
    yourTurn:'Your turn',
    yourTurnHint:'Press “Tap” and play this rhythm back yourself.',
    stopped:'Stopped. Start again or get a new rhythm.',
    silence:'Silence',
    silenceHint:'Tap the pad or press Space once the rhythm starts.',
    allGood:'All {n} on the beat.',
    tally:'On the beat {good}, close {ok}, missed {miss}. Green notes are on the beat, yellow are close, red are missed.',
    extra:' Extra taps: {n}.',
    late:' On average you are {ms} ms behind the click. With Bluetooth headphones, part of that is their delay.',
    early:' You are rushing a little: {ms} ms early on average.',
    nextStep:' Next: “New rhythm” or “Endless”.',
    addPiece:'Add: {piece}, {len}',
    randomOnTrack:'A random rhythm is on the track now.',
    left:'{left} left.',
    ready:'Done. Press “Listen” or “Tap”.',
    done:'Done',
    doneHint:'Your rhythm. Listen to how it sounds, or tap right away.',
    added:'Added. Keep going.',
    meterNow:'Now {m}/4: {num} clicks in each bar. Press “Listen”.',
    lvHint1:'Just long and short notes, and rests.',
    lvHint2:'Now with ti-ti: two sounds on one click.',
    lvHint3:'Now with tam-ti: a long sound and a short one, across two clicks.',
    endlessCustom:'Your rhythm will loop until you press “Stop”.',
    endlessRandom:'Rhythms will run back to back; the next line shows in advance.',
    endlessOff:'One rhythm, then a stop and your score.',
    freshHint:'A new random rhythm. Listen first, or tap right away.',
    undone:'Last piece removed.',
    cleared:'The track is empty. Tap the pieces below.',
    startHint:'Press “Listen”, then “Tap” and play it back yourself.'
  },
  ru:{
    title:'Та-ти-ти',
    lead:'Ритм как игрушка: послушай, постучи сам, собери свой. Один щелчок метронома — одно «та».',
    langLabel:'Язык',
    meterLabel:'Размер',
    meterBtn:'Размер {m}/4',
    explain:'<b>{m}/4</b> — в такте {num} «та». Такт — кусок между вертикальными чертами. Нижняя 4 значит, что «та» — это четверть: чёрная нота с палочкой.',
    num:['','','два','три','четыре'],
    scoreLabel:'Ритм',
    caption:'Ноты на одной линейке, как в книге. Вид «с полосками» добавляет длину звука, как piano roll в GarageBand. Цифры — счёт, «и» — ровно между щелчками.',
    padLabel:'Площадка для стука',
    controlsLabel:'Управление',
    listen:'Слушать',tap:'Стучать',stop:'Стоп',fresh:'Новый ритм',
    tempo:'Темп',perMin:'щелчков в минуту',
    mode:'Режим',endless:'Без конца',tapSnd:'Звук стука',
    view:'Вид',vNotes:'Только ноты',vBars:'С полосками',
    rhythms:'Ритмы',lv1:'Без ти-ти',lv2:'С ти-ти',lv3:'С там-ти',
    fine:'На айфоне выключи беззвучный режим, иначе звука не будет. На компьютере стучи пробелом или Enter, Esc останавливает.',
    buildH:'Собери свой',
    buildNote:'Нажимай кусочки, они встанут в такты по порядку. Длина кусочка — сколько он тянется. Первое нажатие очищает дорожку. С «Без конца» твой ритм крутится по кругу.',
    undo:'Убрать последний',clear:'Очистить',
    rowNow:'Ритм',rowNext:'Дальше',
    and:'и',
    count:['раз','два','три','четыре'],
    syl:{ta:'та',ti:'ти',taa:'та-а',taaa:'та-а-а',taaaa:'та-а-а-а',sh:'ш',tam:'там'},
    piece:{ta:'та',titi:'ти-ти',taa:'та-а',taaa:'та-а-а',taaaa:'та-а-а-а',rest:'пауза',tamti:'там-ти'},
    clicks:{one:'щелчок',few:'щелчка',many:'щелчков',other:'щелчка'},
    needFill:'Сначала дособери такты: осталось {left}.',
    noAudio:'Этот браузер не умеет играть звук.',
    listenEndless:'Первый такт — счёт. Дальше ритмы идут без остановки, проговаривай вместе со звуком.',
    listenOnce:'Первый такт — счёт. Потом проговаривай слоги вместе со звуком.',
    tapEndless:'Первый такт — счёт. Стучи пробелом, Enter или по площадке. Ритмы идут без остановки, следующая строчка видна заранее. Esc — стоп.',
    tapOnce:'Первый такт — счёт. Потом стучи начало каждой ноты: пробел, Enter или по площадке.',
    tapNow:'стучи',
    score:'{a} из {n}',
    yourTurn:'Твой ход',
    yourTurnHint:'Нажми «Стучать» и повтори этот ритм сам.',
    stopped:'Остановлено. Можно начать заново или взять новый ритм.',
    silence:'Тишина',
    silenceHint:'Стучи по площадке или пробелом, когда пойдёт ритм.',
    allGood:'Все {n} в точку.',
    tally:'В точку {good}, почти {ok}, мимо {miss}. Зелёные ноты — в точку, жёлтые — почти, красные — мимо.',
    extra:' Лишних ударов: {n}.',
    late:' В среднем ты позже щелчка на {ms} мс. В Bluetooth-наушниках часть этого — их задержка.',
    early:' Ты чуть спешишь: в среднем на {ms} мс раньше.',
    nextStep:' Дальше — «Новый ритм» или режим «Без конца».',
    addPiece:'Добавить: {piece}, {len}',
    randomOnTrack:'Сейчас на дорожке случайный ритм.',
    left:'Осталось {left}.',
    ready:'Готово, жми «Слушать» или «Стучать».',
    done:'Готово',
    doneHint:'Твой ритм. Послушай, как он звучит, или сразу стучи.',
    added:'Добавлено. Собирай дальше.',
    meterNow:'Теперь {m}/4: в каждом такте {num} щелчка. Нажми «Слушать».',
    lvHint1:'Только длинные и короткие ноты и паузы.',
    lvHint2:'Добавились ти-ти: два звука на один щелчок.',
    lvHint3:'Добавились там-ти: длинный звук и короткий, на два щелчка.',
    endlessCustom:'Твой ритм будет крутиться по кругу, пока не нажмёшь «Стоп».',
    endlessRandom:'Ритмы пойдут подряд без остановки, следующая строчка видна заранее.',
    endlessOff:'Один ритм и стоп, потом оценка.',
    freshHint:'Новый случайный ритм. Сначала послушай или сразу стучи.',
    undone:'Последний кусочек убран.',
    cleared:'Дорожка пустая. Нажимай кусочки внизу.',
    startHint:'Нажми «Слушать», а потом «Стучать» и повтори сам.'
  }
};

export {D as DICT}; // for tests

// Text for a key in the current language. Arrays and maps (count, syl, …) come back as they are.
export function t(key,vars,l=lang){
  const s=D[l][key]??D.en[key];
  if(typeof s!=='string'||!vars)return s;
  return s.replace(/\{(\w+)\}/g,(m,k)=>k in vars?vars[k]:m);
}
export const syl=k=>t('syl')[k];
export const pieceName=type=>t('piece')[type];

// "1 click / 2 clicks", "1 щелчок / 2 щелчка / 5 щелчков" — Intl.PluralRules picks the form.
const rules={};
export function pluralForm(n,l=lang){return (rules[l]||(rules[l]=new Intl.PluralRules(l))).select(n);}
export function clicks(n,l=lang){const f=D[l].clicks;return n+' '+(f[pluralForm(n,l)]||f.other);}

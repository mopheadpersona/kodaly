import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DICT,LANGS,t,clicks} from '../src/i18n.js';

// The prototype's hand-written Russian plural, kept to prove nothing changed.
function prototypePlural(n){const a=n%10,b=n%100;const w=(a===1&&b!==11)?'щелчок':(a>=2&&a<=4&&(b<10||b>=20))?'щелчка':'щелчков';return n+' '+w;}

test('Russian plurals',()=>{
  const cases={1:'1 щелчок',2:'2 щелчка',4:'4 щелчка',5:'5 щелчков',11:'11 щелчков',12:'12 щелчков',21:'21 щелчок',22:'22 щелчка',25:'25 щелчков',111:'111 щелчков',112:'112 щелчков',121:'121 щелчок'};
  for(const [n,want] of Object.entries(cases))assert.equal(clicks(+n,'ru'),want);
});

test('Russian plurals match the prototype for 0–1000',()=>{
  for(let n=0;n<=1000;n++)assert.equal(clicks(n,'ru'),prototypePlural(n));
});

test('English plurals',()=>{
  assert.equal(clicks(1,'en'),'1 click');
  for(const n of [0,2,5,11,21])assert.equal(clicks(n,'en'),`${n} clicks`);
});

test('both languages have the same keys, shapes and placeholders',()=>{
  const [en,ru]=LANGS.map(l=>DICT[l]);
  assert.deepEqual(Object.keys(ru).sort(),Object.keys(en).sort());
  const holes=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
  for(const k of Object.keys(en)){
    const a=en[k],b=ru[k];
    assert.equal(typeof b,typeof a,k);
    assert.equal(Array.isArray(b),Array.isArray(a),k);
    if(typeof a==='string')assert.deepEqual(holes(b),holes(a),`placeholders in "${k}"`);
    else if(Array.isArray(a))assert.equal(b.length,a.length,k);
    else if(k!=='clicks')assert.deepEqual(Object.keys(b).sort(),Object.keys(a).sort(),k);
  }
});

test('English syllables, count and "and" are as agreed',()=>{
  assert.deepEqual(DICT.en.piece,{ta:'ta',titi:'ti-ti',taa:'ta-a',taaa:'ta-a-a',taaaa:'ta-a-a-a',rest:'rest',tamti:'tam-ti'});
  assert.equal(DICT.en.syl.sh,'sh');
  assert.deepEqual(DICT.en.count,['one','two','three','four']);
  assert.equal(DICT.en.and,'&');
});

test('Russian syllables, count and "and" stay as in the prototype',()=>{
  assert.deepEqual(DICT.ru.piece,{ta:'та',titi:'ти-ти',taa:'та-а',taaa:'та-а-а',taaaa:'та-а-а-а',rest:'пауза',tamti:'там-ти'});
  assert.equal(DICT.ru.syl.sh,'ш');
  assert.deepEqual(DICT.ru.count,['раз','два','три','четыре']);
  assert.equal(DICT.ru.and,'и');
});

test('t() fills placeholders and leaves unknown ones alone',()=>{
  assert.equal(t('score',{a:3,n:5},'en'),'3 of 5');
  assert.equal(t('score',{a:3,n:5},'ru'),'3 из 5');
  assert.equal(t('score',{a:3},'en'),'3 of {n}');
  assert.equal(t('needFill',{left:clicks(3,'ru')},'ru'),'Сначала дособери такты: осталось 3 щелчка.');
});

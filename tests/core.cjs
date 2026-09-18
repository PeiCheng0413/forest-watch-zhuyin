const assert=require('node:assert/strict');const {Game,WORDS,CHANTS,convert,display}=require('../dist/core.js');
assert.equal(convert('su3'),'ㄋㄧˇ');assert.equal(display(WORDS.find(w=>w.word==='水')),'ㄕㄨㄟˇ');assert.equal(display(WORDS.find(w=>w.word==='森林')),'ㄙㄣˉ ㄌㄧㄣˊ');
for(const w of [...WORDS,...CHANTS])assert.ok(/^[1qaz2wsxedcrfv5tgbyhnujm8ik,9ol.0p;/\-6347 ]+$/.test(w.answer),w.word);
const g=new Game(()=>.3);g.reset();const e=g.spawn();g.input='wrong';g.submit();assert.equal(g.input,'');assert.equal(g.correct,0);assert.equal(g.attempts,1);
for(let s=0;s<4;s++){g.spell=s;g.input=e.entry.answer;g.submit();assert.ok(e.effects[s]>0)}assert.equal(g.correct,4);assert.ok(e.effects.every(t=>t>0));
g.input='su';g.spawn();assert.equal(g.input,'su');g.input='s';g.changeSpell(1);assert.equal(g.input,'s');g.type('Backspace');assert.equal(g.input,'');
const prior={time:g.time,hp:g.hp,x:e.x};g.pause();g.update(.05);assert.equal(g.time,prior.time);assert.equal(g.hp,prior.hp);assert.equal(e.x,prior.x);g.pause();
g.energy=11;e.hp=0;g.update(.02);assert.equal(g.mode,'playing');assert.equal(g.energy,12);g.input='';g.tapSpace(100);g.tapSpace(300);assert.equal(g.mode,'ritual');const frozen=JSON.stringify({time:g.time,hp:g.hp,enemies:g.enemies});g.update(.05);assert.equal(JSON.stringify({time:g.time,hp:g.hp,enemies:g.enemies}),frozen);g.input=g.chant.answer;g.submit();assert.equal(g.mode,'playing');assert.equal(g.energy,0);assert.equal(g.enemies.length,0);
const hurt=new Game(()=>.5);hurt.reset();hurt.spawnIn=999;hurt.arrowIn=999;const attacker=hurt.spawn();attacker.x=600;attacker.y=387;hurt.update(.05);assert.ok(hurt.hp<100);attacker.effects[1]=4;const hp=hurt.hp;for(let i=0;i<20;i++)hurt.update(.05);assert.equal(hurt.hp,hp);hurt.hp=1;attacker.effects[1]=0;attacker.attackIn=0;hurt.update(.05);assert.equal(hurt.mode,'ended');
const poison=new Game(()=>.2);poison.reset();poison.spawnIn=999;poison.arrowIn=999;const victim=poison.spawn();victim.effects[0]=10;for(let i=0;i<110;i++)poison.update(.05);assert.ok(poison.kills>=1);assert.ok(poison.energy>=1);
const sim=new Game(()=>.7);sim.reset();let ticks=0;while(sim.mode!=='ended'&&ticks++<24000){if(sim.mode==='ritual'){sim.input=sim.chant.answer;sim.submit()}sim.update(.05)}assert.equal(sim.mode,'ended');console.log('PASS: 注音鍵位／詞庫、錯字清空、四法術並存、出生保留輸入、刪字、暫停、儀式凍結與清場、石化防傷、怪物攻塔、死亡結算。');console.log('無操作生存時間：',Math.round(sim.time),'秒');

const tone=new Game(()=>.3);tone.reset();const named=tone.spawn();named.entry=WORDS.find(w=>w.word==='山');tone.input='g0';tone.submit();assert.equal(tone.correct,0);tone.type('g');tone.type('0');tone.type(' ');assert.equal(tone.input,'g0 ');tone.type('Backspace');assert.equal(tone.input,'g0');tone.type(' ');tone.submit();assert.equal(tone.correct,1);
assert.equal(WORDS.find(w=>w.word==='天空').answer,'wu0 dj/ ');assert.equal(WORDS.find(w=>w.word==='火山').answer,'cj3g0 ');assert.equal(CHANTS.find(w=>w.word==='大地之光').answer,'2842u45 ej; ');
tone.mode='ritual';tone.chant=CHANTS.find(w=>w.word==='大地之光');tone.input=tone.chant.answer.replaceAll(' ','');tone.submit();assert.equal(tone.mode,'ritual');for(const key of tone.chant.answer)tone.type(key);tone.submit();assert.equal(tone.mode,'playing');
console.log('PASS: 一聲空白鍵必填、Backspace 刪除、雙音節與咒語聲調判定。');

assert.equal(display(WORDS.find(w=>w.word==='山')),'ㄕㄢˉ');assert.equal(display(CHANTS.find(w=>w.word==='大地之光')),'ㄉㄚˋ ㄉㄧˋ ㄓˉ ㄍㄨㄤˉ');

const assert=require('node:assert/strict');const {Game,WORDS}=require('../dist/core.js');
function setup(){const g=new Game(()=>.2);g.reset();g.spawnIn=g.arrowIn=999;const es=[0,80,100,120,121,300].map((x,i)=>{const e=g.spawn();e.x=200+x;e.y=100;e.speed=0;e.hp=1000;e.entry=WORDS[i];return e});return {g,es}}
for(const [spell,expected]of [[0,[true,true,false,false,false,false]],[1,[true,true,true,true,false,false]],[2,[true,false,false,false,false,false]]]){const {g,es}=setup();g.spell=spell;g.input=es[0].entry.answer;g.submit();assert.deepEqual(es.map(e=>e.effects[spell]>0),expected);assert.equal(g.casts,1)}
const {g,es}=setup();es[2].entry=es[0].entry;g.spell=1;g.input=es[0].entry.answer;g.submit();assert.equal(g.events.filter(e=>e.type==='cast'&&e.targetId===es[1].id).length,1);assert.equal(g.events.filter(e=>e.type==='area').length,2);assert.equal(g.casts,1);
const c=setup();const actor=c.es[0];actor.speed=20;actor.effects[3]=6;const x=actor.x;c.g.update(.05);assert.ok(Math.abs(actor.x-x-1.8)<1e-8);assert.equal(actor.speed,20);actor.effects[1]=2;const frozen=actor.x;c.g.update(.05);assert.equal(actor.x,frozen);
const solo=setup();solo.g.enemies=[solo.es[0]];solo.es[0].effects[3]=6;solo.es[0].speed=20;const sx=solo.es[0].x;solo.g.update(.05);assert.equal(solo.es[0].x,sx);
console.log('PASS: 中毒80與石化120邊界、燃燒不擴散、同名區域去重、一次計分、混亂1.8倍、石化優先、無其他目標停止。');

const assert=require('node:assert/strict');const {Game,WORDS}=require('../dist/core.js');
function setup(xs=[0,190,290,310]){const g=new Game(()=>.2);g.reset();g.spawnIn=g.arrowIn=999;const es=xs.map((x,i)=>{const e=g.spawn();e.x=150+x;e.y=100;e.hp=e.maxHp=1000;e.speed=0;e.entry=WORDS[i];return e});return {g,es}}
function cast(g,e,s){g.spell=s;g.input=e.entry.answer;g.submit()}
function ticks(g,n){for(let i=0;i<n;i++)g.update(.05)}
let {g,es}=setup();g.energy=12;g.activateUltimate();g.input=g.chant.answer;g.submit();assert.deepEqual(g.exReady,[true,true,true,true]);g.toggleSpell(1);assert.ok(g.exReady[1]);g.input='invalid';g.submit();assert.ok(g.exReady.every(Boolean));g.energy=12;g.activateUltimate();g.input=g.chant.answer;g.submit();assert.equal(g.blessings,2);assert.deepEqual(g.exReady,[true,true,true,true]);g.reset();assert.ok(g.exReady.every(v=>!v));
for(const [s,expected]of [[0,[true,true,false,false]],[1,[true,true,true,false]]]){const t=setup();t.g.exReady.fill(true);cast(t.g,t.es[0],s);assert.deepEqual(t.es.map(e=>e.effects[s]>0),expected);assert.equal(t.g.exReady[s],false);assert.equal(t.g.exReady.filter(Boolean).length,3);assert.equal(t.g.casts,1)}
let m=setup([0,100,290,401]);m.es[1].entry=m.es[0].entry;m.g.exReady[2]=true;cast(m.g,m.es[0],2);assert.ok(m.es.every(e=>e.effects[2]===0&&e.hp===1000));ticks(m.g,11);assert.equal(m.es[0].hp,1000);m.g.pause();ticks(m.g,40);assert.equal(m.g.meteors.length,1);m.g.pause();ticks(m.g,1);assert.deepEqual(m.es.map(e=>e.hp),[940,940,940,1000]);assert.equal(m.g.meteors.length,0);ticks(m.g,2);assert.equal(m.es[1].hp,940);assert.equal(m.g.casts,1);cast(m.g,m.es[0],2);assert.ok(m.es[0].effects[2]>0);
const move=setup([0,350]);move.g.exReady[2]=true;cast(move.g,move.es[0],2);move.es[0].x=900;move.es[1].x=200;ticks(move.g,12);assert.equal(move.es[0].hp,1000);assert.equal(move.es[1].hp,940);
const c=setup([0,100,200,300,400,500]);c.es[5].effects[3]=3;c.g.exReady[3]=true;cast(c.g,c.es[0],3);assert.equal(c.es.filter(e=>e.effects[3]===6).length,3);assert.equal(c.es[5].effects[3],3);assert.equal(c.g.casts,1);
const reset=setup();reset.g.exReady[2]=true;cast(reset.g,reset.es[0],2);reset.g.reset();assert.equal(reset.g.meteors.length,0);
console.log('PASS: 四種獨立EX、錯字不消耗、停用保留、補滿不累加、200/300範圍、隕石延遲/重疊去重/移動後命中/暫停/普通燃燒恢復、混亂隨機三分之一、重開歸零。');

const reward=setup([0,80]);reward.es.forEach(e=>e.hp=30);reward.g.exReady[2]=true;cast(reward.g,reward.es[0],2);ticks(reward.g,12);assert.equal(reward.g.stones,2);assert.equal(reward.g.energy,2);assert.equal(reward.g.enemies.length,0);

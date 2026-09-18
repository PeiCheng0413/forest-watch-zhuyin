const assert=require('node:assert/strict');const {Game,WORDS}=require('../dist/core.js');
function setup(){const g=new Game(()=>.2);g.reset();g.spawnIn=g.arrowIn=999;const enemies=[0,70,140,400].map((x)=>{const e=g.spawn();e.x=100+x;e.y=100;e.speed=0;e.hp=1000;return e});return {g,enemies}}
function tick(g,n){for(let i=0;i<n;i++)g.update(.05)}
const {g,enemies:[a,b,c,far]}=setup();a.effects[0]=10;tick(g,19);assert.equal(b.effects[0],0);tick(g,1);assert.equal(b.effects[0],5);assert.equal(c.effects[0],0);assert.equal(far.effects[0],0);assert.equal(g.casts,0);tick(g,20);assert.ok(c.effects[0]>3.9&&c.effects[0]<=4.01);assert.ok(b.effects[0]<4.01);assert.equal(g.events.filter(e=>e.type==='infection').length,2);
const frozen=JSON.stringify(g.enemies);g.pause();tick(g,40);assert.equal(JSON.stringify(g.enemies),frozen);g.pause();g.mode='ritual';tick(g,40);assert.equal(JSON.stringify(g.enemies),frozen);g.mode='playing';tick(g,200);assert.ok(g.enemies.every(e=>e.effects[0]===0));
const t=setup();t.enemies[0].effects[0]=1.4;tick(t.g,20);assert.ok(t.enemies[1].effects[0]>.39&&t.enemies[1].effects[0]<.41);
const d=setup();d.enemies[0].effects[0]=10;d.enemies[0].hp=1;tick(d.g,20);assert.equal(d.enemies[1].effects[0],0);
b.entry=WORDS.find(w=>w.word==='山');g.input=b.entry.answer;g.submit();assert.equal(b.effects[0],10);assert.equal(g.casts,1);
console.log('PASS: 一秒一次、範圍限制、每次一隻、延遲接力、五秒上限、來源剩餘時間、不刷新、不計施法、死亡停止、暫停吟唱凍結、玩家刷新。');

const assert=require('node:assert/strict');const {Game}=require('../dist/core.js');
function setup(n,blessings){const g=new Game(()=>.3);g.reset();g.spawnIn=999;g.arrowIn=0;g.blessings=blessings;const enemies=Array.from({length:n},(_,i)=>{const e=g.spawn();e.x=700+i*70;e.y=387;e.hp=1e9;e.speed=0;return e});return {g,enemies}}
for(const [n,b,damage]of [[3,0,[9,0,0]],[3,1,[9,9,0]],[1,1,[18]],[3,6,[27,18,18]],[2,999999,[4500000,4500000]]]){const {g,enemies}=setup(n,b);g.update(.01);assert.deepEqual(enemies.map(e=>1e9-e.hp),damage);assert.equal(g.events.find(e=>e.type==='volley').total,b+1);assert.equal(g.arrowIn,1.45)}
const {g}=setup(2,0);for(let i=1;i<=3;i++){g.energy=12;g.input='';g.activateUltimate();g.input=g.chant.answer;g.submit();assert.equal(g.blessings,i);assert.equal(g.energy,0)}
g.pause();g.update(.05);assert.equal(g.blessings,3);g.pause();for(let i=0;i<200;i++)g.update(.05);assert.equal(g.blessings,3);g.reset();assert.equal(g.blessings,0);
const empty=setup(0,50).g;empty.update(.01);assert.ok(!empty.events.some(e=>e.type==='volley'));
console.log('PASS: 永久祝福、逐次疊加、每箭9傷害、優先不同魔物、剩餘輪分、百萬箭完整計算、射速不變、無敵人與重新開始。');

const assert=require('node:assert/strict'),fs=require('node:fs');
const {Game,WORDS}=require('../dist/core.js');const {monsterPose,towerLight}=require('../dist/visuals.js');
const g=new Game(()=>.2);g.reset();g.arrowIn=g.spawnIn=999;const a=g.spawn(),b=g.spawn();a.entry=b.entry=WORDS.find(w=>w.word==='山');
g.input=a.entry.answer;g.submit();assert.equal(g.casts,1);assert.equal(g.correct,1);assert.equal(g.attempts,1);assert.ok(a.effects[0]>0&&b.effects[0]>0);assert.equal(g.events.filter(e=>e.type==='cast').length,2);assert.equal(g.events.filter(e=>e.type==='cast'&&e.announce).length,1);
g.energy=12;a.hp=b.hp=0;g.update(.01);assert.equal(g.stones,2);assert.equal(g.energy,12);g.spawn();g.input='';g.activateUltimate();g.input=g.chant.answer;g.submit();assert.equal(g.stones,2);assert.equal(g.energy,0);g.reset();assert.equal(g.stones,0);
const p=monsterPose(.1,0,false,true,false),q=monsterPose(.1+Math.PI/7,0,false,true,false);assert.ok(Math.abs(p.near+p.far)<1e-9);assert.ok(Math.abs(p.near+q.near)<1e-9);assert.equal(monsterPose(4,0,false,true,true).near,0);assert.equal(Math.abs(monsterPose(4,0,false,false,false).far),0);
assert.ok(towerLight(650,387).brightness>towerLight(1100,387).brightness);assert.ok(towerLight(800,387).x<0);assert.ok(towerLight(400,387).x>0);assert.ok(towerLight(600,100).y>0);assert.ok(towerLight(600,680).y<0);
const html=fs.readFileSync('dist/index.html','utf8');assert.ok(!html.includes('擊殺'));assert.ok(!html.includes('id="kills"'));assert.ok(html.includes('獲得魔石'));assert.ok(html.includes('id="endStones"'));
console.log('PASS: 同名群體施法只計一次、累積魔石與消耗分離、大魔法不回補魔石、左右腿反相、石化停步、中心光源方向與距離衰減、兒童介面文字。');

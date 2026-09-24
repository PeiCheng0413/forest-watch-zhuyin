const assert=require('node:assert/strict');
const {Game}=require('../dist/core.js');
const g=new Game(()=>.2);g.reset();assert.equal(g.energyMax,12);
for(let cost=12;cost<=16;cost++){
 g.energy=cost-1;assert.equal(g.activateUltimate(),false);
 g.energy=cost;assert.equal(g.activateUltimate(),true);assert.equal(g.energyMax,cost);
 g.input='invalid';g.submit();assert.equal(g.mode,'ritual');assert.equal(g.energyMax,cost);assert.equal(g.energy,cost);
 g.input=g.chant.answer;g.submit();assert.equal(g.energyMax,cost+1);assert.equal(g.energy,0);assert.equal(g.blessings,cost-11);assert.ok(g.exReady.every(Boolean));
}
g.spawnIn=g.arrowIn=999;g.energy=g.energyMax-1;for(let i=0;i<2;i++)g.spawn().hp=0;g.update(.01);assert.equal(g.energy,g.energyMax,'能量依新上限封頂');
g.pause();assert.equal(g.energyMax,17);g.reset();assert.equal(g.energyMax,12);assert.equal(g.energy,0);
console.log('PASS: 大魔法需求12→13→14逐次增加、少一顆不能啟動、吟唱與錯字不加價、祝福EX保留、新上限封頂、重開回12。');

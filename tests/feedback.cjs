const assert=require('node:assert/strict');const {ArcherMotion}=require('../dist/visuals.js');const {Game,WORDS}=require('../dist/core.js');
const a=new ArcherMotion();let p=a.idlePose();a.update(.3,'playing',null,1);assert.notDeepEqual(a.idlePose(),p);p=a.idlePose();a.update(.3,'paused',null,1);assert.deepEqual(a.idlePose(),p);a.update(.3,'ritual',null,1);assert.deepEqual(a.idlePose(),p);
a.update(.1,'playing',{x:100,y:100},.2);assert.deepEqual(a.idlePose(),{sway:0,breath:1,lean:0});a.shoot({x:100,y:100});assert.deepEqual(a.idlePose(),{sway:0,breath:1,lean:0});a.reset();assert.equal(a.idleTime,0);
const g=new Game(()=>.2);g.reset();const e=g.spawn();e.entry=WORDS.find(w=>w.word==='山');g.events=[];g.input='g0';g.submit();assert.equal(g.events.filter(e=>e.type==='cast').length,0);
for(let spell=0;spell<4;spell++){
 g.spell=spell;g.input=e.entry.answer;g.events=[];g.submit();let cast=g.events.find(e=>e.type==='cast');assert.equal(cast.targetId,e.id);assert.equal(cast.targetLabel,'ㄕㄢˉ');assert.equal(cast.spell,spell);assert.equal(cast.refreshed,false);
 g.input=e.entry.answer;g.events=[];g.submit();assert.equal(g.events.find(e=>e.type==='cast').refreshed,true);
}
console.log('PASS: 待機呼吸、瞄準與放箭停用待機、暫停凍結、重開、四法術命中事件與刷新提示、錯誤輸入不觸發成功。');

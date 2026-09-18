const assert=require('node:assert/strict');const {Game}=require('../dist/core.js');
const g=new Game();g.reset();g.input='g0';
assert.ok(g.toggleSpell(1));assert.ok(g.toggleSpell(3));assert.deepEqual(g.enabledSpells,[true,false,true,false]);
g.changeSpell(1);assert.equal(g.spell,2);g.changeSpell(1);assert.equal(g.spell,0);g.changeSpell(-1);assert.equal(g.spell,2);assert.equal(g.input,'g0');
assert.ok(g.toggleSpell(2));assert.equal(g.spell,0);assert.equal(g.toggleSpell(0),false);g.changeSpell(1);assert.equal(g.spell,0);assert.equal(g.input,'g0');
g.reset();assert.deepEqual(g.enabledSpells,[true,false,false,false]);assert.equal(g.spell,0);
const saved=JSON.stringify(g.enabledSpells),restored=new Game();restored.setEnabledSpells(JSON.parse(saved));restored.reset();assert.deepEqual(restored.enabledSpells,g.enabledSpells);
for(const invalid of [null,[],[false,false,false,false],['true',false,false,false],{}]){restored.setEnabledSpells(invalid);assert.deepEqual(restored.enabledSpells,[true,true,true,true])}
restored.setEnabledSpells([false,true,false,true]);assert.equal(restored.spell,1);restored.reset();assert.equal(restored.spell,1);restored.pause();restored.toggleSpell(1);assert.equal(restored.spell,3);
assert.equal(restored.toggleSpell(9),false);
console.log('PASS: 開關、循環略過、關閉目前法術自動切換、保留輸入、至少一種、重開與儲存還原、損壞設定復原。');

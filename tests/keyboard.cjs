const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {Game,KEYS}=require('../dist/core.js');const src=fs.readFileSync(require('node:path').join(__dirname,'../dist/game.js'),'utf8');
const handler=src.slice(src.indexOf('function handleGameKey('),src.indexOf("window.addEventListener('keydown'"));
const game=new Game(()=>.3);game.reset();game.spawn();game.spawn();
const c={game,KEYS,processEvents(){},renderUI(){},toast(){}};vm.createContext(c);vm.runInContext(handler,c);
function press(key,props={}){const e={key,prevented:false,stopped:false,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true},...props};c.handleGameKey(e);return e}
assert.ok(press('ArrowRight').prevented);assert.equal(game.spell,1);press('ArrowLeft');assert.equal(game.spell,0);
press('ArrowRight',{isComposing:true,keyCode:229});assert.equal(game.spell,1);
game.input='g';const beforeTab=game.spell;assert.equal(press('Tab').prevented,true);assert.equal(game.spell,(beforeTab+1)%4);assert.equal(game.input,'g');assert.equal(press('Tab',{shiftKey:true}).prevented,false);assert.equal(game.spell,(beforeTab+1)%4);assert.equal(game.input,'g');game.input='';game.spell=1;
press('Escape');assert.equal(game.mode,'paused');assert.equal(press('Tab').prevented,false);press('Escape');assert.equal(game.mode,'playing');
press('ArrowLeft',{repeat:true});assert.equal(game.spell,1);press('g');press('0');press(' ');assert.equal(game.input,'g0 ');
console.log('PASS: 實際鍵盤處理器左右切法術、組字旗標、Tab 正向切換、Shift+Tab 不切換、長按與一聲空白鍵。');

// Exercise the real keyboard handler, including repeats and IME cancellation.
game.reset();game.spawn();game.energy=12;
press(' ',{timeStamp:100});assert.equal(game.input,'');assert.equal(game.mode,'playing');
press(' ',{timeStamp:200,repeat:true});assert.equal(game.mode,'playing');
press(' ',{timeStamp:300});assert.equal(game.mode,'ritual');
const frozen=game.time;game.update(.05);assert.equal(game.time,frozen);
for(const k of game.chant.answer)press(k);press('Enter');assert.equal(game.mode,'playing');assert.equal(game.energy,0);assert.equal(game.enemies.length,0);
game.spawn();game.energy=12;press('g');press('0');press(' ',{timeStamp:500});press(' ',{timeStamp:600});assert.equal(game.mode,'playing');assert.equal(game.input,'g0  ');
game.input='';press(' ',{timeStamp:1000});press(' ',{timeStamp:1600});assert.equal(game.mode,'playing');
press('Escape');press('Escape');press(' ',{timeStamp:1700});assert.equal(game.mode,'playing');
press('ArrowRight');press(' ',{timeStamp:1800});assert.equal(game.mode,'playing');
press('a',{isComposing:true,keyCode:229});press(' ',{timeStamp:1900});assert.equal(game.mode,'playing');
press('Backspace');press(' ',{timeStamp:2000});press('g');press('Backspace');press(' ',{timeStamp:2100});assert.equal(game.mode,'playing');
game.energy=11;game.input='';press(' ',{timeStamp:2200});press(' ',{timeStamp:2300});assert.equal(game.mode,'playing');
game.reset();assert.equal(game.spaceTapAt,null);
console.log('PASS: 滿能量雙空白啟動吟唱、一聲不誤觸、長按不觸發、逾時與插入按鍵／暫停／IME 中斷、咒語清場耗能與重新開始。');

game.reset();game.toggleSpell(1);game.toggleSpell(3);game.input='g0';press('Tab');assert.equal(game.spell,2);press('Tab');assert.equal(game.spell,0);press('ArrowLeft');assert.equal(game.spell,2);assert.equal(game.input,'g0');
console.log('PASS: 實際 Tab 與左右鍵略過停用法術，保留輸入。');

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {Game,KEYS}=require('../dist/core.js');const src=fs.readFileSync(require('node:path').join(__dirname,'../dist/game.js'),'utf8');
const handler=src.slice(src.indexOf('function handleGameKey('),src.indexOf("window.addEventListener('keydown'"));
const game=new Game(()=>.3);game.reset();game.spawn();game.spawn();
const c={game,KEYS,processEvents(){},renderUI(){},toast(){}};vm.createContext(c);vm.runInContext(handler,c);
function press(key,props={}){const e={key,prevented:false,stopped:false,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true},...props};c.handleGameKey(e);return e}
assert.ok(press('ArrowRight').prevented);assert.equal(game.spell,1);press('ArrowLeft');assert.equal(game.spell,0);
press('ArrowRight',{isComposing:true,keyCode:229});assert.equal(game.spell,1);
let target=game.targetId;game.input='g';let e=press('Tab');assert.ok(e.prevented&&e.stopped);assert.notEqual(game.targetId,target);assert.equal(game.input,'');press('Tab',{shiftKey:true});assert.equal(game.targetId,target);
press('Escape');assert.equal(game.mode,'paused');assert.equal(press('Tab').prevented,false);press('Escape');assert.equal(game.mode,'playing');
press('ArrowLeft',{repeat:true});assert.equal(game.spell,1);press('g');press('0');press(' ');assert.equal(game.input,'g0 ');
console.log('PASS: 實際鍵盤處理器左右切法術、組字旗標、Tab 焦點攔截、反向選怪、暫停恢復 Tab、長按與一聲空白鍵。');

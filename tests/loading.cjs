const assert=require('node:assert/strict');
const {AssetLoader}=require('../dist/loading.js');
class Picture extends EventTarget{constructor(complete=false,width=0){super();this.complete=complete;this.naturalWidth=width;this.src='asset.png';}finish(ok){this.complete=true;this.naturalWidth=ok?100:0;this.dispatchEvent(new Event(ok?'load':'error'));}}
const images=[new Picture(true,100),new Picture(),new Picture(true,0)];
let state;const timers=new Map();let next=0;
const loader=new AssetLoader(images.map((image,i)=>({image,name:'素材'+i,url:image.src})),s=>state=s,{setTimer:fn=>{timers.set(++next,fn);return next;},clearTimer:id=>timers.delete(id)});
loader.load();assert.equal(state.done,1);assert.equal(state.ready,false);assert.deepEqual(state.failed,['素材2']);
for(const fn of [...timers.values()])fn();assert.equal(state.ready,false);assert.deepEqual(state.failed,['素材2']);assert.deepEqual(state.slow,['素材1']);
images[1].finish(true);assert.equal(state.done,2);assert.equal(state.ready,false);assert.deepEqual(state.slow,[]);
const original=images[0].src,late=images[1].src;loader.load(true);assert.equal(images[0].src,original);assert.equal(images[1].src,late);assert.match(images[2].src,/retry=/);assert.equal(state.done,2);
images[2].finish(false);assert.equal(state.ready,false);loader.load(true);images[2].finish(true);assert.equal(state.ready,true);assert.equal(state.done,3);assert.equal(timers.size,0);
const slowImage=new Picture();let slowState,updates=0;
const slowLoader=new AssetLoader([{image:slowImage,name:'慢速圖片',url:slowImage.src}],s=>{slowState=s;updates++;},{setTimer:fn=>{timers.set(++next,fn);return next;},clearTimer:id=>timers.delete(id)});
slowLoader.load();for(const fn of [...timers.values()])fn();assert.deepEqual(slowState.slow,['慢速圖片']);
slowLoader.load(true);assert.deepEqual(slowState.slow,[]);const before=updates;slowImage.finish(true);assert.equal(updates,before+1,'重試必須移除舊監聽，僅更新一次');assert.equal(slowState.ready,true);assert.equal(timers.size,0);
console.log('PASS: 逾時僅提示慢速、稍後完成自動解鎖、真實錯誤與慢速分開、只重試未完成圖片、重試清除舊監聽。');

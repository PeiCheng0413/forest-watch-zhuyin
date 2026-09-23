const assert=require('node:assert/strict');
const {AssetLoader}=require('../dist/loading.js');
class Picture extends EventTarget{constructor(complete=false,width=0){super();this.complete=complete;this.naturalWidth=width;this.src='asset.png';}finish(ok){this.complete=true;this.naturalWidth=ok?100:0;this.dispatchEvent(new Event(ok?'load':'error'));}}
const images=[new Picture(true,100),new Picture(),new Picture(true,0)];
let state;const timers=new Map();let next=0;
const loader=new AssetLoader(images.map((image,i)=>({image,name:'素材'+i,url:image.src})),s=>state=s,{setTimer:fn=>{timers.set(++next,fn);return next;},clearTimer:id=>timers.delete(id)});
loader.load();assert.equal(state.done,1);assert.equal(state.ready,false);assert.deepEqual(state.failed,['素材2']);
for(const fn of [...timers.values()])fn();assert.equal(state.ready,false);assert.deepEqual(state.failed,['素材1','素材2']);
const original=images[0].src;loader.load(true);assert.equal(images[0].src,original);assert.match(images[1].src,/retry=/);assert.equal(state.done,1);
images[1].finish(true);assert.equal(state.done,2);assert.equal(state.ready,false);
images[2].finish(false);assert.equal(state.ready,false);loader.load(true);images[2].finish(true);assert.equal(state.ready,true);assert.equal(state.done,3);assert.equal(timers.size,0);
console.log('PASS: 快取成功、快取失敗、慢速逾時不放行、部分失敗、只重試未完成素材、全數成功才可開始。');

(function(root){
 'use strict';
 class AssetLoader {
  constructor(items,changed,{timeout=15000,setTimer=(fn,ms)=>setTimeout(fn,ms),clearTimer=id=>clearTimeout(id)}={}){this.items=items.map(item=>({...item,status:'pending',attempt:0}));this.changed=changed;this.timeout=timeout;this.setTimer=setTimer;this.clearTimer=clearTimer;}
  snapshot(){const done=this.items.filter(i=>i.status==='ready').length;return {done,total:this.items.length,ready:done===this.items.length,failed:this.items.filter(i=>i.status==='failed').map(i=>i.name),slow:this.items.filter(i=>i.status==='slow').map(i=>i.name)};}
  load(retry=false){for(const item of this.items){if(item.status==='ready'||item.status==='loading'||(item.status==='slow'&&!retry))continue;this.loadOne(item,retry);}this.changed(this.snapshot());}
  loadOne(item,retry){
   if(item.cleanup)item.cleanup();
   item.status='loading';const attempt=++item.attempt,img=item.image;
   const finish=ok=>{if(attempt!==item.attempt)return;item.cleanup();item.status=ok?'ready':'failed';this.changed(this.snapshot());};
   const loaded=()=>finish(img.naturalWidth>0),failed=()=>finish(false);
   item.cleanup=()=>{this.clearTimer(item.timer);img.removeEventListener('load',loaded);img.removeEventListener('error',failed);};
   img.addEventListener('load',loaded);img.addEventListener('error',failed);
   item.timer=this.setTimer(()=>{if(attempt!==item.attempt||item.status!=='loading')return;item.status='slow';this.changed(this.snapshot());},this.timeout);
   if(retry){img.src=item.url+(item.url.includes('?')?'&':'?')+'retry='+Date.now()+'-'+attempt;}
   else if(img.complete)finish(img.naturalWidth>0);
  }
 }
 if(typeof module==='object'&&module.exports)module.exports={AssetLoader};else root.ForestLoading={AssetLoader};
})(typeof globalThis!=='undefined'?globalThis:this);

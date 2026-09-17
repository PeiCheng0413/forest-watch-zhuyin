(function(root){
'use strict';
const KEYS={'1':'ㄅ','q':'ㄆ','a':'ㄇ','z':'ㄈ','2':'ㄉ','w':'ㄊ','s':'ㄋ','x':'ㄌ','e':'ㄍ','d':'ㄎ','c':'ㄏ','r':'ㄐ','f':'ㄑ','v':'ㄒ','5':'ㄓ','t':'ㄔ','g':'ㄕ','b':'ㄖ','y':'ㄗ','h':'ㄘ','n':'ㄙ','u':'ㄧ','j':'ㄨ','m':'ㄩ','8':'ㄚ','i':'ㄛ','k':'ㄜ',',':'ㄝ','9':'ㄞ','o':'ㄟ','l':'ㄠ','.':'ㄡ','0':'ㄢ','p':'ㄣ',';':'ㄤ','/':'ㄥ','-':'ㄦ','6':'ˊ','3':'ˇ','4':'ˋ','7':'˙',' ':'ˉ'};
const WORDS=[['火','cj3'],['木','aj4'],['山','g0'],['水','gjo3'],['風','z/'],['光','ej;'],['土','wj3'],['石','g6'],['日','b4'],['月','m,4'],['星','vu/'],['雨','m3'],['花','cj8'],['草','hl3'],['林','xup6'],['門','ap6'],['手','g.3'],['口','d.3'],['心','vup'],['海','c93'],['天','wu0'],['田','wu06'],['白','196'],['黑','co'],['紅','cj/6'],['藍','x06'],['金','rup'],['牛','su.6'],['羊','u;6'],['鳥','sul3'],['馬','a83'],['魚','m6'],['虎','cj3'],['龍','xj/6'],['王','j;6'],['冰','1u/'],['雪','vm,3'],['雷','xo6'],['雲','mp6'],['樹','gj4'],['森林','np','xup6'],['石頭','g6','w.6'],['火山','cj3','g0'],['月光','m,4','ej;'],['天空','wu0','dj/'],['大海','284','c93'],['小草','vul3','hl3'],['白雲','196','mp6'],['星光','vu/','ej;'],['水晶','gjo3','ru/'],['魔法','aj6','z83'],['王國','j;6','eji6'],['守護','g.3','cj4'],['光明','ej;','au/6'],['火花','cj3','cj8'],['雷雨','xo6','m3'],['紅花','cj/6','cj8'],['青山','fu/','g0'],['大地','284','2u4'],['飛鳥','zo','sul3']].map(([word,...syllables])=>{const keys=syllables.map(k=>/[6347]$/.test(k)?k:k+' ');return {word,keys,answer:keys.join('')}});
const CHANTS=[['光明守護','ej;','au/6','g.3','cj4'],['大地之光','284','2u4','5','ej;'],['星火之力','vu/','cj3','5','xu4']].map(([word,...syllables])=>{const keys=syllables.map(k=>/[6347]$/.test(k)?k:k+' ');return {word,keys,answer:keys.join('')}});
const SPELLS=[{name:'中毒',color:'#b3d77e',duration:10},{name:'石化',color:'#b7c4da',duration:4.5},{name:'燃燒',color:'#ffa36f',duration:3.5},{name:'混亂',color:'#c7a0f2',duration:6}];
const CX=600,CY=387;
function convert(s){return [...s].map(k=>KEYS[k]||'').join('')}
function display(entry){return entry.keys.map(convert).join(' ')}
function formatInput(raw,entry){if(!entry)return convert(raw);let at=0,parts=[];for(const k of entry.keys){const part=raw.slice(at,at+k.length);if(part)parts.push(convert(part));at+=k.length}if(raw.length>at)parts.push(convert(raw.slice(at)));return parts.join(' ')}
class Game{
 constructor(random=Math.random){this.random=random;this.reset();this.mode='start'}
 reset(){Object.assign(this,{mode:'playing',time:0,hp:100,energy:0,energyMax:12,kills:0,casts:0,attempts:0,correct:0,spell:0,input:'',targetId:null,enemies:[],events:[],nextId:1,spawnIn:1.8,arrowIn:.4,chant:null,pausedFrom:null});}
 emit(type,data={}){this.events.push({type,...data})}
 nearest(){return this.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-CX,a.y-CY)-Math.hypot(b.x-CX,b.y-CY))[0]}
 target(){return this.enemies.find(e=>e.id===this.targetId&&e.hp>0)}
 retarget(){this.targetId=this.nearest()?.id??null;this.input=''}
 select(dir){if(this.mode!=='playing'||!this.enemies.length)return;const order=[...this.enemies].sort((a,b)=>Math.atan2(a.y-CY,a.x-CX)-Math.atan2(b.y-CY,b.x-CX));let i=order.findIndex(e=>e.id===this.targetId);this.targetId=order[(i+dir+order.length)%order.length].id;this.input='';this.emit('select')}
 changeSpell(dir){if(this.mode==='playing'){this.spell=(this.spell+dir+4)%4;this.emit('spell')}}
 type(key){if(!['playing','ritual'].includes(this.mode))return;if(key==='Backspace'){this.input=this.input.slice(0,-1);return}if(!KEYS[key]||this.input.length>=45)return;if(this.mode==='playing'&&!this.target())return;this.input+=key;}
 submit(){if(!['playing','ritual'].includes(this.mode))return;const entry=this.mode==='ritual'?this.chant:this.target()?.entry;if(!entry||!this.input)return;this.attempts++;if(this.input!==entry.answer){this.input='';this.emit('wrong');return}this.correct++;this.casts++;
 if(this.mode==='ritual'){this.kills+=this.enemies.length;this.emit('ultimate',{count:this.enemies.length});this.enemies=[];this.energy=0;this.input='';this.targetId=null;this.mode='playing';this.spawnIn=2;return}
 const e=this.target();e.effects[this.spell]=SPELLS[this.spell].duration;this.emit('cast',{x:e.x,y:e.y,spell:this.spell});this.retarget();}
 spawn(){const r=this.random,angle=r()*Math.PI*2;const doubleChance=Math.min(.75,Math.max(0,(this.time-60)/200));let pool=WORDS.filter(w=>w.keys.length===(r()<doubleChance?2:1));const used=new Set(this.enemies.map(e=>e.entry.answer));const unused=pool.filter(w=>!used.has(w.answer));if(unused.length)pool=unused;const entry=pool[Math.floor(r()*pool.length)];const orc=this.time>35&&r()<Math.min(.55,.15+this.time/500);const hp=(orc?72:30)*(1+this.time/500);const e={id:this.nextId++,x:CX+Math.cos(angle)*520,y:CY+Math.sin(angle)*300,entry,orc,hp,maxHp:hp,speed:Math.min(orc?26:39,(orc?9:13)+this.time/40),effects:[0,0,0,0],attackIn:0};this.enemies.push(e);if(!this.target())this.retarget();return e;}
 pause(){if(['playing','ritual'].includes(this.mode)){this.pausedFrom=this.mode;this.mode='paused'}else if(this.mode==='paused'){this.mode=this.pausedFrom||'playing'}}
 update(dt){if(this.mode!=='playing')return;dt=Math.min(.05,Math.max(0,dt));this.time+=dt;this.spawnIn-=dt;this.arrowIn-=dt;if(this.spawnIn<=0){this.spawn();this.spawnIn=Math.max(.65,6-this.time/55)}
 for(const e of this.enemies){if(e.hp<=0)continue;if(e.effects[0]>0)e.hp-=6*dt;if(e.effects[2]>0)e.hp-=13*dt;const stone=e.effects[1]>0,confused=e.effects[3]>0;e.effects=e.effects.map(t=>Math.max(0,t-dt));if(stone||e.hp<=0)continue;e.attackIn-=dt;
 let tx=CX,ty=CY,other=null;if(confused){other=this.enemies.filter(o=>o.id!==e.id&&o.hp>0).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];if(!other)continue;tx=other.x;ty=other.y}
 const dx=tx-e.x,dy=ty-e.y,dist=Math.hypot(dx,dy),reach=other?24:48;
 if(dist>reach){e.x+=dx/dist*e.speed*dt;e.y+=dy/dist*e.speed*dt}else if(e.attackIn<=0){e.attackIn=other?.9:1.2;if(other){other.hp-=e.orc?15:9;this.emit('clash',{x:other.x,y:other.y})}else{this.hp=Math.max(0,this.hp-(e.orc?5:2));this.emit('hurt')}}
 }
 if(this.arrowIn<=0){const target=this.nearest();if(target){target.hp-=9;this.emit('arrow',{x:target.x,y:target.y})}this.arrowIn=1.45}
 const dead=this.enemies.filter(e=>e.hp<=0);for(const e of dead){this.kills++;this.energy=Math.min(this.energyMax,this.energy+1);this.emit('death',{x:e.x,y:e.y})}this.enemies=this.enemies.filter(e=>e.hp>0);if(!this.target())this.retarget();
 if(this.hp<=0){this.mode='ended';this.emit('end');return}if(this.energy>=this.energyMax){this.mode='ritual';this.input='';this.chant=CHANTS[Math.floor(this.random()*CHANTS.length)];this.emit('ritual')}
 }
}
const api={Game,KEYS,WORDS,CHANTS,SPELLS,CX,CY,convert,display,formatInput};if(typeof module!=='undefined')module.exports=api;else root.ForestCore=api;
})(typeof window!=='undefined'?window:globalThis);

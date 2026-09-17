'use strict';
const {Game,KEYS,SPELLS,CX,CY,display,formatInput}=ForestCore;
const game=new Game();const $=id=>document.getElementById(id);const canvas=$('canvas'),ctx=canvas.getContext('2d');const bg=new Image();bg.src='assets/forest-empty-tower.png';
const {ARCHER,ArcherMotion}=ForestVisuals;
const archer=new ArcherMotion();
const spriteMeta={"archer":{"file":"archer-eight-directions.png","frames":[{"x":47,"y":21,"w":265,"h":270,"pivotX":154,"pivotY":288},{"x":370,"y":37,"w":231,"h":256,"pivotX":468,"pivotY":290},{"x":705,"y":25,"w":172,"h":268,"pivotX":784,"pivotY":290},{"x":972,"y":54,"w":235,"h":239,"pivotX":1095,"pivotY":290},{"x":18,"y":327,"w":278,"h":276,"pivotX":150,"pivotY":600},{"x":370,"y":330,"w":225,"h":274,"pivotX":483,"pivotY":601},{"x":718,"y":323,"w":156,"h":278,"pivotX":788,"pivotY":598},{"x":980,"y":327,"w":222,"h":276,"pivotX":1090,"pivotY":600},{"x":46,"y":642,"w":241,"h":267,"pivotX":154,"pivotY":906},{"x":372,"y":653,"w":220,"h":256,"pivotX":468,"pivotY":906},{"x":699,"y":645,"w":188,"h":267,"pivotX":784,"pivotY":909},{"x":975,"y":664,"w":223,"h":247,"pivotX":1095,"pivotY":908},{"x":44,"y":941,"w":251,"h":275,"pivotX":165,"pivotY":1213},{"x":370,"y":941,"w":225,"h":275,"pivotX":483,"pivotY":1213},{"x":706,"y":941,"w":168,"h":275,"pivotX":791,"pivotY":1213},{"x":983,"y":941,"w":216,"h":275,"pivotX":1094,"pivotY":1213}]},"monsters":{"file":"monsters-walk.png","frames":[{"x":95,"y":17,"w":308,"h":354,"pivotX":257,"pivotY":368},{"x":509,"y":21,"w":341,"h":351,"pivotX":708,"pivotY":369},{"x":994,"y":23,"w":293,"h":351,"pivotX":1148,"pivotY":371},{"x":1393,"y":16,"w":335,"h":360,"pivotX":1592,"pivotY":373},{"x":4,"y":389,"w":426,"h":467,"pivotX":248,"pivotY":853},{"x":453,"y":395,"w":434,"h":472,"pivotX":701,"pivotY":864},{"x":921,"y":390,"w":409,"h":471,"pivotX":1146,"pivotY":858},{"x":1359,"y":393,"w":408,"h":471,"pivotX":1590,"pivotY":861}]}};
const archerImage=new Image(),monsterImage=new Image();
archerImage.src='assets/archer-eight-directions.png';monsterImage.src='assets/monsters-walk.png';
let assetsReady=false,spriteYScale=1;
const assetLoads=[bg,archerImage,monsterImage].map(img=>new Promise((resolve,reject)=>{if(img.complete&&img.naturalWidth)return resolve();img.onload=resolve;img.onerror=()=>reject(new Error(img.src))}));
$('start').disabled=true;$('start').textContent='正在載入森林與角色…';
Promise.all(assetLoads).then(()=>{assetsReady=true;$('start').disabled=false;$('start').textContent='開始守護 ↗'}).catch(()=>{$('start').textContent='素材載入失敗，請重新整理';toast('角色素材尚未載入完成，請檢查連線後重新整理。')});
let fx=[],last=performance.now(),wall=0,shake=0,flash=0,sound=false,audio=null,best=null,previousMode='',toastTimer;
try{best=JSON.parse(localStorage.getItem('forest-watch-best-v1'))}catch{}
const fmt=t=>{const s=Math.floor(t);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
$('best').textContent=best?.time?fmt(best.time):'—';
function beep(freq,duration=.12,type='sine',volume=.045){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.55,audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2400)}
function start(){if(!assetsReady)return;archer.reset();canvas.focus({preventScroll:true});game.reset();fx=[];flash=0;shake=0;$('feedback').textContent='輸入魔物名字，即可施放目前法術。';$('feedback').className='';previousMode='';renderUI();beep(440)}
$('start').onclick=start;$('again').onclick=start;$('restartPaused').onclick=start;
$('home').onclick=()=>{game.mode='start';game.enemies=[];game.input='';renderUI()};$('pause').onclick=()=>{game.pause();renderUI()};$('resume').onclick=()=>{game.pause();renderUI()};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('game').requestFullscreen()}catch{toast('此瀏覽器無法開啟全螢幕，可改用瀏覽器的全螢幕功能。')}};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=`音效 ${sound?'開':'關'}`;$('sound').setAttribute('aria-label',sound?'關閉音效':'開啟音效');beep(580)};
document.querySelectorAll('[data-spell]').forEach(b=>b.onclick=()=>{if(game.mode==='playing'){game.spell=+b.dataset.spell;renderUI()}});
function handleGameKey(e){
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 const active=['playing','ritual'].includes(game.mode);
 // Game controls must be handled before IME checks, and before button defaults.
 const control=['Tab','ArrowLeft','ArrowRight','Escape'].includes(e.key);
 if(control){
  if(!active&&!(game.mode==='paused'&&e.key==='Escape'))return;
  e.preventDefault();e.stopPropagation();
  if(e.repeat)return;
  if(e.key==='Escape')game.pause();
  else if(e.key==='Tab')game.select(e.shiftKey?-1:1);
  else game.changeSpell(e.key==='ArrowLeft'?-1:1);
  processEvents();renderUI();return;
 }
 if(!active)return;
 if(e.isComposing||e.keyCode===229){toast('請先切換成英文輸入法，再按注音對應鍵位。');return}
 const key=e.key.toLowerCase();
 if(KEYS[key]||['Backspace','Enter'].includes(e.key)){e.preventDefault();e.stopPropagation()}
 if(e.repeat&&e.key!=='Backspace')return;
 if(e.key==='Enter')game.submit();else game.type(e.key==='Backspace'?'Backspace':key);
 processEvents();renderUI();
}
window.addEventListener('keydown',handleGameKey,{capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','ritual'].includes(game.mode)){game.pause();renderUI()}});
function processEvents(){for(const e of game.events){switch(e.type){case'arrow':{const shot=archer.shoot(e),duration=Math.max(.2,Math.min(.48,Math.hypot(shot.x-shot.startX,shot.y-shot.startY)/1400));fx.push({type:'arrow',...shot,life:duration,max:duration});break;}case'cast':fx.push({...e,life:.6,max:.6});beep([340,220,520,680][e.spell]);$('feedback').textContent=`已施放${SPELLS[e.spell].name}，重新鎖定最近的魔物。`;$('feedback').className='good';break;case'wrong':beep(110,.2,'triangle');if(game.mode==='ritual'){$('ritualMessage').textContent='咒語不正確，已清空。看清楚聲調，再試一次。';$('ritualMessage').classList.add('bad')}else{$('feedback').textContent='名字不正確，已清空。請看清楚注音與聲調。';$('feedback').className='bad'}break;case'death':fx.push({...e,life:.9,max:.9});beep(740,.08,'sine',.02);break;case'clash':fx.push({...e,life:.2,max:.2});break;case'hurt':shake=.22;beep(80,.15,'triangle');break;case'ultimate':flash=1.2;for(let i=0;i<80;i++)fx.push({type:'spark',x:CX,y:CY,angle:Math.random()*Math.PI*2,speed:80+Math.random()*650,life:1.6,max:1.6});beep(1000,1,'sine',.12);toast(`曙光降臨！清除 ${e.count} 隻魔物`);break;case'ritual':beep(700,.8);break;case'end':saveResult();break;}}game.events=[];}
function saveResult(){const record=!best||game.time>best.time;let saved=true;if(record){best={time:game.time,kills:game.kills,casts:game.casts,accuracy:game.attempts?Math.round(game.correct/game.attempts*100):0};try{localStorage.setItem('forest-watch-best-v1',JSON.stringify(best))}catch{saved=false}$('best').textContent=fmt(best.time)}$('endTitle').textContent=record?'新的守望紀錄。':'火光仍會再燃。';$('endTime').textContent=fmt(game.time);$('endKills').textContent=game.kills;$('endCasts').textContent=game.casts;$('endAccuracy').textContent=game.attempts?`${Math.round(game.correct/game.attempts*100)}%`:'—';$('recordMessage').textContent=!saved?'瀏覽器無法儲存紀錄，本次成績仍顯示於此。':record?'你的最佳成績已儲存在此瀏覽器。':`個人最佳 ${fmt(best.time)}，再試一次吧。`}
function renderUI(){const mode=game.mode;const t=game.target();$('time').textContent=fmt(game.time);$('hp').textContent=`${Math.ceil(game.hp)} / 100`;$('hpbar').style.width=`${game.hp}%`;$('hpbar').style.background=game.hp<30?'#e9957d':'#a9c894';$('energy').textContent=`${game.energy} / ${game.energyMax}`;$('energybar').style.width=`${game.energy/game.energyMax*100}%`;$('kills').textContent=game.kills;$('target').textContent=t?display(t.entry):'—';$('targetType').textContent=t?`${t.orc?'獸人':'哥布林'} · Tab 切換`:'等待魔物現身';$('input').replaceChildren();if(game.input&&mode==='playing'){$('input').textContent=formatInput(game.input,t?.entry);$('input').classList.toggle('bad',!!t&&!t.entry.answer.startsWith(game.input))}else{const p=document.createElement('span');p.className='placeholder';p.textContent='在此輸入注音';$('input').append(p);$('input').classList.remove('bad')}
 $('phase').textContent=game.time<60?'森林邊境 · 單字試煉':game.time<180?'暗影漸深 · 雙字詞現身':'長夜守望 · 魔物持續增援';$('pause').disabled=['start','ended'].includes(mode);$('pause').textContent=mode==='paused'?'繼續':'暫停';document.querySelectorAll('[data-spell]').forEach(b=>{b.classList.toggle('active',+b.dataset.spell===game.spell);b.setAttribute('aria-pressed',String(+b.dataset.spell===game.spell))});
 if(mode!==previousMode){$('overlay').hidden=mode==='playing';for(const [id,m]of Object.entries({startPanel:'start',pausePanel:'paused',ritualPanel:'ritual',endPanel:'ended'}))$(id).hidden=mode!==m;if(mode==='ritual'){$('chant').textContent=display(game.chant);$('ritualMessage').textContent='完成後按 Enter，錯誤時會清空重打。';$('ritualMessage').classList.remove('bad')}previousMode=mode}if(mode==='ritual')$('ritualInput').textContent=formatInput(game.input,game.chant);
}
// Source rectangles and foot pivots keep differently shaped poses grounded.
function drawSprite(img,frame,x,y,scale,flip=false){
 if(!img.complete||!img.naturalWidth)return;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));
 if(flip)ctx.scale(-1,1);
 ctx.drawImage(img,frame.x,frame.y,frame.w,frame.h,
  (frame.x-frame.pivotX)*scale,(frame.y-frame.pivotY)*scale*spriteYScale,frame.w*scale,frame.h*scale*spriteYScale);
 ctx.restore();
}
function drawArcher(){
 if(!assetsReady)return;
 const frame=spriteMeta.archer.frames[archer.frame()];
 const recoil=archer.releaseLeft>0?Math.sin(archer.releaseLeft/.26*Math.PI)*1.4:0;
 const angle=archer.direction*Math.PI/4;
 drawSprite(archerImage,frame,ARCHER.x-Math.cos(angle)*recoil,ARCHER.y,.17);
}
function drawMonster(e){
 const stone=e.effects[1]>0,height=(e.orc?73:55)*spriteYScale;
 const walking=!stone&&e.moving;
 const walkFrame=walking?Math.floor(game.time*(e.orc?5:7)+e.id)%4:0;
 const frame=spriteMeta.monsters.frames[(e.orc?4:0)+walkFrame];
 const bob=walking?Math.sin(game.time*(e.orc?10:14)+e.id)*.65:0;
 ctx.fillStyle='#06141788';ctx.beginPath();ctx.ellipse(e.x,e.y+3,e.orc?24:17,7,0,0,Math.PI*2);ctx.fill();
 ctx.save();if(stone)ctx.filter='grayscale(1) brightness(1.25)';
 drawSprite(monsterImage,frame,e.x,e.y+bob,.155,e.facingX<0);ctx.restore();
 if(e.effects[2]>0){for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#ffe18b':'#ed8852';ctx.fillRect(e.x-15+i*8,e.y-10-Math.sin(game.time*12+i)*6,4,9)}}
 if(e.effects[0]>0){ctx.fillStyle='#b1dc67';for(let i=0;i<3;i++)ctx.fillRect(e.x-15+i*13,e.y-height-((game.time*15+i*9)%15),3,3)}
 if(e.effects[3]>0){ctx.strokeStyle='#cb9bed';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y-height-5,15,4,game.time,0,Math.PI*1.5);ctx.stroke()}
 if(stone){ctx.strokeStyle='#d7e5eb99';ctx.lineWidth=2;ctx.strokeRect(e.x-(e.orc?29:23),e.y-height,e.orc?58:46,height+4)}
 if(e.id===game.targetId){ctx.strokeStyle=SPELLS[game.spell].color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y+4,e.orc?30:24,10,0,0,Math.PI*2);ctx.stroke()}
}
function drawLabels(){
 const labels=[],sy=spriteYScale;
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 21px "PingFang TC", "Microsoft JhengHei", sans-serif';
 for(const e of [...game.enemies].sort((a,b)=>a.y-b.y)){
  const txt=display(e.entry),w=ctx.measureText(txt).width+20,base=e.y-(e.orc?95:77)*sy;
  const x=Math.max(w/2+12,Math.min(1200-w/2-12,e.x));let y=Math.max(22*sy,base);
  for(let tries=0;tries<6;tries++){if(labels.some(l=>Math.abs(l.x-x)<(l.w+w)/2+3&&Math.abs(l.y-y)<32*sy))y-=33*sy;else break}
  labels.push({x,y,w});
  if(Math.abs(y-base)>20){ctx.strokeStyle='#c5cfaa55';ctx.beginPath();ctx.moveTo(x,y+17*sy);ctx.lineTo(e.x,e.y-(e.orc?73:55)*sy);ctx.stroke()}
  ctx.save();ctx.translate(x,y);ctx.scale(1,sy);
  ctx.fillStyle=e.id===game.targetId?'#17251ff0':'#091b20e8';ctx.fillRect(-w/2,-15,w,30);
  ctx.strokeStyle=e.id===game.targetId?SPELLS[game.spell].color:'#7d968157';ctx.lineWidth=1;ctx.strokeRect(-w/2,-15,w,30);
  ctx.fillStyle=e.id===game.targetId?'#f0ecc8':'#e0e8d9';ctx.fillText(txt,0,0);
  ctx.fillStyle='#243c31';ctx.fillRect(-w/2,16,w,3);ctx.fillStyle=e.orc?'#d2a276':'#9bbd80';ctx.fillRect(-w/2,16,w*Math.max(0,e.hp/e.maxHp),3);
  ctx.restore();
 }
}
function draw(dt){wall+=dt;ctx.clearRect(0,0,1200,760);ctx.save();if(shake>0){shake-=dt;ctx.translate(Math.sin(wall*95)*3,Math.cos(wall*87)*2)}if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,1200,760);else{ctx.fillStyle='#1b322a';ctx.fillRect(0,0,1200,760)}
 for(let i=0;i<18;i++){const x=(i*173+Math.sin(wall*.25+i)*35)%1200,y=(i*127+wall*3)%760;ctx.fillStyle=`rgba(207,223,148,${.15+.2*Math.sin(wall+i)})`;ctx.fillRect(x,y,2,2)}
 for(const e of [...game.enemies].sort((a,b)=>a.y-b.y))drawMonster(e);drawArcher();drawLabels();
 const active=game.mode==='playing';for(const f of fx){if(active)f.life-=dt;const p=1-f.life/f.max;ctx.globalAlpha=Math.max(0,f.life/f.max);if(f.type==='arrow'){
 const x=f.startX+(f.x-f.startX)*p,y=f.startY+(f.y-f.startY)*p,angle=Math.atan2(f.y-f.startY,f.x-f.startX);
 ctx.save();ctx.globalAlpha=1;ctx.translate(x,y);ctx.rotate(angle);
 ctx.strokeStyle='#f4d69c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(0,0);ctx.stroke();
 ctx.fillStyle='#e0e8db';ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(-4,-3);ctx.lineTo(-4,3);ctx.fill();
 ctx.strokeStyle='#cfb88c';ctx.beginPath();ctx.moveTo(-15,-3);ctx.lineTo(-12,0);ctx.lineTo(-15,3);ctx.stroke();ctx.restore();
 }else if(f.type==='cast'){ctx.strokeStyle=SPELLS[f.spell].color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y-20,10+p*32,0,Math.PI*2);ctx.stroke()}else if(f.type==='death'){const x=f.x+(CX-f.x)*p*p,y=f.y+(CY-60-f.y)*p*p;ctx.fillStyle='#c9b5f1';ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8);ctx.restore()}else if(f.type==='spark'){ctx.fillStyle='#ffe5a0';ctx.fillRect(f.x+Math.cos(f.angle)*f.speed*p,f.y+Math.sin(f.angle)*f.speed*p,4,4)}else{ctx.fillStyle='#edc398';ctx.fillRect(f.x-4,f.y-25,8,8)}}ctx.globalAlpha=1;fx=fx.filter(f=>f.life>0);if(flash>0){flash-=dt;ctx.fillStyle=`rgba(255,237,179,${Math.max(0,flash*.65)})`;ctx.fillRect(0,0,1200,760);ctx.strokeStyle=`rgba(255,237,179,${Math.max(0,flash)})`;ctx.lineWidth=16;ctx.beginPath();ctx.arc(CX,CY,(1.2-flash)*850,0,Math.PI*2);ctx.stroke()}ctx.restore();}
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;spriteYScale=(canvas.clientWidth/1200)/(canvas.clientHeight/760)||1;archer.scaleY=spriteYScale;game.update(dt);archer.update(dt,game.mode,game.nearest(),game.arrowIn);processEvents();draw(dt);renderUI();requestAnimationFrame(frame)}renderUI();requestAnimationFrame(frame);

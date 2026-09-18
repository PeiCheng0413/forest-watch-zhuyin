'use strict';
const {Game,KEYS,SPELLS,CX,CY,display,formatInput}=ForestCore;
const game=new Game();
const storyBook=new ForestStory.StoryBook();const $=id=>document.getElementById(id);const canvas=$('canvas'),ctx=canvas.getContext('2d');const bg=new Image();bg.src='assets/forest-empty-tower.png';
const {ARCHER,ArcherMotion,monsterPose,towerLight}=ForestVisuals;
const archer=new ArcherMotion();
const spriteMeta={"archer":{"file":"archer-eight-directions.png","frames":[{"x":47,"y":21,"w":265,"h":270,"pivotX":154,"pivotY":288},{"x":370,"y":37,"w":231,"h":256,"pivotX":468,"pivotY":290},{"x":705,"y":25,"w":172,"h":268,"pivotX":784,"pivotY":290},{"x":972,"y":54,"w":235,"h":239,"pivotX":1095,"pivotY":290},{"x":18,"y":327,"w":278,"h":276,"pivotX":150,"pivotY":600},{"x":370,"y":330,"w":225,"h":274,"pivotX":483,"pivotY":601},{"x":718,"y":323,"w":156,"h":278,"pivotX":788,"pivotY":598},{"x":980,"y":327,"w":222,"h":276,"pivotX":1090,"pivotY":600},{"x":46,"y":642,"w":241,"h":267,"pivotX":154,"pivotY":906},{"x":372,"y":653,"w":220,"h":256,"pivotX":468,"pivotY":906},{"x":699,"y":645,"w":188,"h":267,"pivotX":784,"pivotY":909},{"x":975,"y":664,"w":223,"h":247,"pivotX":1095,"pivotY":908},{"x":44,"y":941,"w":251,"h":275,"pivotX":165,"pivotY":1213},{"x":370,"y":941,"w":225,"h":275,"pivotX":483,"pivotY":1213},{"x":706,"y":941,"w":168,"h":275,"pivotX":791,"pivotY":1213},{"x":983,"y":941,"w":216,"h":275,"pivotX":1094,"pivotY":1213}]},"monsters":{"file":"monsters-walk.png","frames":[{"x":95,"y":17,"w":308,"h":354,"pivotX":257,"pivotY":368},{"x":509,"y":21,"w":341,"h":351,"pivotX":708,"pivotY":369},{"x":994,"y":23,"w":293,"h":351,"pivotX":1148,"pivotY":371},{"x":1393,"y":16,"w":335,"h":360,"pivotX":1592,"pivotY":373},{"x":4,"y":389,"w":426,"h":467,"pivotX":248,"pivotY":853},{"x":453,"y":395,"w":434,"h":472,"pivotX":701,"pivotY":864},{"x":921,"y":390,"w":409,"h":471,"pivotX":1146,"pivotY":858},{"x":1359,"y":393,"w":408,"h":471,"pivotX":1590,"pivotY":861}]}};
const archerImage=new Image(),monsterImage=new Image();
archerImage.src='assets/archer-eight-directions.png';monsterImage.src='assets/monsters-rig.png';
let assetsReady=false,spriteYScale=1;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let castNotice=null;const feedbackAnimations=[];
const assetLoads=[bg,archerImage,monsterImage,$('wandArt')].map(img=>new Promise((resolve,reject)=>{if(img.complete&&img.naturalWidth)return resolve();img.onload=resolve;img.onerror=()=>reject(new Error(img.src))}));
$('start').disabled=true;$('start').textContent='正在載入森林與角色…';
Promise.all(assetLoads).then(()=>{assetsReady=true;$('start').disabled=false;$('start').textContent='開始守護 ↗'}).catch(()=>{$('start').textContent='素材載入失敗，請重新整理';toast('角色素材尚未載入完成，請檢查連線後重新整理。')});
let fx=[],last=performance.now(),wall=0,shake=0,flash=0,sound=false,audio=null,best=null,previousMode='',toastTimer;
try{best=JSON.parse(localStorage.getItem('forest-watch-best-v1'))}catch{}
try{game.setEnabledSpells(JSON.parse(localStorage.getItem('forest-watch-spells-v1')))}catch{game.setEnabledSpells(null)}
const fmt=t=>{const s=Math.floor(t);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
$('best').textContent=best?.time?fmt(best.time):'—';
function beep(freq,duration=.12,type='sine',volume=.045){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.55,audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2400)}
function renderStory(){
 const page=storyBook.current();
 $('storyChapter').textContent=page.chapter;$('storyTitle').textContent=page.title;$('storySpeaker').textContent=page.speaker;
 $('storyParagraphs').replaceChildren(...page.paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p}));
 $('storyAside').textContent=page.aside;
 $('storyTranslation').classList.toggle('revealed',page.reveal);$('storyTranslation').setAttribute('aria-hidden',String(!page.reveal));
 $('storyPrevious').disabled=storyBook.index===0;
 $('storyNext').textContent=storyBook.index===ForestStory.PAGES.length-1?'前往箭塔 →':'繼續聆聽 →';
 $('storyProgress').textContent=`${storyBook.index+1} / ${ForestStory.PAGES.length}`;
 $('storyTitle').focus({preventScroll:true});
 if(!reducedMotion.matches)$('storyParagraphs').animate([{opacity:.3,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:300});
}
function openStory(){
 game.mode='story';game.enemies=[];game.input='';storyBook.reset();renderUI();
 if(!$('storyDialog').open)$('storyDialog').showModal();renderStory();
}
function closeStory(){
 if($('storyDialog').open)$('storyDialog').close();game.mode='start';renderUI();
 (assetsReady?$('start'):$('replayStory')).focus({preventScroll:true});
}
function start(){if(!assetsReady||$('storyDialog').open)return;archer.reset();canvas.focus({preventScroll:true});game.reset();fx=[];castNotice=null;for(const a of feedbackAnimations)a.cancel();feedbackAnimations.length=0;$('castNotice').hidden=true;flash=0;shake=0;$('feedback').textContent='輸入任一魔物的完整真名，再按 Enter 施法。';$('feedback').className='';previousMode='';renderUI();beep(440)}
$('replayStory').onclick=openStory;
$('storyNext').onclick=()=>{if(storyBook.next())renderStory();else closeStory()};
$('storyPrevious').onclick=()=>{storyBook.previous();renderStory()};
$('skipStory').onclick=closeStory;
$('storyDialog').addEventListener('cancel',e=>{e.preventDefault();closeStory()});
$('start').onclick=start;$('again').onclick=start;$('restartPaused').onclick=start;
$('home').onclick=()=>{game.mode='start';game.enemies=[];game.input='';renderUI()};$('pause').onclick=()=>{game.pause();renderUI()};$('resume').onclick=()=>{game.pause();renderUI()};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('game').requestFullscreen()}catch{toast('此瀏覽器無法開啟全螢幕，可改用瀏覽器的全螢幕功能。')}};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=`音效 ${sound?'開':'關'}`;$('sound').setAttribute('aria-label',sound?'關閉音效':'開啟音效');beep(580)};
document.querySelectorAll('[data-spell]').forEach(b=>b.onclick=()=>{
 if(!game.toggleSpell(+b.dataset.spell)){toast('至少保留一種啟用的法術。');return}
 try{localStorage.setItem('forest-watch-spells-v1',JSON.stringify(game.enabledSpells))}catch{toast('已套用設定；瀏覽器無法儲存，下次開啟需重新設定。')}
 renderUI();
});
function handleGameKey(e){
 if(e.ctrlKey||e.metaKey||e.altKey){game.clearSpaceTap();return;}
 if(e.key!==' ')game.clearSpaceTap();
 if(e.key==='Tab'&&game.mode==='playing'&&!e.shiftKey){e.preventDefault();e.stopPropagation();if(!e.repeat)game.changeSpell(1);processEvents();renderUI();return;}
 const active=['playing','ritual'].includes(game.mode);
 // Game controls must be handled before IME checks, and before button defaults.
 const control=['ArrowLeft','ArrowRight','Escape'].includes(e.key);
 if(control){
  if(!active&&!(game.mode==='paused'&&e.key==='Escape'))return;
  e.preventDefault();e.stopPropagation();
  if(e.repeat)return;
  if(e.key==='Escape')game.pause();
  else game.changeSpell(e.key==='ArrowLeft'?-1:1);
  processEvents();renderUI();return;
 }
 if(!active)return;
 if(e.isComposing||e.keyCode===229){game.clearSpaceTap();toast('請先切換成英文輸入法，再按注音對應鍵位。');return}
 const key=e.key.toLowerCase();
 if(KEYS[key]||['Backspace','Enter'].includes(e.key)){e.preventDefault();e.stopPropagation()}
 if(e.repeat&&e.key!=='Backspace')return;
 if(e.key===' '){game.tapSpace(e.timeStamp)}else if(e.key==='Enter')game.submit();else game.type(e.key==='Backspace'?'Backspace':key);
 processEvents();renderUI();
}
window.addEventListener('keydown',handleGameKey,{capture:true});
window.addEventListener('blur',()=>game.clearSpaceTap());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','ritual'].includes(game.mode)){game.pause();renderUI()}});
function processEvents(){for(const e of game.events){switch(e.type){case'volley':showVolley(e);break;case'area':fx.push({...e,life:.9,max:.9});break;case'cast':showCastFeedback(e);break;case'infection':fx.push({...e,type:'cast',infected:true,life:1.25,max:1.25});break;case'wrong':castNotice=null;$('castNotice').hidden=true;beep(110,.2,'triangle');if(game.mode==='ritual'){$('ritualMessage').textContent='咒語不正確，已清空。看清楚聲調，再試一次。';$('ritualMessage').classList.add('bad')}else{$('feedback').textContent='場上沒有符合此真名的魔物，已清空。請確認名字與聲調。';$('feedback').className='bad'}break;case'death':fx.push({...e,life:.9,max:.9});beep(740,.08,'sine',.02);break;case'clash':fx.push({...e,life:.2,max:.2});break;case'hurt':shake=.22;beep(80,.15,'triangle');break;case'ultimate':pulseWand('#ffe5a0',true);flash=1.2;for(let i=0;i<80;i++)fx.push({type:'spark',x:CX,y:CY,angle:Math.random()*Math.PI*2,speed:80+Math.random()*650,life:1.6,max:1.6});beep(1000,1,'sine',.12);toast(`曙光降臨！祝福 × ${e.blessings} · 每輪 ${e.blessings+1} 支箭`);break;case'ritual':beep(700,.8);break;case'end':saveResult();break;}}game.events=[];}
function showVolley(event){
 const origin=archer.shoot(event.shots[0]);let remaining=12;
 for(const target of event.shots){
  const shown=Math.min(target.count,remaining);if(!shown)break;
  for(let i=0;i<shown;i++){
   const offset=(i-(shown-1)/2)*5,dx=target.x-origin.startX,dy=target.y-origin.startY,length=Math.hypot(dx,dy)||1;
   const shot={startX:origin.startX-dy/length*offset,startY:origin.startY+dx/length*offset,x:target.x,y:target.y-(target.orc?35:23)*spriteYScale};
   const duration=Math.max(.2,Math.min(.48,length/1400));fx.push({type:'arrow',...shot,life:duration,max:duration});
  }
  remaining-=shown;
 }
}
function showCastFeedback(e){
 const spell=SPELLS[e.spell];
 fx.push({...e,life:1.25,max:1.25});
 if(e.announce===false)return;
 pulseWand(spell.color);
 castNotice={left:1.8};
 const message=`✓ ${spell.name}施法成功${e.area?` · 範圍命中 ${e.count} 隻`:e.count>1?` · ${e.count} 隻同名魔物`:e.refreshed?' · 效果刷新':''}`;
 $('castNotice').textContent=message;$('castNotice').hidden=false;
 $('castNotice').style.setProperty('--cast-color',spell.color);
 $('feedback').textContent=`${message}｜${e.targetLabel}`;$('feedback').className='good';
 for(const a of feedbackAnimations)a.cancel();feedbackAnimations.length=0;
 if(!reducedMotion.matches){
  const inputPanel=document.querySelector('.type-row'),button=document.querySelector(`[data-spell="${e.spell}"]`);
  feedbackAnimations.push(inputPanel.animate([{boxShadow:`inset 0 0 24px ${spell.color}88`,borderColor:spell.color},{boxShadow:'inset 0 0 0 transparent',borderColor:'#3c5352'}],{duration:650}));
  feedbackAnimations.push(button.animate([{transform:'translateY(-3px)',boxShadow:`0 0 18px ${spell.color}aa`},{transform:'translateY(0)',boxShadow:'none'}],{duration:420}));
 }
 playCastSound(e.spell);
}
function pulseWand(color,ultimate=false){
 const burst=document.querySelector('.wand-burst');burst.style.setProperty('--burst-color',color);
 for(const a of burst.getAnimations())a.cancel();
 burst.animate([{opacity:0},{opacity:ultimate?1:.85,offset:.15},{opacity:0}],{duration:ultimate?1100:650});
 if(!reducedMotion.matches){const art=document.querySelector('.wand-motion');for(const a of art.getAnimations())a.cancel();art.animate([{transform:'rotate(0deg)'},{transform:'rotate(-13deg)',offset:.25},{transform:'rotate(4deg)',offset:.6},{transform:'rotate(0deg)'}],{duration:450})}
}
function playCastSound(spell){
 if(!sound)return;
 try{
  audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();
  const base=[440,260,560,660][spell];
  for(const [index,ratio]of [1,1.5,2].entries()){
   const at=audio.currentTime+index*.055,o=audio.createOscillator(),g=audio.createGain();
   o.type=spell===1?'triangle':'sine';o.frequency.setValueAtTime(base*ratio,at);
   g.gain.setValueAtTime(.001,at);g.gain.exponentialRampToValueAtTime(.045,at+.012);g.gain.exponentialRampToValueAtTime(.001,at+.19);
   o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+.2);
  }
 }catch{}
}
function saveResult(){const record=!best||game.time>best.time;let saved=true;if(record){best={time:game.time,stones:game.stones,casts:game.casts,accuracy:game.attempts?Math.round(game.correct/game.attempts*100):0};try{localStorage.setItem('forest-watch-best-v1',JSON.stringify(best))}catch{saved=false}$('best').textContent=fmt(best.time)}$('endTitle').textContent=record?'新的守望紀錄。':'火光仍會再燃。';$('endTime').textContent=fmt(game.time);$('endStones').textContent=game.stones;$('endCasts').textContent=game.casts;$('endAccuracy').textContent=game.attempts?`${Math.round(game.correct/game.attempts*100)}%`:'—';$('recordMessage').textContent=!saved?'瀏覽器無法儲存紀錄，本次成績仍顯示於此。':record?'你的最佳成績已儲存在此瀏覽器。':`個人最佳 ${fmt(best.time)}，再試一次吧。`}
function renderUI(){const mode=game.mode;if(['start','ended'].includes(mode))$('castNotice').hidden=true;const matches=game.matches(true),exact=game.matches();$('blessingStatus').textContent=game.blessings?`弓箭手祝福 ${game.blessings} 層，每輪 ${game.blessings+1} 支箭`:'';$('time').textContent=fmt(game.time);$('hp').textContent=`${Math.ceil(game.hp)} / 100`;$('hpbar').style.width=`${game.hp}%`;$('hpbar').style.background=game.hp<30?'#e9957d':'#a9c894';$('energy').textContent=`${game.energy} / ${game.energyMax}`;$('wandLight').style.setProperty('--unfilled',`${100-game.energy/game.energyMax*100}%`);$('wand').classList.toggle('ready',game.energy>=game.energyMax);$('wand').classList.toggle('resting',mode!=='playing');$('wand').style.setProperty('--wand-color',SPELLS[game.spell].color);$('wand').setAttribute('aria-label',`魔杖能量 ${game.energy} / ${game.energyMax}`);$('wandHint').textContent=game.energy>=game.energyMax?(mode==='ritual'?'吟唱中 · 曙光即將降臨':game.input?'清空輸入後，空白鍵 × 2':'已蓄滿 · 空白鍵 × 2'):'收集魔石，為魔杖蓄光';$('target').textContent='真名';$('targetType').textContent=!game.input?'直接輸入任一魔物的名字':exact.length?`名字吻合 · Enter 施法${exact.length>1?'（全部命中）':''}`:matches.length?`${matches.length} 隻名字符合 · 繼續輸入`:'沒有相符的真名';$('input').replaceChildren();if(game.input&&mode==='playing'){$('input').textContent=formatInput(game.input);$('input').classList.toggle('bad',matches.length===0)}else{const p=document.createElement('span');p.className='placeholder';p.textContent='在此輸入注音';$('input').append(p);$('input').classList.remove('bad')}
 $('phase').textContent=game.time<60?'森林邊境 · 單字試煉':game.time<180?'暗影漸深 · 雙字詞現身':'長夜守望 · 魔物持續增援';$('pause').disabled=['start','story','ended'].includes(mode);$('pause').textContent=mode==='paused'?'繼續':'暫停';document.querySelectorAll('[data-spell]').forEach(b=>{const index=+b.dataset.spell,enabled=game.enabledSpells[index],selected=index===game.spell;b.classList.toggle('active',selected);b.classList.toggle('spell-off',!enabled);b.setAttribute('aria-pressed',String(enabled));b.title=['中毒：80 範圍，持續 10 秒，可傳染','石化：120 範圍，停止行動 4.5 秒','燃燒：持續 3.5 秒，快速灼傷','混亂：持續 6 秒，移速 1.8 倍，轉而攻擊其他魔物'][index];b.setAttribute('aria-label',`${SPELLS[index].name}，${enabled?'已啟用':'已停用'}${selected?'，使用中':''}，點擊${enabled?'停用':'啟用'}`);b.querySelector('small').textContent=!enabled?'已停用':selected?'使用中':'已啟用';});
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
 if(game.blessings>0){
  ctx.save();ctx.translate(ARCHER.x,ARCHER.y+2);ctx.scale(1,spriteYScale);ctx.strokeStyle='#f5d58c';ctx.shadowColor='#edc16f';ctx.shadowBlur=10;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,24,7,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#102024df';ctx.fillRect(30,-26,150,40);ctx.font='12px "PingFang TC",sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#f5d58c';ctx.fillText(`祝福 × ${game.blessings}`,36,-15);ctx.fillText(`每輪 ${game.blessings+1} 支箭`,36,2);ctx.restore();
 }
 const frame=spriteMeta.archer.frames[archer.frame()];
 const recoil=archer.releaseLeft>0?Math.sin(archer.releaseLeft/.26*Math.PI)*1.4:0;
 const angle=archer.direction*Math.PI/4,pose=reducedMotion.matches?{sway:0,breath:1,lean:0}:archer.idlePose();
 ctx.save();ctx.translate(ARCHER.x+pose.sway,ARCHER.y);ctx.transform(1,0,pose.lean,pose.breath,0,0);
 drawSprite(archerImage,frame,-Math.cos(angle)*recoil,0,.17);ctx.restore();
}
const monsterBuffer=document.createElement('canvas');monsterBuffer.width=160;monsterBuffer.height=160;
const mc=monsterBuffer.getContext('2d');
const rigs=[
 {body:[50,125,425,450,260,510],far:[185,650,200,330,255,685],near:[195,1060,210,390,265,1095],bodyScale:.085,legScale:.063,hip:21},
 {body:[500,45,524,550,750,535],far:[630,620,250,390,730,670],near:[645,1045,225,430,735,1100],bodyScale:.098,legScale:.073,hip:26}
];
function rigPart(part,x,y,scale,angle=0){mc.save();mc.translate(x,y);mc.rotate(angle);mc.drawImage(monsterImage,part[0],part[1],part[2],part[3],(part[0]-part[4])*scale,(part[1]-part[5])*scale,part[2]*scale,part[3]*scale);mc.restore()}
function drawMonster(e){
 const stone=e.effects[1]>0,height=(e.orc?79:60)*spriteYScale,light=towerLight(e.x,e.y);
 const pose=monsterPose(game.time,e.id,e.orc,e.moving,stone),rig=rigs[e.orc?1:0];
 // Ground shadow extends away from the tower's light, independently of facing.
 ctx.save();ctx.translate(e.x,e.y+3);ctx.rotate(Math.atan2(-light.y,-light.x));ctx.fillStyle='#020b10a0';ctx.beginPath();ctx.ellipse(light.shadow*.45,0,light.shadow,e.orc?8:6,0,0,Math.PI*2);ctx.fill();ctx.restore();
 if(monsterImage.complete&&monsterImage.naturalWidth){
  mc.clearRect(0,0,160,160);mc.save();mc.imageSmoothingEnabled=false;mc.translate(80,130);if(e.facingX<0)mc.scale(-1,1);
  rigPart(rig.far,-4,-rig.hip,rig.legScale,pose.far);
  rigPart(rig.near,5,-rig.hip,rig.legScale,pose.near);
  rigPart(rig.body,0,-rig.hip+pose.bob,rig.bodyScale);mc.restore();
  // Tint only opaque sprite pixels. The light vector stays in world space after flipping.
  mc.globalCompositeOperation='source-atop';mc.fillStyle=`rgba(4,13,26,${1-light.brightness})`;mc.fillRect(0,0,160,160);
  const ly=light.y*.8,gradient=mc.createLinearGradient(80-light.x*32,98-ly*32,80+light.x*32,98+ly*32);
  gradient.addColorStop(0,'rgba(0,7,17,.38)');gradient.addColorStop(.5,'rgba(0,0,0,0)');gradient.addColorStop(1,`rgba(255,211,132,${.12+light.brightness*.14})`);mc.fillStyle=gradient;mc.fillRect(0,0,160,160);mc.globalCompositeOperation='source-over';
  ctx.save();const hit=fx.some(f=>f.type==='cast'&&f.targetId===e.id&&f.max-f.life<.16);if(stone)ctx.filter='grayscale(1) brightness(1.15)';if(hit&&!reducedMotion.matches)ctx.filter=stone?'grayscale(1) brightness(1.8)':'brightness(1.7)';
  ctx.imageSmoothingEnabled=false;ctx.drawImage(monsterBuffer,e.x-80,e.y-130*spriteYScale,160,160*spriteYScale);ctx.restore();
 }
 if(e.effects[2]>0){for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#ffe18b':'#ed8852';ctx.fillRect(e.x-15+i*8,e.y-10-Math.sin(game.time*12+i)*6,4,9)}}
 if(e.effects[0]>0){ctx.fillStyle='#b1dc67';for(let i=0;i<3;i++)ctx.fillRect(e.x-15+i*13,e.y-height-((game.time*15+i*9)%15),3,3)}
 if(e.effects[3]>0){ctx.strokeStyle='#cb9bed';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y-height-5,15,4,game.time,0,Math.PI*1.5);ctx.stroke()}
 if(stone){ctx.strokeStyle='#d7e5eb99';ctx.lineWidth=2;ctx.strokeRect(e.x-(e.orc?29:23),e.y-height,e.orc?58:46,height+4)}

}
function drawLabels(){
 const labels=[],sy=spriteYScale;
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 21px "PingFang TC", "Microsoft JhengHei", sans-serif';
 for(const e of [...game.enemies].sort((a,b)=>a.y-b.y)){
  const matched=!!game.input&&e.entry.answer.startsWith(game.input),txt=display(e.entry),w=ctx.measureText(txt).width+20,base=e.y-(e.orc?95:77)*sy;
  const x=Math.max(w/2+12,Math.min(1200-w/2-12,e.x));let y=Math.max(22*sy,base);
  for(let tries=0;tries<6;tries++){if(labels.some(l=>Math.abs(l.x-x)<(l.w+w)/2+3&&Math.abs(l.y-y)<32*sy))y-=33*sy;else break}
  labels.push({x,y,w});
  if(Math.abs(y-base)>20){ctx.strokeStyle='#c5cfaa55';ctx.beginPath();ctx.moveTo(x,y+17*sy);ctx.lineTo(e.x,e.y-(e.orc?73:55)*sy);ctx.stroke()}
  ctx.save();ctx.translate(x,y);ctx.scale(1,sy);
  ctx.fillStyle=matched?'#17251ff0':'#091b20e8';ctx.fillRect(-w/2,-15,w,30);
  ctx.strokeStyle=matched?SPELLS[game.spell].color:'#7d968157';ctx.lineWidth=1;ctx.strokeRect(-w/2,-15,w,30);
  ctx.fillStyle=matched?'#f0ecc8':'#e0e8d9';ctx.fillText(txt,0,0);
  ctx.fillStyle='#243c31';ctx.fillRect(-w/2,16,w,3);ctx.fillStyle=e.orc?'#d2a276':'#9bbd80';ctx.fillRect(-w/2,16,w*Math.max(0,e.hp/e.maxHp),3);
  ctx.restore();
 }
}
function drawCastEffect(f,p){
 const target=game.enemies.find(e=>e.id===f.targetId);
 if(target){f.x=target.x;f.y=target.y}
 const color=SPELLS[f.spell].color,sy=spriteYScale;
 if(f.infected&&p<.65){
  ctx.save();ctx.strokeStyle='#b3d77e';ctx.fillStyle='#d7ef99';ctx.globalAlpha=Math.max(0,1-p/.65);ctx.lineWidth=1;
  const sx=f.startX,sy0=f.startY-22*sy,tx=f.x,ty=f.y-22*sy;
  if(reducedMotion.matches){ctx.beginPath();ctx.moveTo(sx,sy0);ctx.lineTo(tx,ty);ctx.stroke()}
  else for(let i=0;i<6;i++){const t=Math.max(0,Math.min(1,p*2.4-i*.09)),x=sx+(tx-sx)*t,y=sy0+(ty-sy0)*t+Math.sin(t*Math.PI*3+i)*4;ctx.beginPath();ctx.arc(x,y,2+i%2,0,Math.PI*2);ctx.fill()}
  ctx.restore();
 }
 ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,sy);
 const progress=reducedMotion.matches?.35:Math.min(1,p*2);
 ctx.globalAlpha=Math.min(1,f.life/.3);
 ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.5;
 ctx.beginPath();ctx.ellipse(0,2,22+progress*22,8+progress*6,0,0,Math.PI*2);ctx.stroke();
 if(p<.65){
  ctx.globalAlpha=Math.max(0,1-p/.65);
  for(let i=0;i<10;i++){
   const a=i*Math.PI/5+(f.spell===3?progress*2:0),radius=12+progress*40;
   const x=Math.cos(a)*radius,y=-28+Math.sin(a)*radius*.75;
   if(f.spell===1){ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x+4,y);ctx.lineTo(x,y+6);ctx.lineTo(x-4,y);ctx.closePath();ctx.fill()}
   else if(f.spell===0){ctx.beginPath();ctx.arc(x,y,2+i%3,0,Math.PI*2);ctx.stroke()}
   else{ctx.fillRect(x,y-(f.spell===2?progress*15:0),3,f.spell===2?7:3)}
  }
 }
 // Keep only the newest caption on each monster when spells arrive rapidly.
 if(fx.filter(other=>other.type==='cast'&&other.targetId===f.targetId).at(-1)!==f){ctx.restore();return}
 // Text stays below the monster, separate from its name above the head.
 ctx.globalAlpha=Math.min(1,f.life/.3);ctx.font='bold 17px "PingFang TC", "Microsoft JhengHei", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 const label=f.infected?'中毒傳染':`✓ ${SPELLS[f.spell].name}${f.refreshed?'刷新':'命中'}`,w=ctx.measureText(label).width+18,y=27-(reducedMotion.matches?0:p*5);
 ctx.fillStyle='#081b20ee';ctx.fillRect(-w/2,y-13,w,26);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.strokeRect(-w/2,y-13,w,26);ctx.fillStyle=color;ctx.fillText(label,0,y);ctx.restore();
}
function draw(dt){const wr=document.querySelector('.wand-art').getBoundingClientRect(),cr=canvas.getBoundingClientRect(),wandX=(wr.left+wr.width/2-cr.left)/cr.width*1200,wandY=(wr.top+wr.height*.19-cr.top)/cr.height*760;wall+=dt;ctx.clearRect(0,0,1200,760);ctx.save();if(shake>0){shake-=dt;ctx.translate(Math.sin(wall*95)*3,Math.cos(wall*87)*2)}if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,1200,760);else{ctx.fillStyle='#1b322a';ctx.fillRect(0,0,1200,760)}
 for(let i=0;i<18;i++){const x=(i*173+Math.sin(wall*.25+i)*35)%1200,y=(i*127+wall*3)%760;ctx.fillStyle=`rgba(207,223,148,${.15+.2*Math.sin(wall+i)})`;ctx.fillRect(x,y,2,2)}
 for(const e of [...game.enemies].sort((a,b)=>a.y-b.y))drawMonster(e);drawArcher();drawLabels();
 const active=game.mode==='playing';for(const f of fx){if(active)f.life-=dt;const p=1-f.life/f.max;ctx.globalAlpha=Math.max(0,f.life/f.max);if(f.type==='arrow'){
 const x=f.startX+(f.x-f.startX)*p,y=f.startY+(f.y-f.startY)*p,angle=Math.atan2(f.y-f.startY,f.x-f.startX);
 ctx.save();ctx.globalAlpha=1;ctx.translate(x,y);ctx.rotate(angle);
 ctx.strokeStyle='#f4d69c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(0,0);ctx.stroke();
 ctx.fillStyle='#e0e8db';ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(-4,-3);ctx.lineTo(-4,3);ctx.fill();
 ctx.strokeStyle='#cfb88c';ctx.beginPath();ctx.moveTo(-15,-3);ctx.lineTo(-12,0);ctx.lineTo(-15,3);ctx.stroke();ctx.restore();
 }else if(f.type==='area'){ctx.save();ctx.globalAlpha=(1-p)*.7;ctx.strokeStyle=SPELLS[f.spell].color;ctx.fillStyle=SPELLS[f.spell].color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,f.radius,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=(1-p)*.07;ctx.fill();ctx.restore()}else if(f.type==='cast'){drawCastEffect(f,p)}else if(f.type==='death'){const x=f.x+(wandX-f.x)*p*p,y=f.y+(wandY-f.y)*p*p;ctx.fillStyle='#c9b5f1';ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8);ctx.restore()}else if(f.type==='spark'){ctx.fillStyle='#ffe5a0';ctx.fillRect(f.x+Math.cos(f.angle)*f.speed*p,f.y+Math.sin(f.angle)*f.speed*p,4,4)}else{ctx.fillStyle='#edc398';ctx.fillRect(f.x-4,f.y-25,8,8)}}ctx.globalAlpha=1;fx=fx.filter(f=>f.life>0);if(flash>0){flash-=dt;ctx.fillStyle=`rgba(255,237,179,${Math.max(0,flash*.65)})`;ctx.fillRect(0,0,1200,760);ctx.strokeStyle=`rgba(255,237,179,${Math.max(0,flash)})`;ctx.lineWidth=16;ctx.beginPath();ctx.arc(CX,CY,(1.2-flash)*850,0,Math.PI*2);ctx.stroke()}ctx.restore();}
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;spriteYScale=(canvas.clientWidth/1200)/(canvas.clientHeight/760)||1;archer.scaleY=spriteYScale;if(castNotice&&game.mode==='playing'){castNotice.left-=dt;if(castNotice.left<=0){castNotice=null;$('castNotice').hidden=true}}game.update(dt);archer.update(dt,game.mode,game.nearest(),game.arrowIn);processEvents();draw(dt);renderUI();requestAnimationFrame(frame)}renderUI();openStory();requestAnimationFrame(frame);

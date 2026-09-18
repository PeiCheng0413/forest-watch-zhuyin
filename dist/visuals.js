(function(root){
'use strict';
// Clockwise screen-space directions: E, SE, S, SW, W, NW, N, NE.
const ARCHER={x:596,y:307,handY:283};
function direction8(dx,dy,fallback=2){
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)<.001)return fallback;
 return (Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
}
class ArcherMotion{
 constructor(){this.reset()}
 reset(){this.direction=2;this.scaleY=1;this.releaseLeft=0;this.drawing=false;this.target=null;this.idleTime=0}
 aim(target){if(!target)return;this.target={x:target.x,y:target.y-(target.orc?35:23)*this.scaleY};this.direction=direction8(this.target.x-ARCHER.x,(this.target.y-this.handY())/this.scaleY,this.direction)}
 handY(){return ARCHER.y-(ARCHER.y-ARCHER.handY)*this.scaleY}
 update(dt,mode,target,shotIn){
  if(mode!=='playing')return;
  this.idleTime+=dt;
  this.releaseLeft=Math.max(0,this.releaseLeft-dt);
  if(this.releaseLeft>0)return;
  this.aim(target);this.drawing=!!target&&shotIn<.4;
 }
 shoot(target){
  this.aim(target);this.releaseLeft=.26;this.drawing=false;
  const angle=this.direction*Math.PI/4;
  return {startX:ARCHER.x+Math.cos(angle)*17,startY:this.handY()+Math.sin(angle)*10*this.scaleY,x:this.target.x,y:this.target.y,direction:this.direction};
 }
 idlePose(){
  if(this.drawing||this.releaseLeft>0)return {sway:0,breath:1,lean:0};
  return {sway:Math.sin(this.idleTime*1.9)*1.15,breath:1+Math.sin(this.idleTime*2.5)*.035,lean:Math.sin(this.idleTime*1.4)*.025};
 }
 frame(){return this.direction+(this.drawing?0:8)}
}
function monsterPose(time,id,orc,moving,stone){
 const phase=time*(orc?5:7)+id,step=moving&&!stone?Math.sin(phase):0;
 return {near:step*.28,far:-step*.28,bob:moving&&!stone?Math.cos(phase*2)*.55:0};
}
function towerLight(x,y){
 const dx=600-x,dy=387-y,d=Math.hypot(dx,dy),falloff=Math.min(1,Math.hypot(dx/520,dy/300));
 return {x:d?dx/d:0,y:d?dy/d:-1,brightness:1-.48*falloff,shadow:12+falloff*20};
}
const api={ARCHER,direction8,ArcherMotion,monsterPose,towerLight};
if(typeof module!=='undefined')module.exports=api;else root.ForestVisuals=api;
})(typeof window!=='undefined'?window:globalThis);

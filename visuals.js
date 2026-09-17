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
 reset(){this.direction=2;this.scaleY=1;this.releaseLeft=0;this.drawing=false;this.target=null}
 aim(target){if(!target)return;this.target={x:target.x,y:target.y-(target.orc?35:23)*this.scaleY};this.direction=direction8(this.target.x-ARCHER.x,(this.target.y-this.handY())/this.scaleY,this.direction)}
 handY(){return ARCHER.y-(ARCHER.y-ARCHER.handY)*this.scaleY}
 update(dt,mode,target,shotIn){
  if(mode!=='playing')return;
  this.releaseLeft=Math.max(0,this.releaseLeft-dt);
  if(this.releaseLeft>0)return;
  this.aim(target);this.drawing=!!target&&shotIn<.4;
 }
 shoot(target){
  this.aim(target);this.releaseLeft=.26;this.drawing=false;
  const angle=this.direction*Math.PI/4;
  return {startX:ARCHER.x+Math.cos(angle)*17,startY:this.handY()+Math.sin(angle)*10*this.scaleY,x:this.target.x,y:this.target.y,direction:this.direction};
 }
 frame(){return this.direction+(this.drawing?0:8)}
}
const api={ARCHER,direction8,ArcherMotion};
if(typeof module!=='undefined')module.exports=api;else root.ForestVisuals=api;
})(typeof window!=='undefined'?window:globalThis);

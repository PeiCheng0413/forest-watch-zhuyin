const assert=require('node:assert/strict');
const {ArcherMotion,ARCHER,direction8}=require('../dist/visuals.js');
const {Game}=require('../dist/core.js');
const metadata=require('../dist/assets/frames.json');
for(let d=0;d<8;d++){
 const angle=d*Math.PI/4,dx=Math.cos(angle)*200,dy=Math.sin(angle)*200;
 assert.equal(direction8(dx,dy),d);
 const archer=new ArcherMotion(),target={x:ARCHER.x+dx,y:ARCHER.handY+dy+23};
 archer.update(.05,'playing',target,.2);assert.equal(archer.direction,d);assert.equal(archer.frame(),d);
 const shot=archer.shoot(target);assert.equal(shot.direction,d);assert.equal(archer.frame(),d+8);
 assert.ok(Math.hypot(shot.startX-ARCHER.x,shot.startY-ARCHER.handY)<=20);
 const frozen=JSON.stringify(archer);archer.update(.2,'paused',{x:0,y:0},0);assert.equal(JSON.stringify(archer),frozen);
 archer.update(.2,'ritual',{x:0,y:0},0);assert.equal(JSON.stringify(archer),frozen);
 archer.update(.1,'playing',{x:0,y:0},1);assert.equal(archer.direction,d,'放箭動作完成前維持方向');
 archer.reset();assert.equal(archer.direction,2);assert.equal(archer.releaseLeft,0);
}
assert.equal(direction8(0,0,7),7);assert.equal(direction8(1,-.1),0);assert.equal(direction8(1,.1),0);
assert.equal(metadata.archer.frames.length,16);assert.equal(metadata.monsters.frames.length,8);
for(const [kind,size]of [['archer',[1254,1254]],['monsters',[1774,887]]])for(const f of metadata[kind].frames){assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=size[0]&&f.y+f.h<=size[1]);assert.ok(f.pivotX>=f.x&&f.pivotX<=f.x+f.w);}
const g=new Game(()=>.5);g.reset();const e=g.spawn();g.update(.05);assert.equal(e.moving,true);assert.equal(e.facingX,1);e.effects[1]=3;g.update(.05);assert.equal(e.moving,false);
console.log('PASS: 八方向量化、拉弓與放箭影格、箭矢出發點、暫停凍結、重開重設、素材裁切界線及石化停止步行。');
const wide=new ArcherMotion();wide.scaleY=2;wide.update(.05,'playing',{x:ARCHER.x,y:wide.handY()-200+46},.2);assert.equal(wide.direction,6);assert.equal(wide.frame(),6);assert.ok(wide.shoot({x:800,y:300}).startY<ARCHER.y);
const fs=require('node:fs'),path=require('node:path');const gameSource=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');assert.deepEqual(JSON.parse(gameSource.match(/const spriteMeta=(.*);/)[1]),metadata);

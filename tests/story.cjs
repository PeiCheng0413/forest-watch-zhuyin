const assert=require('node:assert/strict');const {PAGES,StoryBook}=require('../dist/story.js');const {Game}=require('../dist/core.js');
const story=new StoryBook();assert.equal(PAGES.length,4);assert.equal(story.current().reveal,false);story.previous();assert.equal(story.index,0);
assert.equal(story.next(),true);assert.equal(story.current().reveal,true);story.next();story.next();assert.equal(story.next(),false);assert.equal(story.index,3);story.reset();assert.equal(story.index,0);
const game=new Game();game.mode='story';for(let i=0;i<100;i++)game.update(.05);assert.equal(game.time,0);assert.equal(game.enemies.length,0);assert.equal(game.hp,100);game.type('g');game.submit();assert.equal(game.input,'');assert.equal(game.attempts,0);
const fs=require('node:fs'),path=require('node:path');const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);for(const id of ['storyDialog','storyTitle','storyNext','skipStory','storyPrevious','replayStory'])assert.ok(ids.includes(id));
assert.ok(html.includes('assets/magic-guardian-scroll.png'));assert.ok(html.includes('https://justfont.com/justforfun/elf-bpmf'));
console.log('PASS: 四幕流程、上一幕邊界、最後一幕結束、重讀重設、序章時不計時不出怪不輸入、入口與素材來源。');

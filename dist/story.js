(function(root){
'use strict';
const PAGES=[
 {chapter:'序章 · 異界的召喚',title:'「終於，等到你了。」',speaker:'邊境賢者',paragraphs:['你原本只是坐在鍵盤前。下一刻，陌生的森林、塔上的火光，和一位披著長袍的賢者，出現在眼前。','「黑暗森林的魔物正逼近王國。我們需要的，不是另一位戰士，而是一個能讀懂古老文字的人。」'],aside:'賢者遞來一張卷軸。那些彎曲的筆畫，似乎在哪裡見過。',reveal:false},
 {chapter:'第一幕 · 你早已認識的文字',title:'魔法文字，竟然是注音。',speaker:'你與賢者',paragraphs:['你凝視卷軸，慢慢認出熟悉的聲音：「ㄇㄛˊ、ㄈㄚˇ、ㄕㄡˇ、ㄏㄨˋ……魔法守護？」','賢者微笑點頭。「在你的世界，它們叫注音。在這裡，它們是能與靈魂共鳴的魔法文字。你早已學會了我們尋找的能力。」'],aside:'熟悉的注音，換上了異世界的筆跡。聲音沒有改變，力量卻被喚醒了。',reveal:true},
 {chapter:'第二幕 · 靈魂的真名',title:'讀出真名，魔法才有方向。',speaker:'邊境魔法師',paragraphs:['每個生物的靈魂，都有一個真正的名字。賢者的「靈魂鑑定」能讓它顯現；而這片森林裡的魔物，真名恰好全由注音文字構成。','「我能施展法術，卻需要你準確解讀那些名字。」身旁的魔法師說。「把真名輸入鍵盤、按下 Enter 傳給我，我就能讓那隻魔物中毒、石化、燃燒，或陷入混亂。」'],aside:'你是真名解讀者，魔法師是施術者。每一次正確輸入，都是一次共同施法。',reveal:true},
 {chapter:'第三幕 · 森林邊境的守望',title:'現在，讓我們一起守住它。',speaker:'邊境賢者',paragraphs:['塔上的王國弓箭手已經拉開長弓。哥布林與獸人正從四周湧來——請辨識牠們的真名，協助魔法師削弱敵人，守住王國的邊境箭塔。','擊敗魔物留下的魔石，會逐漸積滿能量。當魔石共鳴，戰場將暫時凝結；你讀出完整咒語，魔法師便能喚來「曙光降臨」，清除眼前的魔物。'],aside:'「不必急著成為英雄。先讀出第一個名字，剩下的，交給我們一起完成。」',reveal:true}
];
class StoryBook{
 constructor(){this.index=0}
 reset(){this.index=0}
 current(){return PAGES[this.index]}
 next(){if(this.index>=PAGES.length-1)return false;this.index++;return true}
 previous(){this.index=Math.max(0,this.index-1)}
}
const api={PAGES,StoryBook};if(typeof module!=='undefined')module.exports=api;else root.ForestStory=api;
})(typeof window!=='undefined'?window:globalThis);

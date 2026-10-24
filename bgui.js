var BGFOILS=[["ذهبي", ["#d9ad45", "#b98a22", "#e8c866", "#a8761a"]], ["ذهبي فاتح", ["#f0d98c", "#d9b855", "#f7e8ae", "#c9a243"]], ["ذهبي قديم", ["#b99a52", "#8f7230", "#cfb56e", "#7d6226"]], ["شمبانيا", ["#f3e3c3", "#dcc79b", "#faf0d8", "#cdb585"]], ["ذهبي وردي", ["#e2a98a", "#c98563", "#efc2a6", "#bd7650"]], ["روز غولد غامق", ["#c98a82", "#a96a63", "#dba59d", "#9a5c56"]], ["نحاسي", ["#cf9570", "#b06a45", "#dfae90", "#9c5835"]], ["برونزي", ["#a8794a", "#7d5530", "#c19467", "#6b4627"]], ["فضي", ["#c4c9ce", "#98a0a8", "#d6dadf", "#818890"]], ["فضي أزرق", ["#b9c6d8", "#8ea1bb", "#cfd9e7", "#7a8ea9"]], ["أخضر مذهّب", ["#9aa66b", "#6f7e45", "#b7c184", "#5f6d3a"]], ["بنفسجي لامع", ["#9a7bb5", "#71538f", "#b79bcf", "#5f437d"]]];
var BGPLAIN=['#ffffff','#fbf3e2','#f3e6e6','#e8eef5','#111111','#0f2a44','#7a1f3d','#2f4a3a'];
function bgH2(h){h=h.replace('#','');var r=parseInt(h.substr(0,2),16)/255,g=parseInt(h.substr(2,2),16)/255,b=parseInt(h.substr(4,2),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=0,hh=0,d=mx-mn;if(d){s=l>.5?d/(2-mx-mn):d/(mx+mn);hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;hh*=60}return[hh,s,l]}
function bgHx(h,s,l){h=((h%360)+360)%360;var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return '#'+[r,g,b].map(function(v){return('0'+Math.round((v+m)*255).toString(16)).slice(-2)}).join('')}
function bgFoil(hex,lev){var q=bgH2(hex),h=q[0],sa=q[1],l=q[2],k=(lev==null?60:lev)/100,up=.07+k*.2,dn=.06+k*.15;return[bgHx(h,sa,Math.min(.92,l+up*.6)),bgHx(h,sa,Math.max(.04,l-dn*.4)),bgHx(h,sa*.8,Math.min(.96,l+up)),bgHx(h,sa,Math.max(.03,l-dn))]}
function bgStops(B){var t=B.bgt||'p';if(t==='f'){var f=BGFOILS[B.bgf||0];return f?f[1]:null}if(t==='c'&&B.bgmet&&/^#[0-9a-f]{6}$/i.test(B.bgc||''))return bgFoil(B.bgc,B.bglv);return null}
function bgStyle(x,w,h,B){var st=bgStops(B);if(!st)return B.bgc||'#ffffff';var g=x.createLinearGradient(0,0,w,h),p=[0,.28,.52,.78,1],c=[st[0],st[1],st[2],st[3],st[0]];p.forEach(function(q,i){g.addColorStop(q,c[i])});return g}
function bgCss(st){return 'linear-gradient(135deg,'+st[0]+' 0%,'+st[1]+' 28%,'+st[2]+' 52%,'+st[3]+' 78%,'+st[0]+' 100%)'}
function bgUI(B,noPad){var on=!!B.bgm,t=B.bgt||'p',ring=function(a){return a?'0 0 0 3px #a9852f':'0 0 0 1.5px #e3dccd'},sw=function(att,bg,a,tt){return '<button type="button" '+att+' title="'+(tt||'')+'" style="width:34px;height:34px;border-radius:50%;border:2px solid #fff;padding:0;cursor:pointer;background:'+bg+';box-shadow:'+ring(a)+'"></button>'},
 ob=function(att,lab,a){return '<button type="button" '+att+' style="font:inherit;border:1.5px solid '+(a?'#a9852f':'#e3dccd')+';background:'+(a?'#fbf4e2':'#fff')+';border-radius:10px;padding:8px 14px;min-height:42px;cursor:pointer;color:#2b2a26">'+lab+'</button>'},
 rg=function(id,lab,mn,mx,v,st){return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#7a746a">'+lab+'<input type="range" id="'+id+'" min="'+mn+'" max="'+mx+'" step="'+(st||1)+'" value="'+v+'"></label>'},
 cc=/^#[0-9a-f]{6}$/i.test(B.bgc||'')?B.bgc:'#c9962f',row='display:flex;flex-wrap:wrap;gap:8px;align-items:center';
 return '<div style="display:grid;gap:10px"><div style="'+row+'">'+ob('data-bgo="0"','بدون خلفية',!on)+ob('data-bgo="1"','بخلفية',on)+'</div>'+
 '<div style="font-size:13px;color:#7a746a">ألوان عادية</div><div style="'+row+'">'+BGPLAIN.map(function(c){return sw('data-bgp="'+c+'"',c,on&&t==='p'&&B.bgc===c,c)}).join('')+'</div>'+
 '<div style="font-size:13px;color:#7a746a">ألوان لامعة (متلألئة)</div><div style="'+row+'">'+BGFOILS.map(function(f,i){return sw('data-bgfi="'+i+'"',bgCss(f[1]),on&&t==='f'&&(B.bgf||0)===i,f[0])}).join('')+'</div>'+
 '<div style="font-size:13px;color:#7a746a">أي لون آخر</div><div style="'+row+'"><input type="color" id="bgcc" value="'+cc+'" style="width:46px;height:42px;border:1.5px solid #e3dccd;border-radius:10px;padding:2px;background:#fff"><label style="display:flex;align-items:center;gap:6px;font-size:14px"><input type="checkbox" id="bgmet"'+(B.bgmet?' checked':'')+'> متلألئ</label>'+rg('bglv','قوة اللمعان',0,100,B.bglv==null?60:B.bglv)+'</div>'+
 (noPad?'':'<div style="'+row+'">'+rg('bgpd','هامش حول الشكل',0,10,B.bgpd==null?3:B.bgpd,.5)+rg('bgrr','تدوير الزوايا',0,20,B.bgrr==null?2:B.bgrr,.5)+'</div>')+'</div>'}
function bgHandle(e,B){var t=e.target;
 if(e.type==='click'){var b=t.closest&&t.closest('[data-bgo],[data-bgp],[data-bgfi]');if(!b)return '';
  if(b.hasAttribute('data-bgo'))B.bgm=b.getAttribute('data-bgo')==='1';
  else if(b.hasAttribute('data-bgp')){B.bgm=true;B.bgt='p';B.bgc=b.getAttribute('data-bgp');B.bgmet=false}
  else{B.bgm=true;B.bgt='f';B.bgf=+b.getAttribute('data-bgfi')}return 'ui'}
 if(e.type==='input'||e.type==='change'){
  if(t.id==='bgcc'){B.bgm=true;B.bgt='c';B.bgc=t.value;return e.type==='change'?'ui':'draw'}
  if(t.id==='bgmet'){B.bgm=true;B.bgt='c';B.bgmet=t.checked;if(!/^#[0-9a-f]{6}$/i.test(B.bgc||''))B.bgc='#c9962f';return 'ui'}
  if(t.id==='bglv'){B.bgm=true;B.bgt='c';B.bgmet=true;B.bglv=+t.value;if(!/^#[0-9a-f]{6}$/i.test(B.bgc||''))B.bgc='#c9962f';return 'draw'}
  if(t.id==='bgpd'){B.bgpd=+t.value;return 'draw'}
  if(t.id==='bgrr'){B.bgrr=+t.value;return 'draw'}}
 return ''}

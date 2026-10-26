/* يمنع تحرك الشاشة خلف أي نافذة (modal / sheet / lightbox) أثناء اللمس والتمرير */
(function(){
var sy=0,sx=0,vw=0,vh=0;
function cs(e){return getComputedStyle(e)}
function canScroll(el,dx,dy){
  var s=cs(el),oy=s.overflowY,ox=s.overflowX;
  if(Math.abs(dy)>=Math.abs(dx)){
    if((oy==='auto'||oy==='scroll')&&el.scrollHeight>el.clientHeight+1){
      if(dy>0)return el.scrollTop>0;           // الإصبع للأسفل = المحتوى يصعد للأعلى
      return el.scrollTop+el.clientHeight<el.scrollHeight-1;
    }
  }else{
    if((ox==='auto'||ox==='scroll')&&el.scrollWidth>el.clientWidth+1){
      if(dx>0)return Math.abs(el.scrollLeft)>0;
      return Math.abs(el.scrollLeft)+el.clientWidth<el.scrollWidth-1;
    }
  }
  return false;
}
function overlayOf(el){
  for(var n=el;n&&n.nodeType===1&&n!==document.body&&n!==document.documentElement;n=n.parentElement){
    var s=cs(n);
    if(s.position==='fixed'){
      var r=n.getBoundingClientRect();
      if(r.width>=innerWidth*.9&&r.height>=innerHeight*.9)return n;
    }
  }
  return null;
}
document.addEventListener('touchstart',function(e){
  var t=e.touches[0];if(t){sy=t.clientY;sx=t.clientX;}
},{passive:true,capture:true});
document.addEventListener('touchmove',function(e){
  if(!e.touches||e.touches.length!==1||!e.cancelable)return;
  var tg=e.target;if(!tg||tg.nodeType!==1)return;
  var ov=overlayOf(tg);if(!ov)return;
  if(tg.tagName==='INPUT'&&tg.type==='range')return;
  var t=e.touches[0],dx=t.clientX-sx,dy=t.clientY-sy;
  for(var n=tg;n&&n.nodeType===1;n=n.parentElement){
    if(canScroll(n,dx,dy))return;
    if(n===ov)break;
  }
  e.preventDefault();
},{passive:false,capture:true});
})();

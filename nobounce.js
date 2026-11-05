(function(){var sx=0,sy=0;
function sc(el,dy,dx){var d=document;for(;el&&el!==d.documentElement&&el!==d.body&&el.nodeType===1;el=el.parentElement){var cs=getComputedStyle(el);
if(dy!==0&&/(auto|scroll)/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+1){if(dy>0&&el.scrollTop>0)return 1;if(dy<0&&el.scrollTop+el.clientHeight<el.scrollHeight-1)return 1;}
if(dx!==0&&/(auto|scroll)/.test(cs.overflowX)&&el.scrollWidth>el.clientWidth+1)return 1;}
if(dy!==0){var r=d.scrollingElement||d.documentElement;if(dy>0&&r.scrollTop>0)return 1;if(dy<0&&r.scrollTop+r.clientHeight<r.scrollHeight-1)return 1;}
return 0;}
document.addEventListener('touchstart',function(e){var t=e.touches[0];if(t){sx=t.clientX;sy=t.clientY;}},{passive:true});
document.addEventListener('touchmove',function(e){if(e.touches.length!==1||e.defaultPrevented)return;var t=e.touches[0],dx=t.clientX-sx,dy=t.clientY-sy,el=e.target;
if(!el||!el.closest||el.closest('input,textarea,select,[contenteditable],canvas'))return;
if(Math.abs(dy)>=Math.abs(dx)){if(!sc(el,dy,0)&&e.cancelable)e.preventDefault();}
else{if(!sc(el,0,dx)&&e.cancelable)e.preventDefault();}},{passive:false});})();

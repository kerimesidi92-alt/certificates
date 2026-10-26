/* يحدّث القوائم (الثيمات/المكتبة/المعرض) دون إعادة بناء الصور: لا وميض ولا بياض */
(function(){
function attrs(a,b){
  for(var i=a.attributes.length-1;i>=0;i--){var n=a.attributes[i].name;if(!b.hasAttribute(n))a.removeAttribute(n);}
  for(var j=0;j<b.attributes.length;j++){var x=b.attributes[j];if(a.getAttribute(x.name)!==x.value)a.setAttribute(x.name,x.value);}
}
function kids(a,b){
  var ak=a.childNodes,bk=b.childNodes,i=0;
  for(;i<bk.length;i++){
    var n=bk[i],o=ak[i];
    if(!o){a.appendChild(n.cloneNode(true));continue;}
    if(o.nodeType!==n.nodeType||o.nodeName!==n.nodeName){a.replaceChild(n.cloneNode(true),o);continue;}
    if(n.nodeType===3){if(o.nodeValue!==n.nodeValue)o.nodeValue=n.nodeValue;continue;}
    if(n.nodeType!==1)continue;
    if(o.nodeName==='IMG'){
      var os=o.getAttribute('src'),ns=n.getAttribute('src');
      /* الصورة المحدّثة برمجياً (لون/مصغّرة) لا نعيدها للأصل البطيء */
      if(os!==ns&&o.dataset&&o.dataset.th&&n.getAttribute('src')&&/^data:image\/gif/.test(ns))n.setAttribute('src',os);
    }
    if(o.classList&&o.classList.contains('th')&&n.classList.contains('th')&&o.dataset.t===n.dataset.t&&o.firstElementChild&&o.querySelector('*'))continue;
    attrs(o,n);kids(o,n);
    var nm=o.nodeName;
    if(nm==='INPUT'){if(o.type==='checkbox'||o.type==='radio')o.checked=n.hasAttribute('checked');else if(o.type!=='file'&&document.activeElement!==o)o.value=n.getAttribute('value')||'';}
    else if(nm==='TEXTAREA'){if(document.activeElement!==o)o.value=n.textContent;}
    else if(nm==='OPTION')o.selected=n.hasAttribute('selected');
  }
  while(ak.length>bk.length)a.removeChild(a.lastChild);
}
window.kSet=function(el,html,on){
  if(!on||!el.firstChild){el.innerHTML=html;return;}
  var t=document.createElement('template');t.innerHTML=html;kids(el,t.content);
};
window.kMorph=function(el){
  if(!el||el.__km)return;el.__km=1;
  var d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  Object.defineProperty(el,'innerHTML',{configurable:true,get:function(){return d.get.call(this);},set:function(v){
    if(!this.firstChild){d.set.call(this,v);return;}
    var t=document.createElement('template');t.innerHTML=v;kids(this,t.content);
  }});
};
})();

/* kPdf: builds a real PDF (exact page size, JPEG .97 pages) and opens it.
   items: urls / Blobs / canvases / functions returning one of those (lazy, one at a time in memory).
   Pages are encoded one by one and kept as Blobs, so hundreds of pages do not exhaust memory. */
(function(){
var enc=new TextEncoder();
function loadUrl(u){return new Promise(function(res,rej){var im=new Image();im.onload=function(){res(im);};im.onerror=function(){rej(new Error('img'));};im.src=u;});}
function load(s){
  if(s instanceof Blob){if(window.createImageBitmap)return createImageBitmap(s);return loadUrl(URL.createObjectURL(s));}
  if(typeof s==='string')return loadUrl(s);
  return Promise.resolve(s);}
function dim(d){return {w:d.naturalWidth||d.width,h:d.naturalHeight||d.height};}
function jpg(c,q){return new Promise(function(res,rej){c.toBlob(function(b){b?res(b):rej(new Error('jpg'));},'image/jpeg',q);});}
/* -> {b:Blob(jpeg), w, h} */
function encode(src,q){
  var lazy=typeof src==='function';
  return Promise.resolve(lazy?src():src).then(function(s){
    if(s instanceof Blob&&s.type==='image/jpeg'){return load(s).then(function(d){var z=dim(d);if(d.close)d.close();return {b:s,w:z.w,h:z.h};});}
    var own=lazy&&s instanceof HTMLCanvasElement;
    return load(s).then(function(d){
      var z=dim(d),c=document.createElement('canvas');c.width=z.w;c.height=z.h;
      var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,z.w,z.h);x.drawImage(d,0,0);
      if(d.close)d.close();if(own)d.width=d.height=0;
      return jpg(c,q).then(function(b){c.width=c.height=0;return {b:b,w:z.w,h:z.h};});
    });
  });
}
function note(i,n){try{var w=kPdf._w;if(w&&!w.closed&&w.document&&w.document.body)w.document.body.textContent='جارٍ تجهيز ملف الطباعة… '+i+' / '+n;}catch(_){}}
/* order: page sequence of item indexes; wmm,hmm: page size in millimetres */
function build(items,order,wmm,hmm,opt){
  opt=opt||{};var q=opt.q||.97,pw=wmm/25.4*72,ph=hmm/25.4*72,imgs=[],n=order.length,nI=items.length;
  var chain=Promise.resolve();
  items.forEach(function(it,i){chain=chain.then(function(){note(i+1,nI);return encode(it,q).then(function(r){imgs.push(r);return new Promise(function(ok){setTimeout(ok,0);});});});});
  return chain.then(function(){
    var parts=[],offs=[],len=0;
    function push(x){var u=typeof x==='string'?enc.encode(x):x;parts.push(u);len+=(u.size!==undefined?u.size:u.length);}
    var imgObj=function(i){return 3+i},pageObj=function(k){return 3+nI+2*k},conObj=function(k){return 4+nI+2*k},total=2+nI+2*n;
    function obj(id,fn){offs[id]=len;push(id+' 0 obj\n');fn();push('\nendobj\n');}
    push('%PDF-1.4\n');
    obj(1,function(){push('<</Type/Catalog/Pages 2 0 R/ViewerPreferences<</PrintScaling/None/PickTrayByPDFSize true/Duplex/Simplex>>>>');});
    obj(2,function(){push('<</Type/Pages/Count '+n+'/Kids['+order.map(function(_,k){return pageObj(k)+' 0 R'}).join(' ')+']>>');});
    imgs.forEach(function(im,i){obj(imgObj(i),function(){push('<</Type/XObject/Subtype/Image/Width '+im.w+'/Height '+im.h+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+im.b.size+'>>\nstream\n');push(im.b);push('\nendstream');});});
    order.forEach(function(i,k){
      obj(pageObj(k),function(){push('<</Type/Page/Parent 2 0 R/MediaBox[0 0 '+pw.toFixed(2)+' '+ph.toFixed(2)+']/Resources<</XObject<</I '+imgObj(i)+' 0 R>>>>/Contents '+conObj(k)+' 0 R>>');});
      var cs='q '+pw.toFixed(2)+' 0 0 '+ph.toFixed(2)+' 0 0 cm /I Do Q';
      obj(conObj(k),function(){push('<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream');});});
    var xo=len;push('xref\n0 '+(total+1)+'\n0000000000 65535 f \n');
    for(var id=1;id<=total;id++)push(String(offs[id]).padStart(10,'0')+' 00000 n \n');
    push('trailer\n<</Size '+(total+1)+'/Root 1 0 R>>\nstartxref\n'+xo+'\n%%EOF');
    return new Blob(parts,{type:'application/pdf'});
  });
}
/* open the window NOW (inside the click), then point it at the PDF when ready */
function show(p,name,err){
  var w=null;
  try{w=window.open('','_blank');if(w)w.document.write('<meta name="viewport" content="width=device-width"><body style="font:18px sans-serif;text-align:center;padding:40px;direction:rtl">جارٍ تجهيز ملف الطباعة…</body>');}catch(_){}
  kPdf._w=w;
  Promise.resolve(p).then(function(bl){kPdf._w=null;var u=URL.createObjectURL(bl);
    if(w){try{w.location.href=u;return;}catch(_){}}
    var a=document.createElement('a');a.href=u;a.target='_blank';a.download=(name||'print')+'.pdf';document.body.appendChild(a);a.click();a.remove();
  }).catch(function(e){kPdf._w=null;if(w)try{w.close()}catch(_){}(err||alert)((e&&e.userMsg)||'تعذّر تجهيز ملف الطباعة');});
}
function say(m){try{var w=kPdf._w;if(w&&!w.closed&&w.document&&w.document.body)w.document.body.textContent=m;}catch(_){}}
window.kPdf={build:build,show:show,load:load,say:say,_w:null};
})();

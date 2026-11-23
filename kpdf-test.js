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
function encode(src,q,PG){
  var lazy=typeof src==='function';
  return Promise.resolve(lazy?src():src).then(function(s){
    if(s instanceof Blob&&s.type==='image/jpeg'&&!(kPdf.bleed&&isA4(PG))){return load(s).then(function(d){var z=dim(d);if(d.close)d.close();return {b:s,w:z.w,h:z.h};});}
    var own=lazy&&s instanceof HTMLCanvasElement;
    return load(s).then(function(d){
      var z=dim(d),c=document.createElement('canvas');c.width=z.w;c.height=z.h;
      var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,z.w,z.h);if(kPdf.bleed&&isA4(PG)&&reachesEdge(d,z))bleedDraw(x,d,z,PG);else x.drawImage(d,0,0);
      if(d.close)d.close();if(own)d.width=d.height=0;
      return jpg(c,q).then(function(b){c.width=c.height=0;return {b:b,w:z.w,h:z.h};});
    });
  });
}

/* ---- optional printer-edge fix (test): for A4 pages whose design reaches the paper edge.
   Portrait: design moved 2 mm from the left and ends 2 mm above the bottom; landscape: moved 0.8 mm left / 0.9 mm up, 0.3 mm short on right/bottom.
   The strips that open up are filled with the design's own edge colour (sampled 3 px inside). Off unless kPdf.bleed is true. */
function isA4(PG){return !!PG&&((Math.abs(PG.w-210)<1&&Math.abs(PG.h-297)<1)||(Math.abs(PG.w-297)<1&&Math.abs(PG.h-210)<1));}
function reachesEdge(d,z){
  try{var tw=Math.min(240,z.w),th=Math.max(2,Math.round(tw*z.h/z.w)),c=document.createElement('canvas');c.width=tw;c.height=th;
    var x=c.getContext('2d',{willReadFrequently:true});x.drawImage(d,0,0,tw,th);var D=x.getImageData(0,0,tw,th).data,n=0,t=0;
    function px(i,j){var o=(j*tw+i)*4;t++;if(D[o]<235||D[o+1]<235||D[o+2]<235)n++;}
    for(var i=0;i<tw;i++){px(i,0);px(i,1);px(i,th-1);px(i,th-2);}
    for(var j=0;j<th;j++){px(0,j);px(1,j);px(tw-1,j);px(tw-2,j);}
    c.width=c.height=0;return n/t>.3;}catch(_){return false;}}
function bleedDraw(x,d,z,PG){
  var W=z.w,H=z.h,k=W/PG.w,land=PG.w>PG.h,s=3,
  X=land?-0.8:2,Y=land?-0.9:0,Wm=land?PG.w-0.3:PG.w-2,Hm=land?PG.h-0.3:PG.h-2,
  tx=Math.round(X*k),ty=Math.round(Y*k),tw=Math.round(Wm*k),th=Math.round(Hm*k),rx=tx+tw,by=ty+th;
  if(tx>0)x.drawImage(d,s,0,1,H,0,ty,tx,th);
  if(rx<W)x.drawImage(d,W-1-s,0,1,H,rx,ty,W-rx,th);
  if(ty>0)x.drawImage(d,0,s,W,1,tx,0,tw,ty);
  if(by<H)x.drawImage(d,0,H-1-s,W,1,tx,by,tw,H-by);
  if(tx>0&&ty>0)x.drawImage(d,s,s,1,1,0,0,tx,ty);
  if(rx<W&&ty>0)x.drawImage(d,W-1-s,s,1,1,rx,0,W-rx,ty);
  if(tx>0&&by<H)x.drawImage(d,s,H-1-s,1,1,0,by,tx,H-by);
  if(rx<W&&by<H)x.drawImage(d,W-1-s,H-1-s,1,1,rx,by,W-rx,H-by);
  x.drawImage(d,tx,ty,tw,th);}
function note(i,n){try{var w=kPdf._w;if(w&&!w.closed&&w.document&&w.document.body)w.document.body.textContent='جارٍ تجهيز ملف الطباعة… '+i+' / '+n;}catch(_){}}
/* order: page sequence of item indexes; wmm,hmm: page size in millimetres */
function build(items,order,wmm,hmm,opt){
  opt=opt||{};var PG={w:wmm,h:hmm},q=opt.q||.97,pw=wmm/25.4*72,ph=hmm/25.4*72,imgs=[],n=order.length,nI=items.length;
  var chain=Promise.resolve();
  items.forEach(function(it,i){chain=chain.then(function(){note(i+1,nI);return encode(it,q,PG).then(function(r){imgs.push(r);return new Promise(function(ok){setTimeout(ok,0);});});});});
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

/* pages made of cells: each cell = a shared base image (jpeg) + optional small soft-masked overlay (the name).
   imgs: [{b:Blob(jpeg),w,h}], pages: [[{i,x,y,w,h,ov:{x,y,w,h,rgb:[r,g,b],mw,mh,data:Uint8Array,flate}}]] in points, top-left origin */

/* constant-colour RGB image data as a tiny hand-made zlib stream (fixed Huffman: 3 literals, then repeated matches of length<=258 at distance 3) */
var _sf={};
function _lenCode(l){var b=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],e=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  for(var i=28;i>=0;i--)if(l>=b[i])return {c:257+i,eb:e[i],ev:l-b[i]};}
function solidFlate(rgb,npx){
  var key=rgb.join(',')+'|'+npx;if(_sf[key])return _sf[key];
  var out=[],cur=0,nb=0;
  function bits(v,n){for(var i=n-1;i>=0;i--){cur|=((v>>i)&1)<<nb;nb++;if(nb===8){out.push(cur);cur=0;nb=0;}}}
  function lowBits(v,n){for(var i=0;i<n;i++){cur|=((v>>i)&1)<<nb;nb++;if(nb===8){out.push(cur);cur=0;nb=0;}}}
  function lit(v){if(v<144)bits(0x30+v,8);else bits(0x190+(v-144),9);}
  function sym(c){if(c<256)lit(c);else if(c<280)bits(c-256,7);else bits(0xC0+(c-280),8);}
  bits(1,1);bits(1,2);/* BFINAL=1 (written LSB-first as value), BTYPE=01 */
  return (function(){
    /* header bits must be LSB-first: redo properly */
    out=[];cur=0;nb=0;lowBits(1,1);lowBits(1,2);
    lit(rgb[0]);lit(rgb[1]);lit(rgb[2]);
    var R=3*(npx-1);
    function match(l){var q=_lenCode(l);sym(q.c);if(q.eb)lowBits(q.ev,q.eb);bits(2,5);}
    while(R>0){var l=R>=258?258:R;match(l);R-=l;}
    sym(256);if(nb)out.push(cur);
    var a=1,b=0,r=rgb[0],g=rgb[1],bl=rgb[2];
    for(var i=0;i<npx;i++){a=(a+r)%65521;b=(b+a)%65521;a=(a+g)%65521;b=(b+a)%65521;a=(a+bl)%65521;b=(b+a)%65521;}
    var ad=((b<<16)|a)>>>0,res=new Uint8Array(out.length+6);
    res[0]=0x78;res[1]=0x9C;res.set(out,2);var p=2+out.length;res[p]=ad>>>24;res[p+1]=(ad>>>16)&255;res[p+2]=(ad>>>8)&255;res[p+3]=ad&255;
    res=res.subarray(0,p+4);_sf[key]=res;return res;})();
}
function buildCells(imgs,pages,wmm,hmm){
  var pw=wmm/25.4*72,ph=hmm/25.4*72,parts=[],offs=[],len=0,nid=2,f=function(v){return (+v).toFixed(2);};
  function push(x){var u=typeof x==='string'?enc.encode(x):x;parts.push(u);len+=(u.size!==undefined?u.size:u.length);}
  function obj(id,fn){offs[id]=len;push(id+' 0 obj\n');fn();push('\nendobj\n');}
  var imgId=imgs.map(function(){return ++nid;});
  var pg=pages.map(function(cells){return {page:++nid,con:++nid,cells:cells.map(function(c){var o={c:c};if(c.ov){o.oi=++nid;o.om=++nid;}return o;})};});
  var total=nid;
  push('%PDF-1.4\n');
  obj(1,function(){push('<</Type/Catalog/Pages 2 0 R/ViewerPreferences<</PrintScaling/None/PickTrayByPDFSize true/Duplex/Simplex>>>>');});
  obj(2,function(){push('<</Type/Pages/Count '+pg.length+'/Kids['+pg.map(function(p){return p.page+' 0 R';}).join(' ')+']>>');});
  imgs.forEach(function(im,i){obj(imgId[i],function(){push('<</Type/XObject/Subtype/Image/Width '+im.w+'/Height '+im.h+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+im.b.size+'>>\nstream\n');push(im.b);push('\nendstream');});});
  pg.forEach(function(p){
    var xo='',cs='';
    p.cells.forEach(function(o,j){var c=o.c;xo+='/B'+j+' '+imgId[c.i]+' 0 R ';
      cs+='q '+f(c.w)+' 0 0 '+f(c.h)+' '+f(c.x)+' '+f(ph-(c.y+c.h))+' cm /B'+j+' Do Q\n';
      if(c.ov){var v=c.ov;xo+='/O'+j+' '+o.oi+' 0 R ';cs+='q '+f(v.w)+' 0 0 '+f(v.h)+' '+f(c.x+v.x)+' '+f(ph-(c.y+v.y+v.h))+' cm /O'+j+' Do Q\n';}});
    obj(p.page,function(){push('<</Type/Page/Parent 2 0 R/MediaBox[0 0 '+f(pw)+' '+f(ph)+']/Resources<</XObject<<'+xo+'>>>>/Contents '+p.con+' 0 R>>');});
    obj(p.con,function(){push('<</Length '+cs.length+'>>\nstream\n'+cs+'endstream');});
    p.cells.forEach(function(o){if(!o.c.ov)return;var v=o.c.ov;
      obj(o.oi,function(){var sz=solidFlate(v.rgb,v.mw*v.mh);push('<</Type/XObject/Subtype/Image/Width '+v.mw+'/Height '+v.mh+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/FlateDecode/SMask '+o.om+' 0 R/Length '+sz.length+'>>\nstream\n');push(sz);push('\nendstream');});
      obj(o.om,function(){push('<</Type/XObject/Subtype/Image/Width '+v.mw+'/Height '+v.mh+'/ColorSpace/DeviceGray/BitsPerComponent 8'+(v.flate?'/Filter/FlateDecode':'')+'/Length '+v.data.length+'>>\nstream\n');push(v.data);push('\nendstream');});});
  });
  var xo2=len;push('xref\n0 '+(total+1)+'\n0000000000 65535 f \n');
  for(var id=1;id<=total;id++)push(String(offs[id]).padStart(10,'0')+' 00000 n \n');
  push('trailer\n<</Size '+(total+1)+'/Root 1 0 R>>\nstartxref\n'+xo2+'\n%%EOF');
  return new Blob(parts,{type:'application/pdf'});
}
function deflate(u8){
  if(typeof CompressionStream==='undefined')return Promise.resolve({data:u8,flate:false});
  try{var cs=new CompressionStream('deflate'),w=cs.writable.getWriter();w.write(u8);w.close();
    return new Response(cs.readable).arrayBuffer().then(function(ab){return {data:new Uint8Array(ab),flate:true};},function(){return {data:u8,flate:false};});}catch(_){return Promise.resolve({data:u8,flate:false});}
}
function say(m){try{var w=kPdf._w;if(w&&!w.closed&&w.document&&w.document.body)w.document.body.textContent=m;}catch(_){}}
window.kPdf={bleed:false,_bd:function(d,wmm,hmm){var z=dim(d),c=document.createElement('canvas');c.width=z.w;c.height=z.h;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,z.w,z.h);var PG={w:wmm,h:hmm};if(isA4(PG)&&reachesEdge(d,z))bleedDraw(x,d,z,PG);else x.drawImage(d,0,0);return c;},build:build,buildCells:buildCells,deflate:deflate,show:show,load:load,say:say,_w:null};
})();

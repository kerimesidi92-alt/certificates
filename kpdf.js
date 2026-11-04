/* kPdf: builds a real PDF (exact page size, lossless images) and opens it. */
(function(){
var enc=new TextEncoder();
function enc2(c,x,res){
  function jp(){var d=atob(c.toDataURL('image/jpeg',.98).split(',')[1]),b=new Uint8Array(d.length);for(var i=0;i<d.length;i++)b[i]=d.charCodeAt(i);res({b:b,w:c.width,h:c.height,f:'DCTDecode'});}
  if(typeof CompressionStream==='undefined')return jp();
  try{
    var id=x.getImageData(0,0,c.width,c.height).data,n=c.width*c.height,rgb=new Uint8Array(n*3);
    for(var i=0,j=0;i<n;i++){rgb[j++]=id[i*4];rgb[j++]=id[i*4+1];rgb[j++]=id[i*4+2];}
    var cs=new CompressionStream('deflate'),wr=cs.writable.getWriter();wr.write(rgb);wr.close();
    new Response(cs.readable).arrayBuffer().then(function(ab){res({b:new Uint8Array(ab),w:c.width,h:c.height,f:'FlateDecode'});},jp);
  }catch(_){jp();}
}
function toImg(src){return new Promise(function(res,rej){
  if(src instanceof HTMLCanvasElement){enc2(src,src.getContext('2d'),res);return;}
  var im=new Image();im.onload=function(){var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0);enc2(c,x,res);};
  im.onerror=function(){rej(new Error('img'));};im.src=src;});}
/* items: array of urls/canvases; order: page sequence of item indexes; wmm,hmm: page size in millimetres */
function build(items,order,wmm,hmm){
  var pw=wmm/25.4*72,ph=hmm/25.4*72;
  return Promise.all(items.map(toImg)).then(function(imgs){
    var parts=[],offs=[],len=0,n=order.length,nI=imgs.length;
    function push(x){var u=typeof x==='string'?enc.encode(x):x;parts.push(u);len+=u.length;}
    var imgObj=function(i){return 3+i},pageObj=function(k){return 3+nI+2*k},conObj=function(k){return 4+nI+2*k},total=2+nI+2*n;
    function obj(id,fn){offs[id]=len;push(id+' 0 obj\n');fn();push('\nendobj\n');}
    push('%PDF-1.4\n');
    obj(1,function(){push('<</Type/Catalog/Pages 2 0 R/ViewerPreferences<</PrintScaling/None/PickTrayByPDFSize true/Duplex/Simplex>>>>');});
    obj(2,function(){push('<</Type/Pages/Count '+n+'/Kids['+order.map(function(_,k){return pageObj(k)+' 0 R'}).join(' ')+']>>');});
    imgs.forEach(function(im,i){obj(imgObj(i),function(){push('<</Type/XObject/Subtype/Image/Width '+im.w+'/Height '+im.h+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/'+im.f+'/Length '+im.b.length+'>>\nstream\n');push(im.b);push('\nendstream');});});
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
  Promise.resolve(p).then(function(bl){var u=URL.createObjectURL(bl);
    if(w){try{w.location.href=u;return;}catch(_){}}
    var a=document.createElement('a');a.href=u;a.target='_blank';a.download=(name||'print')+'.pdf';document.body.appendChild(a);a.click();a.remove();
  }).catch(function(e){if(w)try{w.close()}catch(_){}(err||alert)((e&&e.userMsg)||'تعذّر تجهيز ملف الطباعة');});
}
window.kPdf={build:build,show:show};
})();

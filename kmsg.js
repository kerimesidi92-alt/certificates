/* Kerima messages + price lists (shared by customer and admin pages) */
(function(){
'use strict';
var D={
 order:{
  ar:'السلام عليكم 🌸\nطلب جديد من «لمسة خاصة»\nالاسم: {name}\nالهاتف: {phone}\nالطلب: {item}\nالكمية: {qty}\nملاحظات: {notes}\nرقم الطلب: {id}',
  fr:'Bonjour 🌸\nNouvelle commande « Lamsa Khasa »\nNom : {name}\nTéléphone : {phone}\nCommande : {item}\nQuantité : {qty}\nRemarques : {notes}\nN° : {id}',
  en:'Hello 🌸\nNew order from “Lamsa Khasa”\nName: {name}\nPhone: {phone}\nOrder: {item}\nQuantity: {qty}\nNotes: {notes}\nOrder no.: {id}'},
 accept:{
  ar:'السلام عليكم {name} 🌸\nاستلمنا طلبك وقبلناه ✅\nالطلب: {item}\nالكمية: {qty}\nالمجموع: {total}\nسنرسل لك المعاينة قريباً لتأكيدها. شكراً لثقتك بنا.',
  fr:'Bonjour {name} 🌸\nVotre commande est acceptée ✅\nCommande : {item}\nQuantité : {qty}\nTotal : {total}\nNous vous enverrons bientôt l’aperçu à confirmer. Merci de votre confiance.',
  en:'Hello {name} 🌸\nYour order is accepted ✅\nOrder: {item}\nQuantity: {qty}\nTotal: {total}\nWe’ll send you the preview shortly to confirm. Thank you for your trust.'},
 ready:{
  ar:'{name} 🌸\nطلبك جاهز ✨\nالطلب: {item}\nالكمية: {qty}\nالمجموع: {total}\nيرجى إرسال المبلغ لنسلّمه لك.',
  fr:'{name} 🌸\nVotre commande est prête ✨\nCommande : {item}\nQuantité : {qty}\nTotal : {total}\nMerci d’envoyer le montant pour la livraison.',
  en:'{name} 🌸\nYour order is ready ✨\nOrder: {item}\nQuantity: {qty}\nTotal: {total}\nPlease send the payment so we can deliver it.'},
 done:{
  ar:'{name} 🌸\nتم تسليم طلبك ✅\nشكراً لثقتك بنا، ويسعدنا خدمتك في مناسباتك القادمة.',
  fr:'{name} 🌸\nVotre commande a été livrée ✅\nMerci de votre confiance, au plaisir de vous servir pour vos prochains événements.',
  en:'{name} 🌸\nYour order has been delivered ✅\nThank you for your trust. We’d love to serve you again at your next occasion.'},
 manual:{
  ar:'السلام عليكم {name} 🌸\nتم تسجيل طلبك ✅\nالطلب: {item}\nالكمية: {qty}\nسعر القطعة: {price}\nالمجموع: {total}\nشكراً لثقتك بنا.',
  fr:'Bonjour {name} 🌸\nVotre commande est enregistrée ✅\nCommande : {item}\nQuantité : {qty}\nPrix unitaire : {price}\nTotal : {total}\nMerci de votre confiance.',
  en:'Hello {name} 🌸\nYour order is recorded ✅\nOrder: {item}\nQuantity: {qty}\nUnit price: {price}\nTotal: {total}\nThank you for your trust.'},
 prices:{
  ar:'السلام عليكم {name} 🌸\nهذه قائمة أسعارنا وخياراتنا (الأوراق والإطارات).\nاختر ما يناسبك وأخبرنا، وسنؤكد لك السعر النهائي.',
  fr:'Bonjour {name} 🌸\nVoici notre liste de prix et d’options (papiers et cadres).\nChoisissez ce qui vous convient et dites-le-nous, nous confirmerons le prix final.',
  en:'Hello {name} 🌸\nHere is our price list and options (papers and frames).\nPick what suits you and let us know, and we’ll confirm the final price.'}
};
var NAMES={order:'رسالة الزبون عند الطلب',accept:'قبول الطلب',ready:'الطلب جاهز',done:'تم التسليم',manual:'طلب يدوي',prices:'إرسال قائمة الأسعار'};
var VARS=[['name','الاسم'],['phone','الهاتف'],['item','الطلب'],['qty','الكمية'],['price','سعر القطعة'],['total','المجموع'],['notes','ملاحظات'],['id','رقم الطلب']];
var LN={ar:'العربية',fr:'Français',en:'English'};
var K={cfg:{},D:D,NAMES:NAMES,VARS:VARS};
window.KMSG=K;
function tpl(key,lang){var c=(K.cfg[key]||{})[lang];if(typeof c==='string'&&c.trim())return c;var d=D[key]||{};return d[lang]||d.ar||'';}
K.tpl=tpl;
K.fill=function(t,v){v=v||{};return String(t).split('\n').map(function(l){var drop=false;l=l.replace(/\{(\w+)\}/g,function(m,k){var x=v[k];if(x===undefined||x===null||String(x).trim()===''){drop=true;return '';}return String(x);});return drop?null:l;}).filter(function(l){return l!==null}).join('\n');};
K.text=function(key,lang,vars){lang=(lang==='fr'||lang==='en')?lang:'ar';return K.fill(tpl(key,lang),vars);};
function sub(){var n=0,t=setInterval(function(){n++;var db=window.__fdb;if(db){clearInterval(t);try{db.collection('config').doc('messages').onSnapshot(function(d){K.cfg=(d.exists&&d.data()&&d.data().m)||{};if(K.onCfg)K.onCfg();},function(){});}catch(_){}}else if(n>60)clearInterval(t);},500);}
sub();

/* ---------------- admin UI ---------------- */
if(!/admin/i.test(location.pathname))return;
function ready(f){if(document.readyState!=='loading')f();else document.addEventListener('DOMContentLoaded',f);}
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var css='#kx{position:fixed;inset:0;z-index:9990;background:var(--bg,#faf6ec);color:var(--fg,#141c33);display:flex;flex-direction:column;box-sizing:border-box;padding:calc(env(safe-area-inset-top,0px) + 10px) 14px calc(env(safe-area-inset-bottom,0px) + 12px);font-family:inherit;direction:rtl}'
+'#kx[hidden]{display:none}#kx .kh{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:8px}#kx .kh b{font-size:18px}'
+'#kx button,#kx select,#kx input,#kx textarea{font:inherit;color:inherit}'
+'#kx .kb{border:1.5px solid var(--line,#d9d2bf);background:var(--surface,#fff);border-radius:12px;padding:8px 14px;cursor:pointer;min-height:40px}'
+'#kx .kb.on{background:var(--hl,#a9852f);color:#fff;border-color:var(--hl,#a9852f);font-weight:700}#kx .kb.pri{background:#16264a;color:#fff;border-color:#16264a;font-weight:700}#kx .kb.red{color:#b3261e}'
+'#kx .kr{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}#kx .kbody{flex:1;overflow:auto;overscroll-behavior:contain;padding-bottom:20px}'
+'#kx textarea{width:100%;min-height:210px;box-sizing:border-box;border:1.5px solid var(--line,#d9d2bf);border-radius:12px;padding:10px;background:var(--surface,#fff);line-height:1.7;font-size:16px}'
+'#kx input[type=text],#kx input[type=number],#kx select{border:1.5px solid var(--line,#d9d2bf);border-radius:10px;padding:8px 10px;background:var(--surface,#fff);min-width:0;font-size:16px}'
+'#kx .kpv{white-space:pre-wrap;background:#dcf8c6;color:#111;border-radius:12px;padding:10px 12px;line-height:1.6;font-size:15px;margin:6px 0}#kx small{opacity:.7}'
+'#kx .row{display:flex;gap:6px;align-items:center;background:var(--surface,#fff);border:1px solid var(--line,#e3dccd);border-radius:12px;padding:6px;margin:6px 0}#kx .row img,#kx .row .ph{width:54px;height:54px;border-radius:10px;object-fit:cover;background:#eee;flex:none;display:grid;place-items:center;cursor:pointer;font-size:12px}#kx .row input[type=text]{flex:1;width:0}#kx .row input[type=number]{width:84px}'
+'#kx .row button{padding:4px 8px;min-height:34px}';
function toast(t){var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 14px);background:#16264a;color:#fff;padding:10px 16px;border-radius:12px;z-index:99999;font-weight:700;font-size:14px';document.body.appendChild(d);setTimeout(function(){d.remove()},2200);}
var root,ST={tab:'msg',key:'order',lang:'ar',plId:null,pl:null,list:[],ids:[],draft:null};
function db(){return window.__fdb}
function build(){
 if(root)return;
 var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
 root=document.createElement('div');root.id='kx';root.hidden=true;document.body.appendChild(root);
 root.addEventListener('click',onClick);root.addEventListener('input',onInput);root.addEventListener('change',onChange);
}
function open(){build();root.hidden=false;document.body.style.overflow='hidden';render();loadIndex();}
function close(){root.hidden=true;document.body.style.overflow='';}
function render(){
 var h='<div class="kh"><button class="kb" data-x="close">إغلاق</button><b>الرسائل وقوائم الأسعار</b></div>'
 +'<div class="kr"><button class="kb'+(ST.tab==='msg'?' on':'')+'" data-x="tab" data-v="msg">الرسائل</button><button class="kb'+(ST.tab==='pl'?' on':'')+'" data-x="tab" data-v="pl">قوائم الأسعار</button></div><div class="kbody">';
 h+=ST.tab==='msg'?msgHtml():plHtml();
 root.innerHTML=h+'</div>';
}
function curText(){var c=(K.cfg[ST.key]||{})[ST.lang];return (typeof c==='string'&&c.trim())?c:(D[ST.key][ST.lang]||'');}
var SAMPLE={name:'محمد',phone:'22233863382',item:'دعوة · A6',qty:'100',price:'5 MRU',total:'500 MRU',notes:'—',id:'AB12'};
function msgHtml(){
 var h='<div class="kr">'+Object.keys(NAMES).map(function(k){return '<button class="kb'+(ST.key===k?' on':'')+'" data-x="key" data-v="'+k+'">'+NAMES[k]+'</button>'}).join('')+'</div>'
 +'<div class="kr">'+['ar','fr','en'].map(function(l){return '<button class="kb'+(ST.lang===l?' on':'')+'" data-x="lang" data-v="'+l+'">'+LN[l]+'</button>'}).join('')+'</div>'
 +'<textarea id="kt" dir="'+(ST.lang==='ar'?'rtl':'ltr')+'">'+esc(curText())+'</textarea>'
 +'<small>اضغطي على الاسم لإدراجه (يملؤه التطبيق تلقائياً، لا تحذفي الأقواس). السطر الذي يكون فارغاً يختفي وحده.</small>'
 +'<div class="kr">'+VARS.map(function(v){return '<button class="kb" data-x="ins" data-v="{'+v[0]+'}">'+v[1]+'</button>'}).join('')+'</div>'
 +'<div class="kr"><button class="kb pri" data-x="save">حفظ</button><button class="kb red" data-x="reset">استرجاع الأصل</button></div>'
 +'<b>المعاينة</b><div class="kpv" dir="'+(ST.lang==='ar'?'rtl':'ltr')+'" id="kpv">'+esc(K.fill(curText(),SAMPLE))+'</div>';
 return h;
}
function saveMsg(txt){
 var m=JSON.parse(JSON.stringify(K.cfg||{}));m[ST.key]=m[ST.key]||{};
 if(txt===null||txt.trim()===(D[ST.key][ST.lang]||'').trim())delete m[ST.key][ST.lang];else m[ST.key][ST.lang]=txt;
 if(!Object.keys(m[ST.key]).length)delete m[ST.key];
 if(!db()){toast('لا يوجد اتصال');return;}
 db().collection('config').doc('messages').set({m:m}).then(function(){K.cfg=m;toast('تم الحفظ ✓');render();}).catch(function(){toast('تعذّر الحفظ');});
}
/* ---- price lists ---- */
function plHtml(){
 var h='<div class="kr">'+ST.ids.map(function(i){return '<button class="kb'+(ST.plId===i.id?' on':'')+'" data-x="plopen" data-v="'+i.id+'">'+esc(i.title||'قائمة')+'</button>'}).join('')+'<button class="kb pri" data-x="plnew">+ قائمة جديدة</button></div>';
 var p=ST.pl;if(!p)return h+'<p><small>اختاري قائمة أو أنشئي واحدة (مثلاً: الأوراق، الإطارات، أسعار الدعوات، أسعار الشهادات).</small></p>';
 h+='<div class="kr"><input type="text" id="pt" value="'+esc(p.title)+'" placeholder="عنوان القائمة" style="flex:1"><select id="pl">'+['ar','fr','en'].map(function(l){return '<option value="'+l+'"'+(p.lang===l?' selected':'')+'>'+LN[l]+'</option>'}).join('')+'</select></div>';
 h+=p.rows.map(function(r,i){return '<div class="row" data-i="'+i+'">'+(r.img?'<img data-x="pick" data-i="'+i+'" src="'+r.img+'">':'<div class="ph" data-x="pick" data-i="'+i+'">صورة</div>')+'<input type="text" data-f="name" data-i="'+i+'" placeholder="الاسم" value="'+esc(r.name)+'"><input type="text" inputmode="decimal" data-f="price" data-i="'+i+'" placeholder="السعر" value="'+esc(r.price)+'"><button class="kb" data-x="up" data-i="'+i+'">▲</button><button class="kb red" data-x="rm" data-i="'+i+'">✕</button></div>'}).join('');
 h+='<div class="kr"><button class="kb" data-x="addrow">+ إضافة صف</button></div>'
 +'<div class="kr"><button class="kb pri" data-x="plsave">حفظ القائمة</button><button class="kb" data-x="plpng">حفظ كصورة</button><button class="kb" data-x="plshare">إرسال على واتساب</button><button class="kb red" data-x="pldel">حذف القائمة</button></div>'
 +'<input type="file" id="kf" accept="image/*" hidden>';
 return h;
}
function loadIndex(){if(!db())return;db().collection('config').doc('pl_index').get().then(function(d){ST.ids=(d.exists&&d.data().ids)||[];if(ST.tab==='pl')render();}).catch(function(){});}
function saveIndex(){return db().collection('config').doc('pl_index').set({ids:ST.ids});}
function plOpen(id){db().collection('config').doc('pl_'+id).get().then(function(d){ST.plId=id;ST.pl=d.exists?d.data():{title:'',lang:'ar',rows:[]};if(!ST.pl.rows)ST.pl.rows=[];render();});}
function plSave(){
 if(!db()||!ST.pl)return Promise.resolve();
 ST.pl.title=($('#pt')||{}).value||ST.pl.title||'قائمة';
 var id=ST.plId,t=ST.pl.title;
 return db().collection('config').doc('pl_'+id).set(ST.pl).then(function(){var f=ST.ids.filter(function(x){return x.id===id})[0];if(f)f.title=t;else ST.ids.push({id:id,title:t});return saveIndex();}).then(function(){toast('تم حفظ القائمة ✓');render();}).catch(function(){toast('تعذّر الحفظ (الصور كبيرة؟)');});
}
function shrink(file,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=220,k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.8));};im.src=r.result;};r.readAsDataURL(file);}
function loadImg(src){return new Promise(function(res){if(!src)return res(null);var i=new Image();i.onload=function(){res(i)};i.onerror=function(){res(null)};i.src=src;});}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function plCanvas(){
 var p=ST.pl,rows=p.rows||[],rtl=p.lang==='ar',W=1080,RH=170,top=250,H=top+rows.length*RH+130;
 var imgs=rows.map(function(r){return loadImg(r.img)});
 return (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){return Promise.all(imgs)}).then(function(ims){
  var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');
  c.fillStyle='#faf6ec';c.fillRect(0,0,W,H);c.fillStyle='#a9852f';c.fillRect(0,0,W,16);
  c.direction=rtl?'rtl':'ltr';c.textAlign='center';c.textBaseline='middle';
  c.fillStyle='#a9852f';c.font='700 46px Cairo,Tahoma,Arial,sans-serif';c.fillText('لمسة خاصة',W/2,80);
  c.fillStyle='#16264a';c.font='700 62px Cairo,Tahoma,Arial,sans-serif';c.fillText(p.title||'',W/2,170);
  c.strokeStyle='#a9852f';c.lineWidth=3;c.beginPath();c.moveTo(W/2-120,215);c.lineTo(W/2+120,215);c.stroke();
  rows.forEach(function(r,i){var y=top+i*RH,x=50,w=W-100;
   c.fillStyle='#fff';rr(c,x,y,w,RH-16,22);c.fill();c.strokeStyle='#e3dccd';c.lineWidth=2;c.stroke();
   var ix=rtl?x+w-150:x+10,im=ims[i];
   if(im){c.save();rr(c,ix,y+7,140,140,16);c.clip();var k=Math.max(140/im.width,140/im.height);c.drawImage(im,ix+(140-im.width*k)/2,y+7+(140-im.height*k)/2,im.width*k,im.height*k);c.restore();}
   c.textAlign=rtl?'right':'left';c.fillStyle='#16264a';c.font='700 42px Cairo,Tahoma,Arial,sans-serif';
   var tx=rtl?ix-24:ix+164;c.fillText(r.name||'',tx,y+(RH-16)/2,w-420);
   c.direction='ltr';c.textAlign=rtl?'left':'right';c.fillStyle='#a9852f';c.font='700 46px Cairo,Tahoma,Arial,sans-serif';
   var pr=String(r.price||'').trim();c.fillText(pr&&/^[\d.,\s]+$/.test(pr)?pr+' MRU':pr,rtl?x+30:x+w-30,y+(RH-16)/2);c.direction=rtl?'rtl':'ltr';
  });
  c.textAlign='center';c.fillStyle='#8a8576';c.font='600 30px Cairo,Tahoma,Arial,sans-serif';
  var wa=(window.APP_CONFIG&&window.APP_CONFIG.whatsapp)||'';c.direction='ltr';c.fillText(wa?'+'+wa:'',W/2,H-60);
  return cv;
 });
}
function toBlob(cv){return new Promise(function(r){cv.toBlob(r,'image/png')})}
function plPng(share){
 if(!ST.pl||!ST.pl.rows.length){toast('القائمة فارغة');return;}
 ST.pl.title=($('#pt')||{}).value||ST.pl.title;
 plCanvas().then(toBlob).then(function(b){
  var f=new File([b],'prices.png',{type:'image/png'});
  if(share&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:K.text('prices',ST.pl.lang,{name:''})}).catch(function(){});}
  else{var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='prices.png';document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(a.href)},1500);toast(share?'المشاركة غير مدعومة هنا، تم تنزيل الصورة':'تم حفظ الصورة');}
 });
}
function onClick(e){
 var t=e.target.closest('[data-x]');if(!t)return;var x=t.dataset.x,v=t.dataset.v,i=+t.dataset.i;
 if(x==='close')close();
 else if(x==='tab'){ST.tab=v;render();}
 else if(x==='key'){ST.key=v;render();}
 else if(x==='lang'){ST.lang=v;render();}
 else if(x==='ins'){var ta=$('#kt');if(ta){var s=ta.selectionStart||ta.value.length;ta.value=ta.value.slice(0,s)+v+ta.value.slice(ta.selectionEnd||s);ta.focus();ta.selectionStart=ta.selectionEnd=s+v.length;onInput({target:ta});}}
 else if(x==='save')saveMsg(($('#kt')||{}).value||'');
 else if(x==='reset'){if(confirm('استرجاع النص الأصلي؟'))saveMsg(null);}
 else if(x==='plnew'){ST.plId=Date.now().toString(36);ST.pl={title:'',lang:'ar',rows:[{img:'',name:'',price:''}]};render();}
 else if(x==='plopen')plOpen(v);
 else if(x==='addrow'){ST.pl.rows.push({img:'',name:'',price:''});render();}
 else if(x==='rm'){ST.pl.rows.splice(i,1);render();}
 else if(x==='up'&&i>0){var r=ST.pl.rows;var a=r[i];r[i]=r[i-1];r[i-1]=a;render();}
 else if(x==='pick'){ST.pi=i;var f=$('#kf');if(f){f.value='';f.click();}}
 else if(x==='plsave')plSave();
 else if(x==='plpng')plPng(false);
 else if(x==='plshare')plPng(true);
 else if(x==='pldel'){if(!confirm('حذف هذه القائمة نهائياً؟'))return;var id=ST.plId;db().collection('config').doc('pl_'+id).delete().then(function(){ST.ids=ST.ids.filter(function(z){return z.id!==id});ST.pl=null;ST.plId=null;return saveIndex();}).then(function(){render();toast('تم الحذف');});}
}
function onInput(e){
 var t=e.target;
 if(t.id==='kt'){var pv=$('#kpv');if(pv)pv.textContent=K.fill(t.value,SAMPLE);}
 else if(t.dataset&&t.dataset.f&&ST.pl){ST.pl.rows[+t.dataset.i][t.dataset.f]=t.value;}
 else if(t.id==='pt'&&ST.pl){ST.pl.title=t.value;}
}
function onChange(e){
 var t=e.target;
 if(t.id==='kf'&&t.files&&t.files[0]){shrink(t.files[0],function(d){ST.pl.rows[ST.pi].img=d;render();});}
 else if(t.id==='pl'&&ST.pl){ST.pl.lang=t.value;}
}
ready(function(){
 var nav=document.querySelector('nav.tabs')||document.querySelector('nav.atabs');if(!nav)return;
 var b=document.createElement('button');b.type='button';b.id='kx-open';b.textContent='الرسائل';b.className=nav.classList.contains('tabs')?'tab':'';
 b.addEventListener('click',function(){open();});nav.appendChild(b);
});
})();

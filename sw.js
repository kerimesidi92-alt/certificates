const V='kerima-v11';
async function addAll(c,list,conc){let i=0;async function w(){while(i<list.length){const u=list[i++];try{if(await c.match(u))continue;const r=await fetch(u);if(r&&r.ok)await c.put(u,r);}catch(_){}}}await Promise.all(Array.from({length:conc||6},w));}
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil((async()=>{try{const L=await (await fetch('offline.json',{cache:'no-cache'})).json();const c=await caches.open(V);await addAll(c,L.core,4);self._L=L;}catch(_){}})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==V)await caches.delete(k);await self.clients.claim();
 try{const L=await (await fetch('offline.json')).json();const c=await caches.open(V);await addAll(c,L.thumbs,6);await addAll(c,L.full,4);}catch(_){}})());});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||/admin\.html/.test(u.pathname))return;
 const page=r.mode==='navigate'||/\.html$/.test(u.pathname)||/\/$/.test(u.pathname);
 if(page){e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok){const k=res.clone();caches.open(V).then(c=>c.put(r,k));}return res;}).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match('index.html'))));return;}
 e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{if(hit&&/[?&]v=/.test(u.search))return hit;const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res;}).catch(()=>hit);return hit||net;})));});

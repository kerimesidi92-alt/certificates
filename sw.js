const V='kerima-v4';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||/admin\.html/.test(u.pathname))return;
 const page=r.mode==='navigate'||/\.html$/.test(u.pathname)||/\/$/.test(u.pathname);
 if(page){e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok){const k=res.clone();caches.open(V).then(c=>c.put(r,k));}return res;}).catch(()=>caches.match(r)));return;}
 e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res;}).catch(()=>hit);return hit||net;})));});

import os,json,urllib.parse
def walk(d):
    out=[]
    for r,_,fs in os.walk(d):
        for f in fs:
            if f.startswith('.'):continue
            out.append(os.path.join(r,f).replace(os.sep,'/'))
    return sorted(out)
core=['./','index.html','certificates.html','invitations.html','photos.html','calendar.html','monogram.html','manifest.webmanifest','icon.svg','bgui.js','kpick.js','cert-library.js?v=2','invitations-folders.js?v=4','landing-index.js?v=1','images.js?v=1']
thumbs=[p for p in walk('cert/lib') if '/t/' in p]+walk('cert/themes/t')+walk('cert/th')+[p for p in walk('themes') if '/t/' in p]+[p for p in walk('lib') if '/t/' in p]+walk('landing')
full=[p for p in walk('cert/lib') if '/t/' not in p]+[p for p in walk('cert/themes') if '/t/' not in p]
q=lambda l:[urllib.parse.quote(x,safe="/?=.:") for x in l]
json.dump({'core':q(core),'thumbs':q(thumbs),'full':q(full)},open('offline.json','w'))
print(len(core),len(thumbs),len(full))

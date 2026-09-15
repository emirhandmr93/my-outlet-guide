"""Extract reviewed public directory snapshots. Usage: python tools/extractOutletExpansionSources.py INPUT_DIR

HTML/PDF input files are downloaded separately from the source URLs recorded below.
Names are extracted from the store-name column, never from logos or guessed aliases.
"""
import json, pathlib, re, sys
import pdfplumber
from lxml import html
src=pathlib.Path(sys.argv[1]);out=pathlib.Path('data-sources/outlet-expansion-2026-09/raw');out.mkdir(parents=True,exist_ok=True)
def write(id,url,rows):
 (out/(id+'.json')).write_text(json.dumps({'outletId':id,'retrievedAt':'2026-09-12','sourceUrl':url,'sourceRecordCount':len(rows),'rows':rows},ensure_ascii=False,indent=2)+'\n');print(id,len(rows))
for slug in ['woodbury-common','sawgrass-mills','orlando-vineland','las-vegas-north','desert-hills','san-francisco']:
 path=src/(slug+'.pdf')
 if not path.exists():print('MISSING',slug);continue
 rows=[]
 with pdfplumber.open(path) as pdf:
  for pi,p in enumerate(pdf.pages):
   words=p.extract_words();headers=[w for w in words if w['text']=='Store' and w['x0']<80];
   if not headers:continue
   y0=headers[0]['bottom'];lines={}
   for w in words:
    if 45<=w['x0']<209 and y0<w['top']<p.height-20:lines.setdefault(round(w['top'],1),[]).append(w)
   previous=None
   for y,ws in sorted(lines.items()):
    name=' '.join(w['text'] for w in sorted(ws,key=lambda w:w['x0']))
    if previous is not None and y-previous<17:rows[-1]['name']+=' '+name
    else:rows.append({'name':name,'page':pi+1})
    previous=y
 write(slug if slug=='sawgrass-mills' else slug+'-premium-outlets',('https://www.simon.com/mall/' if slug=='sawgrass-mills' else 'https://www.premiumoutlets.com/outlet/')+slug+'/stores/print',rows)
doc=html.fromstring((src/'siam.html').read_bytes());rows=[]
for n in doc.xpath('//*[contains(@class,"detail-wrap")]'):
 t=[' '.join(x.text_content().split()) for x in n.xpath('./div')]
 if t:rows.append({'name':t[0],'category':t[1] if len(t)>1 else ''})
write('siam-premium-outlets','https://www.siampremiumoutlets.com/en/store',rows)
rows=[]
for file,kind in [('citygate-brands.html','retail'),('citygate-dining.html','restaurant')]:
 doc=html.fromstring((src/file).read_bytes())
 for a in doc.xpath('//a[contains(@class,"has-text-dark-grey")]'):
  name=' '.join(a.text_content().split());url=a.get('href','')
  if not url.startswith('/en/'+('brands' if kind=='retail' else 'dine')+'/'):continue
  rows.append({'name':name,'kind':kind,'url':'https://www.citygateoutlets.com.hk'+url})
write('citygate-outlets','https://www.citygateoutlets.com.hk/en/brands/',rows)
unique={}
for type in range(1,12):
 s=re.sub(r'(?m)^\d+\t','',(src/f'linkou-{type}.txt').read_text()).split('## 品牌字首')[0]
 ms=list(re.finditer(r'(?m)^\s*\* ### (.+)$',s))
 for i,m in enumerate(ms):
  block=s[m.end():ms[i+1].start() if i+1<len(ms) else len(s)];name=m[1].strip();store=re.search(r'店號\s+(\d+)',block);loc=re.search(r'館別 / 樓層 / 區域 (.+)',block)
  r={'name':name,'storeId':store[1] if store else None,'location':loc[1] if loc else None,'sourceCategory':type};unique.setdefault((name,r['storeId'] or r['location']),r)
 print('Linkou category',type,len(ms))
write('mitsui-outlet-park-linkou','https://www.mitsui-shopping-park.com.tw/mop/linkou/en/shopguide.html',list(unique.values()))

"""Build directory TS and auditable source-to-identity manifests from reviewed source snapshots.
Run after node --import tsx tools/exportDirectoryBaseline.ts has exported the global registry.
"""
import json,re,pathlib,unicodedata,hashlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
SRC=ROOT/'data-sources/outlet-expansion-2026-09';BASE=ROOT.parent/'research'
def norm(s):return ''.join(c for c in unicodedata.normalize('NFKD',s.lower().replace('&','and')) if c.isalnum())
def slug(s):return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower().replace('&',' and ')).strip('-')
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def ts(p,symbol,x,importline=''):p.write_text(importline+f'export const {symbol} = '+json.dumps(x,ensure_ascii=False,indent=2)+';\n')
brands=json.loads((BASE/'baseline-brands.json').read_text());byid={b['brandId']:b for b in brands};lookup={}
for b in brands:
 for s in [b['brandId'],b['brandName']]+b.get('aliases',[]):lookup.setdefault(norm(s),set()).add(b['brandId'])
MAP={
'Adidas Outlet Store':'adidas','Nike Factory Store':'nike','Nike Factory Outlet':'nike','NIKE UNITE SPO':'nike','Armani Outlet':'armani-outlet','Armani Exchange Outlet':'armani-exchange','BOSS Outlet':'boss','HUGO BOSS':'boss','CH Carolina Herrera':'carolina-herrera','Kate Spade New York Outlet':'kate-spade-new-york','Kate Spade Outlet':'kate-spade-new-york','Kate Spade':'kate-spade-new-york','Karl Lagerfeld Paris':'karl-lagerfeld','Levi’s Outlet Store':'levis','Levi’s® Outlet Store':'levis','Polo Ralph Lauren Factory Store':'polo-ralph-lauren','Polo Ralph Lauren Children':'polo-ralph-lauren','Polo Ralph Lauren kids':'polo-ralph-lauren','Polo Ralph Lauren Childrenswear Factory Store':'polo-ralph-lauren','Tommy Hilfiger Kids':'tommy-hilfiger',"CARTER'S / OSHKOSH B'GOSH":['carters','oshkosh-bgosh'],"The Children’s Place Outlet/Gymboree":['the-childrens-place','gymboree'],
'Under Armour Factory House':'under-armour','Under Armour Footwear':'under-armour','UGG Footwear':'ugg','GNC General Nutrition Center':'gnc','Aerie by American Eagle Outfitters':'aerie','Kays Jewelers Outlet':'kay-jewelers','Kay Jewelers Outlet':'kay-jewelers','Zales Outlet, The Diamond Store':'zales','Clarks Bostonian Outlet':'clarks','Lids Locker Room':'lids','Locker Room by Lids':'lids','Skechers USA':'skechers','Skechers':'skechers','APEX by Sunglass Hut':'sunglass-hut','Bath & Body Works | White Barn':'bath-and-body-works','Puma Kids':'puma','Nautica | Kids':'nautica','Zwilling J.A. Henckels':'zwilling','rag & bone New York':'rag-and-bone','Dior Men':'dior','Samsonite Travel Expo':'samsonite','Michael Kors Mens':'michael-kors','Michael Kors Apparel':'michael-kors',"Coach Men's":'coach',"Coach Men's Factory":'coach',"Calvin Klein Men's":'calvin-klein',"Calvin Klein Men's and Women's":'calvin-klein',"Theory Outlet Men's":'theory',"Brunello Cucinelli Men's":'brunello-cucinelli','Sunglass Hut West':'sunglass-hut','Abercrombie Kids':'abercrombie-and-fitch','Abercrombie Kids Outlet':'abercrombie-and-fitch','Florsheim Shoes':'florsheim','Ann Taylor Factory Store':'ann-taylor','Express Factory Outlet':'express',"Bloomingdale's - The Outlet Store":'bloomingdales','Bulova Company Store':'bulova','Kevin Jewelers Outlet':'kevin-jewelers','LUXURY BEAUTY STORE':'luxury-beauty-store','SFERRA':'sferra','AG Jeans':'ag-jeans','T.J. Maxx':'tj-maxx','Dolce & Gabbana':'dolce-and-gabbana','Hobbs':'hobbs',"Victoria's Secret":'victorias-secret','Zadig&Voltaire':'zadig-and-voltaire','ZEGNA':'zegna','Calzedonia':'calzedonia','Intimissimi':'intimissimi','Kiko Milano Cosmetics':'kiko-milano','LEGO® Store':'lego','Disney Store Outlet':'disney-store',"Disney's Character Warehouse":'disney-store','Gap Outlet - Kids & Baby':'gap','J.Crew Factory Crewcuts':'j-crew','Columbia Footwear':'columbia','Chico’s Off The Rack':'chicos','H & M':'h-and-m',
'Arc’teryx':'arcteryx',"Arc'teryx Factory Outlet":'arcteryx','Alice + Olivia by Stacey Bendet':'alice-olivia','Calvin Klein Underwear':'calvin-klein-underwear','Calvin Klein Jeans':'calvin-klein-jeans','Club Monaco Studio':'club-monaco','Columbia Sportswear Company':'columbia','City Chain GLAM Timepieces':'city-chain','City Chain Outlet':'city-chain','FILA FUSION':'fila','FILA Shoe Space':'fila','Optical 88 Factory':'optical-88','Dior Beauty':'dior','National Geographic Apparel':'national-geographic-apparel','National Geographic':'national-geographic-apparel','MaxMara':'max-mara','MaxMara OUTLET':'max-mara','M&S Food':'marks-and-spencer','Georg Jensen . Royal Copenhagen . Wedgwood':['georg-jensen','royal-copenhagen','wedgwood'],'Hong Kong Disneyland Treasures':'disney-store','DAKS LONDON':'daks','B’ME BY WACOAL':'b-me-by-wacoal','DVF - DIANE VON FURSTENBERG':'diane-von-furstenberg','O&B OUTLET STORE, GEOX':['o-and-b','geox'],'OUTLET BY CLUB 21':'outlet-by-club-21','POMELO OUTLET':'pomelo-outlet',
'23区':'23ku','SNIDEL/Gelato Pique/ Lily Brown/Uraha':['snidel','gelato-pique','lily-brown','uraha'],'TY SELECT/ Giuseppe Zanotti/ Stella McCartney/ Mon Birdie/ Yuen':['ty-select','giuseppe-zanotti','stella-mccartney','mon-birdie','yuen'],'Regal/Orobianco':['regal','orobianco'],'GIANNI CHIARINI/Barbour':['gianni-chiarini','barbour'],'Bandai/Lego':['bandai','lego'],'Vans/Hawkins':['vans','hawkins'],'Royal Copenhagen & Wedgwood':['royal-copenhagen','wedgwood'],'DAISO / Standard Products / THREEPPY':['daiso','standard-products','threeppy'],'United Arrows Ltd. Outlet':'united-arrows','Earth Music&Ecology Super Premium Store':'earth-music-and-ecology',"Y’s YOHJI YAMAMOTO":'yohji-yamamoto',"LEVI'S Denim Iconic store":'levis','G-Shock Outlet':'g-shock','Mammut 長毛象':'mammut','小米之家授權店':'xiaomi','德誼數位 Apple':'data-express','三星智慧館(Samsung)':'samsung','Adidas Kids':'adidas','SKECHERS Kids':'skechers','Tomod’s 三友藥妝':'tomods','Tomod’s':'tomods','NITORI 宜得利':'nitori','玩具反斗城':'toys-r-us','LocknLock樂扣樂扣':'lock-and-lock','阿原YUAN':'yuan','FUJI按摩椅':'fuji-massage-chair','Tonia Nicole 東妮寢飾':'tonia-nicole','impact 怡寶書包':'impact','金安德森皮件-Ⅰ館 2F 室內區 Gozo前':'kinloch-anderson','金安德森皮件-Ⅰ館 2F 室內區 迷你廣場':'kinloch-anderson','i.t Outlet':'i-t','I.T':'i-t'}
MAP.update({'Sunglass Hut I':'sunglass-hut','Sunglass Hut II':'sunglass-hut','T-Mobile II':'t-mobile','Super Target':'target',"Carter's Childrens Wear":'carters','Columbia Clearance Store':'columbia','G by Guess':'guess','Gucci Kids':'gucci','Philipp Plein Kids':'philipp-plein','Racing Miami Las Vegas':'racing-miami','三星智慧館':'samsung','點睛品':'chow-sang-sang','カルデイ COFFEE FARM':'kaldi-coffee-farm','誠品書店/誠品生活':'eslite','誠品生活 expo':'eslite-expo','Brand楓月':'brand-fugetsu','PRO TECH - GARMIN':'garmin'})
MAP={norm(k):v for k,v in MAP.items()}
FOOD="""Auntie Anne's Pretzels|Avocado's Food|Bareburger|Black Dirt Bourbon Barn|Bollicine & Co. Champagne Bar|Chipotle|Cinnabon|Everything Kosher|Gong Cha|Haagen-Dazs|HARIBO|Jersey Mike's Subs|Just Kosher|Just Salad|KINTON RAMEN|Kung Pao Wok|Laderach Chocolatier Suisse|Ladurée|Lady M Cake Boutique|Lindt Chocolate|Market Hall|McDonald's|Melt Shop|Pagoda Asian Grill by P.F Chang's|Parm|Pinkberry|Playa Bowls|Ralph's Coffee|Shake Shack|South Philly Cheesesteaks & Fries|Starbucks Coffee|The Coach Coffee Shop|Tony + Benny's|Umi Teriyaki|Wetzel's Pretzels|Apropo Crepes|Arepasmania|Argentinian Empanadas on the Grill & Grill Stop|Asian Chao|Baba's Halal|Burger King|Charleys Philly Steaks|Chipotle Mexican Grill|Churromania|Crepe Delicious|Currito Burrito|CVI.CHE 105|Don Jediondo|Dunkin Baskin Robbins|Firehouse Subs|Five Guys|Food Court|Grand Lux Cafe|Green Leaf's & Bananas|Japan Cafe|Juan Valdez Colombian Coffee|Kelly's Cajun Grill|Komma Tea|La Doña Mexican Seafood & Grill|Lucciano’s Il Maestro del Gelato|MiaFruta|Nathan's Famous|Osmow's Shawarma|P.F. Chang's|Popeyes Louisiana Kitchen|Pure Green|Rainforest Cafe|Sbarro|Sbarro The Italian Eatery|Seasons 52|SushiGami|Texas de Brazil|The Baked Bear|The Cheesecake Factory|The Taco Stand|Tobu|Tommy Bahama Marlin Bar|Villagio|Yard House|Yummy Jungle Candy Shop|Burnin' Mouth|Caribbean Moonshine|FORD'S GARAGE|Green Beat|IT'SUGAR|Pier 17|Poki One N Half|Sarku Japan|Sundial Café|Villa Fresh Italian Kitchen|Fruitbite|Oba Boba|Pa Q Pikes Colombian Food|Ramyun Cafe|Snack Daddy|Starbucks Coffee - Kiosk|Subway|&Pasta|Birba|BKK78 STREET FOOD|BKK78 West Village|Boba Station|Crazy Cup Taquitos|East Village Food Pavilion|Hokulia|Kahala Coffee Traders|Meat Me|The Wok 360|Wetzel's Pretzels West Village|Auntie Anne's and Cinnabon Cafe|Charley's Grilled Subs|dumplinghaus|Johnny Rockets|La Michoacana Frozen Delights|Popeye's Chicken|Suki Hana|Tea Heart|Tea Heart Kiosk|UME|Waikiki|Wok A Holic""".split('|')
EXCLUDED="""Cornell Cooperative Extension Sullivan County|Currency Exchange International|Management Office|Play Area|Simon Guest Services|The Hudson Valley | Catskills Welcome Center|The Magic Train|AC Hotel Fort Lauderdale Sawgrass Mills/Sunrise|Cellaxs Phone Repair|chargeFUZE|Mall Management Office|Mall Security|Regal Cinemas & IMAX|The Escape Game|United States Post Office|Valet Parking|Valet Parking - The Oasis|Mercedes-Benz EV Charging|101 Fun Plus|Scoozer|Cellular Explosion|FIFA World Cup 2026 Official Store|iFun|Phix It|Prizemate|Market Hall|Food Court|East Village Food Pavilion""".split('|')
FOOD={norm(s) for s in FOOD};EXCLUDED={norm(s) for s in EXCLUDED};EXCLUDED.add(norm('The Hudson Valley | Catskills Welcome Center'))
NEW={};allrels=[];allrest=[]
def resolve(name):
 n=norm(name)
 if name.startswith('Hour Passion:'):return ['hour-passion']
 if n in MAP:
  v=MAP[n];return v if isinstance(v,list) else [v]
 variants=[name,re.sub(r'(?i)\s+(factory (store|outlet)|outlet store|outlet|factory|company store|vault)$','',name)]
 for v in variants:
  hits=lookup.get(norm(v),set());direct=[b['brandId'] for b in brands if norm(b['brandName'])==norm(v)]
  if len(direct)==1:return direct
  if len(hits)==1:return list(hits)
 clean=variants[-1];return [slug(clean) or 'brand-'+hashlib.sha256(norm(clean).encode()).hexdigest()[:12]]
def category(name,source):
 if 'sourceCategory' in source:return {1:'fashion',2:'sportswear',3:'shoes-bags',4:'home-lifestyle',5:'kids',6:'fashion',7:'jewelry-watches',9:'kids',10:'home-lifestyle',11:'home-lifestyle'}.get(source['sourceCategory'],'home-lifestyle')
 name+=' '+source.get('category','')
 if re.search('(?i)jewel|diamond|banter|bulova|watch',name):return 'jewelry-watches'
 if re.search('(?i)perfume|fragan|fragrance|beauty|moida|lel[i]?or|sephora|cosmetic|skincare',name):return 'beauty'
 if re.search('(?i)shoe|sneaker|luggage|rebag|rothy|lucchese|timbuk|primicia|footwork|bag|footwear',name):return 'shoes-bags'
 if re.search('(?i)kids|baby|toys|gymboree|oshkosh|nini',name):return 'kids'
 if re.search('(?i)sport|champs|runner|finish line|huk|ariat|greg norman|travis',name):return 'sportswear'
 if re.search('(?i)book|boxlunch|mart|home|bin|target|game|gift|cigar|vitamin|technolog|mobile|garmin|sferra|forever drip|cbd|gadget|bed|mattress|convenience',name):return 'home-lifestyle'
 return 'fashion'
for f in sorted((SRC/'raw').glob('*.json')):
 doc=json.loads(f.read_text());oid=doc['outletId'];is_siam=oid=='siam-premium-outlets';is_hk=oid=='citygate-outlets';is_tw=oid=='mitsui-outlet-park-linkou';rels={};dining={};mapped=[]
 for raw in doc['rows']:
  source=raw['name'];name=re.sub(r'\s*\((Soon|Open 12 Sep\x2726|temporarily closed)\)| (Coming Soon!|Now Open!)','',source).strip();base=re.sub(r'\s*\([^)]*\)','',name).strip().rstrip('.')
  status='coming-soon' if 'Coming Soon!' in source or '(Soon)' in source else 'inactive' if 'temporarily closed' in source else 'active'
  # Sep 12 opening is now current; preserve the official announced date in the manifest.
  kind='restaurant' if norm(base) in FOOD else 'excluded' if norm(base) in EXCLUDED else 'retail'
  if norm(base) in EXCLUDED:kind='excluded'
  if is_siam:
   kind='restaurant' if re.search('(?i)beverage|restaurant|bakery|food center|crepe|fried chicken',raw.get('category','')) else 'excluded' if source=='PRO EXCHANGE' else 'retail'
  if is_hk:
   kind=raw['kind']
   if name=='Novotel Lobby - Olea':kind='restaurant';name='Olea'
   if name in ['DUTY ZERO by cdf',"Watson’s Wine"]:kind='retail'
   if name in ['Bank of China (Hong Kong) - Citygate Banking Services Centre','HSBC','Jumpin Gym']:kind='excluded'
  if is_tw:
   kind='restaurant' if raw['sourceCategory']==8 else 'retail'
   if name in ['VIESHOW CINEMAS','Little Planet','POP Circus 星奇市',"Tom's world 湯姆熊歡樂世界",'BCG汽車維護中心','衫隆修改室','QB House','S Bar by SOCIE']:kind='excluded'
  row={**raw,'sourceName':source,'name':name,'kind':kind,'status':status}
  if kind=='retail':
   ids=resolve(base);row['brandIds']=ids
   for bid in ids:
    if bid not in byid and bid not in NEW:
     c=category(base,raw);display=re.sub(r'(?i)\s+(factory (store|outlet)|outlet store|outlet|company store)$','',base) if len(ids)==1 else bid.replace('-',' ').title()
     NEW[bid]={'brandId':bid,'brandName':display,'aliases':[],'categoryId':c,'logo':'','luxuryLevel':'sports' if c=='sportswear' else 'lifestyle' if c=='home-lifestyle' else 'fashion','rankingWeight':50,'brandStatus':'active'}
    if bid not in rels or status=='active':rels[bid]={'outletId':oid,'brandId':bid,'featured':False,'relationStatus':status}
  elif kind=='restaurant':
   rid=oid+'-'+(raw.get('storeId') or slug(name) or hashlib.sha256(name.encode()).hexdigest()[:12])
   if not is_hk:
    original=rid;i=2
    while rid in dining:rid=original+'-'+str(i);i+=1
   row['restaurantId']=rid;dining[rid]={'restaurantId':rid,'outletId':oid,'restaurantName':name,'category':'Cafe' if re.search('(?i)cafe|café|coffee|starbucks',name) else 'Food & Beverages','priceLevel':'','website':raw.get('url') or doc['sourceUrl'],'status':status,'displayOrder':str(len(dining)+1)}
  else:row['reason']='Service, entertainment or common area; not a retail brand or dining tenant.'
  mapped.append(row)
 old=[r for r in json.loads((BASE/'baseline-outletBrands.json').read_text()) if r['outletId']==oid]
 if is_siam:
  import subprocess
  text=subprocess.check_output(['git','show','origin/main:src/constants/outletBrands/thailand.ts'],cwd=ROOT,text=True)
  old=[{'outletId':oid,'brandId':b,'featured':False} for b in re.findall(r'brandId: "([^"]+)"',text)]
 for r in old:
  if r['brandId'] not in rels:rels[r['brandId']]={**r,'relationStatus':'inactive'}
 doc['rows']=mapped;dump(SRC/(oid+'.json'),doc)
 allrels.extend(rels.values());allrest.extend(dining.values());print(oid,'retail',sum(r['relationStatus']=='active' for r in rels.values()),'dining',len(dining))
ts(ROOT/'src/constants/brands/brands-expansion.ts','expansionBrands',list(NEW.values()),'import type { Brand } from "../../types/brand";\n\n')
p=ROOT/'src/constants/brands/brands-expansion.ts';p.write_text(p.read_text().replace('const expansionBrands =','const expansionBrands: Brand[] ='))
for oid,country,var in [('siam-premium-outlets','thailand','thailand'),('citygate-outlets','hong-kong','hongKong'),('mitsui-outlet-park-linkou','taiwan','taiwan')]:
 ts(ROOT/f'src/constants/outletBrands/{country}.ts',var+'OutletBrands',[r for r in allrels if r['outletId']==oid]);ts(ROOT/f'src/constants/restaurants/{country}.ts',var+'Restaurants',[r for r in allrest if r['outletId']==oid])
asia={'siam-premium-outlets','citygate-outlets','mitsui-outlet-park-linkou'}
ts(ROOT/'src/constants/outletBrands/united-states.ts','unitedStatesOutletBrands',[r for r in allrels if r['outletId'] not in asia]);ts(ROOT/'src/constants/restaurants/united-states.ts','unitedStatesRestaurants',[r for r in allrest if r['outletId'] not in asia])
for folder,symbol,file,marker in [('brands','expansionBrands','brands-expansion','const allBrands: Brand[] = ['),('outletBrands','unitedStatesOutletBrands','united-states','export const outletBrands: OutletBrand[] = ['),('restaurants','unitedStatesRestaurants','united-states','export const restaurants = ['),('restaurants','thailandRestaurants','thailand','export const restaurants = [')]:
 p=ROOT/f'src/constants/{folder}/index.ts';s=p.read_text()
 if f'import {{ {symbol} }}' not in s:s=f'import {{ {symbol} }} from "./{file}";\n'+s;s=s.replace(marker,marker+'\n  ...'+symbol+',');p.write_text(s)
p=ROOT/'src/constants/outletBrands/index.ts';s=p.read_text().replace(' // Thailand relations remain available as source inventory, but are excluded\n // until a matching source-backed outlet entity is part of the runtime catalog.','  ...thailandOutletBrands,');p.write_text(s)
print('New brands',len(NEW))

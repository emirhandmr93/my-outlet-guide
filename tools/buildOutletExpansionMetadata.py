"""Apply the reviewed September 2026 outlet metadata. Distances are geodesic, not road estimates."""
import json,pathlib,math
ROOT=pathlib.Path(__file__).resolve().parent.parent
SRC=ROOT/'data-sources/outlet-expansion-2026-09'
BASE=SRC/'baseline'
def write(p,sym,rows):p.write_text('import type { Outlet } from "../../types/outlet";\n\nexport const '+sym+': Outlet[] = '+json.dumps(rows,ensure_ascii=False,indent=2)+';\n')
def distance(a,b):
 p,q=map(math.radians,[a[0],b[0]]);d=math.radians(b[0]-a[0]);e=math.radians(b[1]-a[1]);return round(6371*2*math.asin(math.sqrt(math.sin(d/2)**2+math.cos(p)*math.cos(q)*math.sin(e/2)**2)))
airports={
'SWF':('New York Stewart',41.5041,-74.1048),'JFK':('John F. Kennedy',40.6413,-73.7781),'EWR':('Newark Liberty',40.6895,-74.1745),
'FLL':('Fort Lauderdale–Hollywood',26.0742,-80.1506),'MIA':('Miami',25.7959,-80.2870),'MCO':('Orlando',28.4312,-81.3081),'LAS':('Harry Reid',36.0840,-115.1537),
'PSP':('Palm Springs',33.8297,-116.5067),'ONT':('Ontario',34.0560,-117.6012),'LAX':('Los Angeles',33.9416,-118.4085),
'OAK':('Oakland',37.7126,-122.2197),'SFO':('San Francisco',37.6213,-122.3790),'SJC':('San José Mineta',37.3639,-121.9289),
'BKK':('Suvarnabhumi',13.6900,100.7501),'DMK':('Don Mueang',13.9126,100.6068),'HKG':('Hong Kong',22.3080,113.9185),'TPE':('Taiwan Taoyuan',25.0797,121.2342),
'ICN':('Incheon',37.4602,126.4407),'GMP':('Gimpo',37.5583,126.7906),'PUS':('Gimhae',35.1795,128.9382),'KUL':('Kuala Lumpur',2.7456,101.7072)}
# Coordinate anchors use the centre of the named destination. Display explicitly says straight-line.
rows=[
('woodbury-common-premium-outlets','Woodbury Common Premium Outlets','new-york','New York',41.3170679,-74.1267205,'498 Red Apple Court, Central Valley, NY 10917, United States','10:00–21:00',None,40.7580,-73.9855,['SWF','JFK','EWR'],'woodbury-common','Central Valley'),
('sawgrass-mills','Sawgrass Mills','fort-lauderdale','Fort Lauderdale',26.151697,-80.320900,'12801 W Sunrise Boulevard, Sunrise, FL 33323, United States','10:00–21:00','11:00–20:00',26.1224,-80.1373,['FLL','MIA'],'sawgrass-mills','Sunrise'),
('orlando-vineland-premium-outlets','Orlando Vineland Premium Outlets','orlando','Orlando',28.386771,-81.4926951,'8200 Vineland Avenue, Orlando, FL 32821, United States','10:00–21:00','11:00–19:00',28.5383,-81.3792,['MCO'],'orlando-vineland','Lake Buena Vista'),
('las-vegas-north-premium-outlets','Las Vegas North Premium Outlets','las-vegas','Las Vegas',36.1636903,-115.1583205,'875 S Grand Central Parkway, Las Vegas, NV 89106, United States','10:00–20:00','10:00–19:00',36.1699,-115.1398,['LAS'],'las-vegas-north','Downtown Las Vegas'),
('desert-hills-premium-outlets','Desert Hills Premium Outlets','palm-springs','Palm Springs',33.928778,-116.815491,'48400 Seminole Drive, Cabazon, CA 92230, United States','10:00–21:00','10:00–20:00',33.8303,-116.5453,['PSP','ONT','LAX'],'desert-hills','Cabazon'),
('san-francisco-premium-outlets','San Francisco Premium Outlets','san-francisco','San Francisco',37.6989923,-121.8441731,'2774 Livermore Outlets Drive, Livermore, CA 94551, United States','10:00–20:00','10:00–19:00',37.7749,-122.4194,['OAK','SFO','SJC'],'san-francisco','Livermore'),
('siam-premium-outlets','Siam Premium Outlets Bangkok','bangkok','Bangkok',13.6946139,100.8312053,'989 Moo 14, Bang Sao Thong, Samut Prakan 10570, Thailand','10:00–22:00',None,13.7463,100.5347,['BKK','DMK'],'siam','Bang Sao Thong')]
new=[];details={};evidence={}
for oid,name,city,cityname,lat,lon,address,hours,sun,clat,clon,codes,slug,alias in rows:
 country='thailand' if slug=='siam' else 'united-states'
 base='https://www.siampremiumoutlets.com/en' if slug=='siam' else ('https://www.simon.com/mall/' if slug=='sawgrass-mills' else 'https://www.premiumoutlets.com/outlet/')+slug
 manifest=json.loads((SRC/f'{oid}.json').read_text());count=len({b for r in manifest['rows'] if r.get('status')=='active' for b in r.get('brandIds',[])})
 o=dict(outletId=oid,name=name,slug=oid,aliases=[alias]+(['siam-premium-outlet'] if slug=='siam' else []),countryId=country,cityId=city,address=address,latitude=lat,longitude=lon,openingHours=(f'Mon–Sat {hours}; Sun {sun}.' if sun else f'Daily {hours}.')+' Holiday and individual store hours may vary.',heroImage='',galleryImages=[],storesCountText=f'{count} listed brands',rating=0,reviewCount=0,services=['Customer Service','Dining','Parking'],taxFreeAvailable=slug=='siam',websiteUrl=base,centerMapUrl=base+('/map' if slug=='siam' else '/map'),googleMapsUrl='https://www.google.com/maps/search/?api=1&query='+str(lat)+'%2C'+str(lon),appleMapsUrl=f'https://maps.apple.com/?ll={lat},{lon}',yandexMapsUrl=f'https://yandex.com/maps/?ll={lon}%2C{lat}',status='active')
 if slug=='siam':o['services']+=['Free Wi-Fi','Prayer Room','Nursing Room'];o['taxFreeOfficeInfo']='VAT refunds are available at participating shops; eligibility and customs validation apply.'
 o.update(cityCenterDistanceKm=distance((lat,lon),(clat,clon)),cityCenterInfo={'name':cityname,'distanceKm':distance((lat,lon),(clat,clon))},airports=[{'code':c,'name':airports[c][0],'distanceKm':distance((lat,lon),airports[c][1:])} for c in codes],distanceBasis='straight-line',metadataVerifiedAt='2026-09-12')
 o['airportDistanceKm']=o['airports'][0]['distanceKm'];new.append(o)
 details[oid]={'hours':hours,'sundayHours':sun,'city':cityname,'services':o['services'],'count':count}
 evidence[oid]={'checkedAt':'2026-09-12','sources':[manifest['sourceUrl'],base+('/contact' if slug=='siam' else '/about')],'coordinates':{'latitude':lat,'longitude':lon,'source':'https://www.openstreetmap.org/?mlat='+str(lat)+'&mlon='+str(lon)},'distanceBasis':'Haversine great-circle distance, rounded to nearest kilometre; not driving distance.','cityAnchor':{'name':cityname,'latitude':clat,'longitude':clon},'airportAnchors':{c:airports[c] for c in codes}}
write(ROOT/'src/constants/outlets/united-states.ts','unitedStatesOutlets',[o for o in new if o['countryId']=='united-states'])
write(ROOT/'src/constants/outlets/thailand.ts','thailandOutlets',[o for o in new if o['countryId']=='thailand'])
old=json.loads((BASE/'baseline-outlets.json').read_text())
patches={
'citygate-outlets':(22.29026,113.94134,'Hong Kong',22.2849,114.1589,['HKG']),
'mitsui-outlet-park-linkou':(25.07064,121.36511,'Taipei',25.0478,121.5170,['TPE']),
'yeoju-premium-outlets':(37.24136,127.61273,'Yeoju',37.2983,127.6375,['ICN','GMP']),
'paju-premium-outlets':(37.7691889,126.6944399,'Paju',37.7599,126.7799,['GMP','ICN']),
'busan-premium-outlets':(35.3235415,129.2355574,'Busan (Seomyeon)',35.1577,129.0594,['PUS']),
'genting-highlands-premium-outlets':(3.4031789,101.7830097,'Kuala Lumpur',3.1340,101.6869,['KUL'])}
for o in old:
 if o['outletId'] not in patches:continue
 lat,lon,cn,clat,clon,codes=patches[o['outletId']]
 o.update(latitude=lat,longitude=lon,cityCenterDistanceKm=distance((lat,lon),(clat,clon)),cityCenterInfo={'name':cn,'distanceKm':distance((lat,lon),(clat,clon))},airports=[{'code':c,'name':airports[c][0],'distanceKm':distance((lat,lon),airports[c][1:])} for c in codes],distanceBasis='straight-line',metadataVerifiedAt='2026-09-12')
 o['airportDistanceKm']=o['airports'][0]['distanceKm']
 f=SRC/f"{o['outletId']}.json"
 if f.exists():
  m=json.loads(f.read_text());o['restaurants']=[r['name'] for r in m['rows'] if r.get('restaurantId') and r.get('status')=='active'];o['storesCountText']=str(len({b for r in m['rows'] if r.get('status')=='active' for b in r.get('brandIds',[])}))+' listed brands'
 evidence[o['outletId']]={'checkedAt':'2026-09-12','sources':[o['websiteUrl']],'coordinates':{'latitude':lat,'longitude':lon,'source':'https://www.openstreetmap.org/?mlat='+str(lat)+'&mlon='+str(lon)},'distanceBasis':'Haversine great-circle distance, rounded to nearest kilometre; not driving distance.','cityAnchor':{'name':cn,'latitude':clat,'longitude':clon},'airportAnchors':{c:airports[c] for c in codes}}
for country,sym in [('hong-kong','hongKong'),('taiwan','taiwan'),('south-korea','southKorea'),('malaysia','malaysia')]:write(ROOT/f'src/constants/outlets/{country}.ts',sym+'Outlets',[o for o in old if o['countryId']==country])
(ROOT/'src/constants/expansionOutletMetadata.ts').write_text('export const expansionOutletMetadata = '+json.dumps(details,ensure_ascii=False,indent=2)+' as const;\n')
(SRC/'metadata-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
p=ROOT/'src/constants/outlets/index.ts';s=p.read_text();s='import { unitedStatesOutlets } from "./united-states";\nimport { thailandOutlets } from "./thailand";\n'+s if 'import { unitedStatesOutlets }' not in s else s;s=s.replace('export const outlets: Outlet[] = [','export const outlets: Outlet[] = [\n  ...unitedStatesOutlets,\n  ...thailandOutlets,') if '  ...unitedStatesOutlets,' not in s else s;p.write_text(s)
p=ROOT/'src/constants/cities.ts';s=p.read_text();extra=''.join(' '+json.dumps({'cityId':r[2],'cityName':r[3],'countryId':'thailand' if r[0]=='siam-premium-outlets' else 'united-states'})+',\n' for r in rows if '"cityId": "'+r[2]+'"' not in s);s=s.replace('export const cities = [','export const cities = [\n'+extra);p.write_text(s)
p=ROOT/'src/types/outlet.ts';s=p.read_text();s=s.replace('  cityCenterDistanceKm?: number;','  cityCenterDistanceKm?: number;\n  cityCenterInfo?: { name: string; distanceKm: number };\n  airports?: { code: string; name: string; distanceKm: number }[];\n  distanceBasis?: "straight-line" | "road";\n  metadataVerifiedAt?: string;') if 'distanceBasis?' not in s else s;p.write_text(s)
for path in ['src/media/outletMedia.ts','src/media/outletMediaMetadata.ts']:
 p=ROOT/path;s=p.read_text().replace('"siam-premium-outlet":','"siam-premium-outlets":').replace('"outletId": "siam-premium-outlet"','"outletId": "siam-premium-outlets"');p.write_text(s)
print('Metadata:',len(new),'new outlets;',len(patches),'existing outlets completed')

/** Verified official directory snapshot, captured 2026-08-12. */
export const shanghaiVillageDirectory = `
% Arabica
adidas Originals
adidas 阿迪达斯
Aigle
AIMER 爱慕
Alexander McQueen
AllSaints
American Vintage
AMI
ANINE BING
APM MONACO
Arc'Teryx 始祖鸟
Armani 阿玛尼
Asics 亚瑟士
ba&sh
BALENCIAGA 巴黎世家
Bally 巴利
Balmain 巴尔曼
Barbour
BEEF & LIBERTY 尚牛社会
Bogner 博格纳
Bonpoint
Bosideng
BOSS 雨果 博斯
Breitling 百年灵
Brooks Brothers 布克兄弟
Brunello Cucinelli
Burberry
BURTON
Café del Volcán
Calvin Klein
Canada Goose
CANALI
Carhartt WIP
CELINE
CHAGEE霸王茶姬
Champion 冠军
CHJ JEWELLERY
Chloé
CHLOECHEN
Christofle
Clarks 其乐
Coach 蔻驰
converse
Crocs
Croquis 速写
Curiel 蔻蕊
DĀN NÓNG 单农
DAZZLE
DESCENTE戈什门店
DESCENTE美尔大道店
DIESEL
DOCUMENTS
DOLCE&GABBANA
Dr.Martens
dunhill 登喜路
dyson
ECCO 爱步
Edition
ELAND 衣恋
ERDOS 鄂尔多斯
Ermanno Scervino
EXCEPTION
FERRAGAMO 菲拉格慕
Fila
FILA Kids 斐乐
G/FORE
GENTSPACE
GIADA
GIVENCHY 纪梵希
Glasstique 眼镜店
GOLDEN GOOSE
Goldwin
Haglöfs
HaixingMarket
HAZZYS
HECHTER
HEFANG
Helly Hansen
Hilditch & Key
HOGAN / TOD'S
HOKA ONE ONE
Huokao 伙靠
IRO
Isabel Marant
J.LINDEBERG 金林德伯格
JEWELRIA 周大福荟馆
JIL SANDER
Jimmy Choo 周仰杰
jnby by JNBY
JNBY 江南布衣
Joseph
KAILAS
kate spade
KENZO
Kiton
KOLON SPORTS
KOYA RAMEN 琥家拉面
L'OCCITANE 普罗旺斯欧舒丹
L’Oréal
LA MATCHA 抹茶吧
LACOSTE
LANECRAWFORD
Laurèl
Lee
LensCrafters 亮视点
LESS
LET'S VINTAGE
Levi's 李维斯
LOEWE 罗意威
Longchamp 珑骧
LOONG MIEN KOON 龙味馆
Loro Piana 诺悠翩雅
Lottusse 乐途仕
lululemon 露露乐蒙
MAIA ACTIVE
Maison Kitsuné
Maison Margiela
Maje
MAMMUT
Marisfrolg 玛丝菲尔
MARNI
MaxMara
MLB
MO&Co.
MOMÉNTI
MONOLOGUE
MONTBLANC 万宝龙
moodytiger
Moose Knuckles
MOSCHINO 莫斯奇诺
MOUSSY
Mugen Optical 目艮眼镜
NAUTICA
NEIWAI 内外
New Balance
new balance kids
New Era
Nice Rice
NIKE 耐克
Onitsuka Tiger 鬼塚虎
On昂跑
Other Tea
PAPITO
Patagonia
Paw in Paw 宝英宝
Polo Ralph Lauren拉夫劳伦
PORTS
Puma 彪马
Ray-Ban 雷朋
Really Thai
Rituals
Rockfish Weatherwear
S-BEAUTY METHOD 资生堂集团美妆集合店
Salomon 萨洛蒙
Samsonite 新秀丽
SANDRO
Saucony
self-portrait
Shanghai Tang 上海滩
SHI HAO DIAN 食好點
Skechers 斯凯奇
STACCATO 思加图
STARBUCKS 星巴克
Stuart Weitzman 思缇韦曼
Subdued
Sue Hsiao Liu 苏小柳
SWAROVSKI 施华洛世奇
T9tea
Tabio
THE COSMETICS COMPANY STORE 雅诗兰黛集团集合店
The North Face
Theory 思睿
Thom Browne
Timberland 添柏岚
Tom Ford
Tommy Hilfiger
Tory Burch 汤丽柏琦
TUMI 途明
UGG
UNDEFEATED
Under Armour
Urban Exploration
Valentino 华伦天奴
VENCHI闻绮
Versace 范思哲
Vivienne Westwood
Vuori
Wacoal 华歌尔
WE11DONE
Wedgwood
WMF 福腾宝
WOOYOUNGMI
Y-3
Yer-shari 耶里夏丽
ZAKUZAKU
ZUCZUG
Zwilling 双立人
13DE MARZO
1436 鄂尔多斯`.trim().split("\n");

export const shanghaiVillageDining = `Sue Hsiao Liu 苏小柳
Café del Volcán
% Arabica
ZAKUZAKU
T9tea
FAT PHO 大發越南粉
VENCHI闻绮
MOMÉNTI
Really Thai
LA MATCHA 抹茶吧
LOONG MIEN KOON 龙味馆
BEEF & LIBERTY 尚牛社会
CHAGEE霸王茶姬
Yer-shari 耶里夏丽
KOYA RAMEN 琥家拉面
Huokao 伙靠
UGLY GELATO
STARBUCKS 星巴克
Other Tea
SHI HAO DIAN 食好點`.split("\n");

export const canonicalShanghaiName = (raw: string): string[] => {
  if (raw.startsWith("DESCENTE")) return ["DESCENTE"];
  if (raw === "HOGAN / TOD'S") return ["HOGAN", "TOD'S"];
  return [raw.replace(/[\u3400-\u9fff].*$/u, "").trim()];
};

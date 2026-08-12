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

export const shanghaiVillageNewBrandIds = ["aimer", "anine-bing", "apm-monaco", "bosideng", "chj-jewellery", "chloechen", "christofle", "croquis", "curiel", "dan-nong", "dazzle", "documents", "edition", "eland", "erdos", "exception", "fila-kids", "gentspace", "giada", "glasstique", "haixingmarket", "hechter", "hefang", "hilditch-key", "hoka-one-one", "jewelria", "jnby-by-jnby", "jnby", "kailas", "kolon-sports", "lanecrawford", "laurel", "lenscrafters", "less", "let-s-vintage", "maia-active", "marisfrolg", "mo-co", "monologue", "moodytiger", "mugen-optical", "neiwai", "new-balance-kids", "nice-rice", "papito", "paw-in-paw", "ports", "rockfish-weatherwear", "s-beauty-method", "shanghai-tang", "staccato", "subdued", "tabio", "undefeated", "urban-exploration", "we11done", "zuczug", "13de-marzo", "1436"] as const;

/** Complete authoritative raw retail entry to canonical brand-ID transformation. */
export const shanghaiVillageRetailSourceBrandIds = {
"adidas Originals": ["adidas-originals"],
"adidas 阿迪达斯": ["adidas"],
"Aigle": ["aigle"],
"AIMER 爱慕": ["aimer"],
"Alexander McQueen": ["alexander-mcqueen"],
"AllSaints": ["allsaints"],
"American Vintage": ["american-vintage"],
"AMI": ["ami-paris"],
"ANINE BING": ["anine-bing"],
"APM MONACO": ["apm-monaco"],
"Arc'Teryx 始祖鸟": ["arcteryx"],
"Armani 阿玛尼": ["armani"],
"Asics 亚瑟士": ["asics"],
"ba&sh": ["ba-and-sh"],
"BALENCIAGA 巴黎世家": ["balenciaga"],
"Bally 巴利": ["bally"],
"Balmain 巴尔曼": ["balmain"],
"Barbour": ["barbour"],
"Bogner 博格纳": ["bogner"],
"Bonpoint": ["bonpoint"],
"Bosideng": ["bosideng"],
"BOSS 雨果 博斯": ["boss"],
"Breitling 百年灵": ["breitling"],
"Brooks Brothers 布克兄弟": ["brooks-brothers"],
"Brunello Cucinelli": ["brunello-cucinelli"],
"Burberry": ["burberry"],
"BURTON": ["burton"],
"Calvin Klein": ["calvin-klein"],
"Canada Goose": ["canada-goose"],
"CANALI": ["canali"],
"Carhartt WIP": ["carhartt-wip"],
"CELINE": ["celine"],
"Champion 冠军": ["champion"],
"CHJ JEWELLERY": ["chj-jewellery"],
"Chloé": ["chloe"],
"CHLOECHEN": ["chloechen"],
"Christofle": ["christofle"],
"Clarks 其乐": ["clarks"],
"Coach 蔻驰": ["coach"],
"converse": ["converse"],
"Crocs": ["crocs"],
"Croquis 速写": ["croquis"],
"Curiel 蔻蕊": ["curiel"],
"DĀN NÓNG 单农": ["dan-nong"],
"DAZZLE": ["dazzle"],
"DESCENTE戈什门店": ["descente"],
"DESCENTE美尔大道店": ["descente"],
"DIESEL": ["diesel"],
"DOCUMENTS": ["documents"],
"DOLCE&GABBANA": ["dolceandgabbana"],
"Dr.Martens": ["dr-martens"],
"dunhill 登喜路": ["dunhill"],
"dyson": ["dyson"],
"ECCO 爱步": ["ecco"],
"Edition": ["edition"],
"ELAND 衣恋": ["eland"],
"ERDOS 鄂尔多斯": ["erdos"],
"Ermanno Scervino": ["ermanno-scervino"],
"EXCEPTION": ["exception"],
"FERRAGAMO 菲拉格慕": ["ferragamo"],
"Fila": ["fila"],
"FILA Kids 斐乐": ["fila-kids"],
"G/FORE": ["g-fore"],
"GENTSPACE": ["gentspace"],
"GIADA": ["giada"],
"GIVENCHY 纪梵希": ["givenchy"],
"Glasstique 眼镜店": ["glasstique"],
"GOLDEN GOOSE": ["golden-goose"],
"Goldwin": ["goldwin"],
"Haglöfs": ["haglofs"],
"HaixingMarket": ["haixingmarket"],
"HAZZYS": ["hazzys"],
"HECHTER": ["hechter"],
"HEFANG": ["hefang"],
"Helly Hansen": ["helly-hansen"],
"Hilditch & Key": ["hilditch-key"],
"HOGAN / TOD'S": ["hogan","tods"],
"HOKA ONE ONE": ["hoka-one-one"],
"IRO": ["iro"],
"Isabel Marant": ["isabel-marant"],
"J.LINDEBERG 金林德伯格": ["j-lindeberg"],
"JEWELRIA 周大福荟馆": ["jewelria"],
"JIL SANDER": ["jil-sander"],
"Jimmy Choo 周仰杰": ["jimmy-choo"],
"jnby by JNBY": ["jnby-by-jnby"],
"JNBY 江南布衣": ["jnby"],
"Joseph": ["joseph"],
"KAILAS": ["kailas"],
"kate spade": ["kate-spade"],
"KENZO": ["kenzo"],
"Kiton": ["kiton"],
"KOLON SPORTS": ["kolon-sports"],
"L'OCCITANE 普罗旺斯欧舒丹": ["l-occitane"],
"L’Oréal": ["loreal"],
"LACOSTE": ["lacoste"],
"LANECRAWFORD": ["lanecrawford"],
"Laurèl": ["laurel"],
"Lee": ["lee"],
"LensCrafters 亮视点": ["lenscrafters"],
"LESS": ["less"],
"LET'S VINTAGE": ["let-s-vintage"],
"Levi's 李维斯": ["levis"],
"LOEWE 罗意威": ["loewe"],
"Longchamp 珑骧": ["longchamp"],
"Loro Piana 诺悠翩雅": ["loro-piana"],
"Lottusse 乐途仕": ["lottusse"],
"lululemon 露露乐蒙": ["lululemon"],
"MAIA ACTIVE": ["maia-active"],
"Maison Kitsuné": ["maison-kitsune"],
"Maison Margiela": ["maison-margiela"],
"Maje": ["maje"],
"MAMMUT": ["mammut"],
"Marisfrolg 玛丝菲尔": ["marisfrolg"],
"MARNI": ["marni"],
"MaxMara": ["max-mara"],
"MLB": ["mlb-korea"],
"MO&Co.": ["mo-co"],
"MONOLOGUE": ["monologue"],
"MONTBLANC 万宝龙": ["montblanc"],
"moodytiger": ["moodytiger"],
"Moose Knuckles": ["moose-knuckles"],
"MOSCHINO 莫斯奇诺": ["moschino"],
"MOUSSY": ["moussy"],
"Mugen Optical 目艮眼镜": ["mugen-optical"],
"NAUTICA": ["nautica"],
"NEIWAI 内外": ["neiwai"],
"New Balance": ["new-balance"],
"new balance kids": ["new-balance-kids"],
"New Era": ["new-era"],
"Nice Rice": ["nice-rice"],
"NIKE 耐克": ["nike"],
"Onitsuka Tiger 鬼塚虎": ["onitsuka-tiger"],
"On昂跑": ["on"],
"PAPITO": ["papito"],
"Patagonia": ["patagonia"],
"Paw in Paw 宝英宝": ["paw-in-paw"],
"Polo Ralph Lauren拉夫劳伦": ["polo-ralph-lauren"],
"PORTS": ["ports"],
"Puma 彪马": ["puma"],
"Ray-Ban 雷朋": ["ray-ban"],
"Rituals": ["rituals"],
"Rockfish Weatherwear": ["rockfish-weatherwear"],
"S-BEAUTY METHOD 资生堂集团美妆集合店": ["s-beauty-method"],
"Salomon 萨洛蒙": ["salomon"],
"Samsonite 新秀丽": ["samsonite"],
"SANDRO": ["sandro"],
"Saucony": ["saucony"],
"self-portrait": ["self-portrait"],
"Shanghai Tang 上海滩": ["shanghai-tang"],
"Skechers 斯凯奇": ["skechers"],
"STACCATO 思加图": ["staccato"],
"Stuart Weitzman 思缇韦曼": ["stuart-weitzman"],
"Subdued": ["subdued"],
"SWAROVSKI 施华洛世奇": ["swarovski"],
"Tabio": ["tabio"],
"THE COSMETICS COMPANY STORE 雅诗兰黛集团集合店": ["the-cosmetics-company-store"],
"The North Face": ["the-north-face"],
"Theory 思睿": ["theory"],
"Thom Browne": ["thom-browne"],
"Timberland 添柏岚": ["timberland"],
"Tom Ford": ["tom-ford"],
"Tommy Hilfiger": ["tommy-hilfiger"],
"Tory Burch 汤丽柏琦": ["tory-burch"],
"TUMI 途明": ["tumi"],
"UGG": ["ugg"],
"UNDEFEATED": ["undefeated"],
"Under Armour": ["underarmour"],
"Urban Exploration": ["urban-exploration"],
"Valentino 华伦天奴": ["valentino"],
"Versace 范思哲": ["versace"],
"Vivienne Westwood": ["vivienne-westwood"],
"Vuori": ["vuori"],
"Wacoal 华歌尔": ["wacoal"],
"WE11DONE": ["we11done"],
"Wedgwood": ["wedgwood"],
"WMF 福腾宝": ["wmf"],
"WOOYOUNGMI": ["wooyoungmi"],
"Y-3": ["y-3"],
"ZUCZUG": ["zuczug"],
"Zwilling 双立人": ["zwilling"],
"13DE MARZO": ["13de-marzo"],
"1436 鄂尔多斯": ["1436"],
} as const satisfies Record<string, readonly string[]>;

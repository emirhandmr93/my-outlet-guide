import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

const assert = (condition: unknown, message: string): asserts condition => { if (!condition) throw new Error(message); };
const sha256 = (value: unknown) => createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");

// Frozen Issue #622/#623 audit input. This mapping is intentionally literal and independent of outletBrands.
const acceptedDisplayToBrandIds: Record<string, string[]> = {
  "ADIDAS": ["adidas"],
  "ADL": ["adl"],
  "ADORE OYUNCAK": ["adore-oyuncak"],
  "ADV": ["adv"],
  "ALTINBAŞ": ["altinbas"],
  "ALTINYILDIZ CLASSICS": ["altinyildiz-classics"],
  "ARİFOĞLU": ["arifoglu"],
  "ARMİNE": ["armine"],
  "ATASAY": ["atasay"],
  "AVVA": ["avva"],
  "AYAKKABI DÜNYASI": ["ayakkabi-dunyasi"],
  "B&G STORE": ["b-and-g-store"],
  "BAD BEAR": ["bad-bear"],
  "BAMBİ": ["bambi"],
  "BARGELLO": ["bargello"],
  "Baroni Diamond": ["baroni-diamond"],
  "BEKO": ["beko"],
  "BEYMEN BUSINESS": ["beymen"],
  "BİSSE": ["bisse"],
  "BONİTAS": ["bonitas"],
  "CACHAREL": ["cacharel"],
  "CEPAX": ["cepax"],
  "CHAKRA": ["chakra"],
  "CLUB BEYMEN": ["beymen"],
  "COLINS": ["colins"],
  "COLUMBIA": ["columbia"],
  "Çift Geyik Karaca": ["cift-geyik-karaca"],
  "ÇİLEK KONSEPT": ["cilek-konsept"],
  "D'EROL": ["derol"],
  "D&R": ["d-and-r"],
  "DAGI": ["dagi"],
  "DEFACTO": ["defacto"],
  "DERİMOD": ["derimod"],
  "DESA": ["desa"],
  "DS DAMAT": ["ds-damat"],
  "DS DAMAT TWEEN": ["damat-tween"],
  "DSG OUTLET": ["dsg-outlet"],
  "DUFY": ["dufy"],
  "DYSON": ["dyson"],
  "EFOR": ["efor"],
  "EKOL": ["ekol"],
  "ELLE": ["elle"],
  "EMO OPTİK": ["emo-optik"],
  "ENGLISH HOME": ["english-home"],
  "EXXE SELECTION": ["exxe-selection"],
  "EXXE SELECTION POP-UP": ["exxe-selection"],
  "FLO": ["flo"],
  "FLORMAR": ["flormar"],
  "FREDERIC PATRIC PARFUM": ["frederic-patric-parfum"],
  "FRESH SCARFS": ["fresh-scarfs"],
  "G LINGERIE": ["g-lingerie"],
  "GALLERY CRYSTAL": ["gallery-crystal"],
  "GANT": ["gant"],
  "GIZIA": ["gizia"],
  "GRATİS": ["gratis"],
  "GREYDER": ["greyder"],
  "GUESS": ["guess"],
  "H&M": ["h-and-m"],
  "HATEMOĞLU": ["hatemoglu"],
  "HELLO SWEETIE HARIBO": ["hello-sweetie-haribo"],
  "HOTİÇ": ["hotic"],
  "HUMMEL": ["hummel"],
  "HUPALUPA STORE": ["hupalupa-store"],
  "IN STREET": ["in-street"],
  "ITALIAN": ["italian"],
  "İPEKYOL": ["ipekyol"],
  "JACK & JONES": ["jack-and-jones"],
  "JEANS LAB": ["jeanslab"],
  "JOIA": ["joia"],
  "Karaca": ["karaca"],
  "KAYRA": ["kayra"],
  "Kiko Milano": ["kiko-milano"],
  "KİDS HOME": ["kids-home"],
  "KİĞILI": ["kigili"],
  "KİTİKATE": ["kitikate"],
  "KOM": ["kom"],
  "KORKMAZ": ["korkmaz"],
  "KOTON": ["koton"],
  "KÜPPELİ": ["kuppeli"],
  "LAURA BELLA": ["laura-bella"],
  "LC WAİKİKİ": ["lc-waikiki"],
  "LCW DREAM": ["lcw-dream"],
  "LCW XSIDE": ["lcw-xside"],
  "LEE WRANGLER": ["lee-wrangler"],
  "LELAS PARFÜM": ["lelas-company"],
  "LESCON": ["lescon"],
  "Levi's": ["levis"],
  "LOVE MY BODY": ["love-my-body"],
  "LTB": ["ltb"],
  "LUFIAN": ["lufian"],
  "LUI JO MILANO": ["lui-jo-milano"],
  "MAD PARFUME": ["mad-parfum"],
  "Mado Dondurma": ["mado"],
  "MADAME COCO": ["madame-coco"],
  "MANUKA": ["manuka"],
  "MARKS & SPENCER": ["marks-and-spencer"],
  "MAVİ": ["mavi"],
  "MEDİA MARKT": ["media-markt"],
  "MİGROS": ["migros"],
  "MİNİKİDO": ["minikido"],
  "MİNİSO": ["miniso"],
  "MrDIY": ["mr-diy"],
  "MUDO COLLECTION": ["mudo-collection"],
  "NARAMAXX": ["naramaxx"],
  "NAUTICA": ["nautica"],
  "NOCTURNE": ["nocturne"],
  "NOMINATION ITALY": ["nomination-italy"],
  "OCCASION": ["occasion"],
  "OPTICITY": ["opticity"],
  "ORİENT'S SİLVER": ["orients-silver"],
  "Osmanlı Oud": ["osmanli-oud-parfum"],
  "OXXO": ["oxxo"],
  "PANÇO": ["panco"],
  "Pandora": ["pandora"],
  "PAUL&SHARK": ["paul-and-shark"],
  "PENTİ": ["penti"],
  "PERGE KUYUMCULUK": ["perge-kuyumculuk"],
  "PIERRE CARDIN": ["pierre-cardin"],
  "PİSERRO": ["piserro"],
  "POLO GARAGE": ["polo-garage"],
  "PURPUR ACCESSORIES": ["purpur-accessories"],
  "Roberto Bravo": ["roberto-bravo"],
  "ROSSMANN": ["rossmann"],
  "ROYAL PLATINUM PARFÜM": ["royal-platinum-parfum"],
  "RUBA": ["ruba"],
  "RUE": ["rue"],
  "RUZ-KA AKSESUAR": ["ruz-ka-aksesuar"],
  "SAAT&SAAT": ["saat-saat"],
  "SAMSONITE": ["samsonite"],
  "SAMSUNG": ["samsung"],
  "SARAR": ["sarar"],
  "SAREV": ["sarev"],
  "SCHAFER": ["schafer"],
  "SHOP&SHOES": ["shop-shoes"],
  "SKECHERS": ["skechers"],
  "SNEAKS UP": ["sneaks-up"],
  "SPORTHINK": ["sporthink"],
  "SPORTIVE": ["sportive"],
  "SPX MEGA": ["spx"],
  "SPX POP-UP": ["spx"],
  "STUDIO KIDS": ["studio-kids"],
  "SUNGLASS HUT": ["sunglass-hut"],
  "SUPERSTEP": ["superstep"],
  "SUWEN": ["suwen"],
  "SÜVARİ": ["suvari"],
  "Takma Takma": ["takma-takma"],
  "TAMER TANCA": ["tamer-tanca"],
  "TERGAN": ["tergan"],
  "TERGAN DEEPO": ["tergan"],
  "The Moose Bay": ["the-moose-bay"],
  "TOI et MOI": ["toi-and-moi"],
  "TOMMY HILFIGER": ["tommy-hilfiger"],
  "TOYZZ SHOP": ["toyzz-shop"],
  "TUDORS": ["tudors"],
  "TUĞBA": ["tugba"],
  "TURKCELL": ["turkcell"],
  "TÜRK TELEKOM": ["turk-telekom"],
  "TWIST": ["twist"],
  "TWİGY": ["twigy"],
  "U.S POLO KIDS": ["u-s-polo-kids"],
  "U.S. POLO ASSN. SHOES & BAGS": ["u-s-polo-assn"],
  "UNDER ARMOUR": ["under-armour"],
  "UNITED COLORS OF BENETTON": ["united-colors-of-benetton"],
  "US POLO ASSN.": ["u-s-polo-assn"],
  "VAKKO": ["vakko"],
  "VATAN": ["vatan-bilgisayar"],
  "VIALLI SILVER": ["vialli-silver"],
  "VODAFONE": ["vodafone"],
  "W COLLECTION": ["w-collection"],
  "WATSONS": ["watsons"],
  "YARGICI": ["yargici"],
  "YILMAZ OPTİK": ["yilmaz-optik"],
  "YVES ROCHER": ["yves-rocher"],
  "ZEN PIRLANTA": ["zen-diamond"],
  "Choc Nette": ["choc-nette"],
  "FISTIKOĞLU KURUYEMİŞ": ["fistikoglu-kuruyemis"],
  "Kiko Milano": ["kiko-milano"]
};

// Frozen Issue #622/#623 raw directory cards.  Each card is classified before
// reconciliation so a changed card, classification, or accepted heading is observable.
const frozenRawRows = [
  {
    "heading": "ADIDAS",
    "classification": "accepted"
  },
  {
    "heading": "ADL",
    "classification": "accepted"
  },
  {
    "heading": "ADORE OYUNCAK",
    "classification": "accepted"
  },
  {
    "heading": "ADV",
    "classification": "accepted"
  },
  {
    "heading": "ALTINBAŞ",
    "classification": "accepted"
  },
  {
    "heading": "ALTINYILDIZ CLASSICS",
    "classification": "accepted"
  },
  {
    "heading": "ARİFOĞLU",
    "classification": "accepted"
  },
  {
    "heading": "ARMİNE",
    "classification": "accepted"
  },
  {
    "heading": "ATASAY",
    "classification": "accepted"
  },
  {
    "heading": "AVVA",
    "classification": "accepted"
  },
  {
    "heading": "AYAKKABI DÜNYASI",
    "classification": "accepted"
  },
  {
    "heading": "B&G STORE",
    "classification": "accepted"
  },
  {
    "heading": "BAD BEAR",
    "classification": "accepted"
  },
  {
    "heading": "BAMBİ",
    "classification": "accepted"
  },
  {
    "heading": "BARGELLO",
    "classification": "accepted"
  },
  {
    "heading": "Baroni Diamond",
    "classification": "accepted"
  },
  {
    "heading": "BEKO",
    "classification": "accepted"
  },
  {
    "heading": "BEYMEN BUSINESS",
    "classification": "accepted"
  },
  {
    "heading": "BİSSE",
    "classification": "accepted"
  },
  {
    "heading": "BONİTAS",
    "classification": "accepted"
  },
  {
    "heading": "CACHAREL",
    "classification": "accepted"
  },
  {
    "heading": "CEPAX",
    "classification": "accepted"
  },
  {
    "heading": "CHAKRA",
    "classification": "accepted"
  },
  {
    "heading": "CLUB BEYMEN",
    "classification": "accepted"
  },
  {
    "heading": "COLINS",
    "classification": "accepted"
  },
  {
    "heading": "COLUMBIA",
    "classification": "accepted"
  },
  {
    "heading": "Çift Geyik Karaca",
    "classification": "accepted"
  },
  {
    "heading": "ÇİLEK KONSEPT",
    "classification": "accepted"
  },
  {
    "heading": "D'EROL",
    "classification": "accepted"
  },
  {
    "heading": "D&R",
    "classification": "accepted"
  },
  {
    "heading": "DAGI",
    "classification": "accepted"
  },
  {
    "heading": "DEFACTO",
    "classification": "accepted"
  },
  {
    "heading": "DERİMOD",
    "classification": "accepted"
  },
  {
    "heading": "DESA",
    "classification": "accepted"
  },
  {
    "heading": "DS DAMAT",
    "classification": "accepted"
  },
  {
    "heading": "DS DAMAT TWEEN",
    "classification": "accepted"
  },
  {
    "heading": "DSG OUTLET",
    "classification": "accepted"
  },
  {
    "heading": "DUFY",
    "classification": "accepted"
  },
  {
    "heading": "DYSON",
    "classification": "accepted"
  },
  {
    "heading": "EFOR",
    "classification": "accepted"
  },
  {
    "heading": "EKOL",
    "classification": "accepted"
  },
  {
    "heading": "ELLE",
    "classification": "accepted"
  },
  {
    "heading": "EMO OPTİK",
    "classification": "accepted"
  },
  {
    "heading": "ENGLISH HOME",
    "classification": "accepted"
  },
  {
    "heading": "EXXE SELECTION",
    "classification": "accepted"
  },
  {
    "heading": "EXXE SELECTION POP-UP",
    "classification": "accepted"
  },
  {
    "heading": "FLO",
    "classification": "accepted"
  },
  {
    "heading": "FLORMAR",
    "classification": "accepted"
  },
  {
    "heading": "FREDERIC PATRIC PARFUM",
    "classification": "accepted"
  },
  {
    "heading": "FRESH SCARFS",
    "classification": "accepted"
  },
  {
    "heading": "G LINGERIE",
    "classification": "accepted"
  },
  {
    "heading": "GALLERY CRYSTAL",
    "classification": "accepted"
  },
  {
    "heading": "GANT",
    "classification": "accepted"
  },
  {
    "heading": "GIZIA",
    "classification": "accepted"
  },
  {
    "heading": "GRATİS",
    "classification": "accepted"
  },
  {
    "heading": "GREYDER",
    "classification": "accepted"
  },
  {
    "heading": "GUESS",
    "classification": "accepted"
  },
  {
    "heading": "H&M",
    "classification": "accepted"
  },
  {
    "heading": "HATEMOĞLU",
    "classification": "accepted"
  },
  {
    "heading": "HELLO SWEETIE HARIBO",
    "classification": "accepted"
  },
  {
    "heading": "HOTİÇ",
    "classification": "accepted"
  },
  {
    "heading": "HUMMEL",
    "classification": "accepted"
  },
  {
    "heading": "HUPALUPA STORE",
    "classification": "accepted"
  },
  {
    "heading": "IN STREET",
    "classification": "accepted"
  },
  {
    "heading": "ITALIAN",
    "classification": "accepted"
  },
  {
    "heading": "İPEKYOL",
    "classification": "accepted"
  },
  {
    "heading": "JACK & JONES",
    "classification": "accepted"
  },
  {
    "heading": "JEANS LAB",
    "classification": "accepted"
  },
  {
    "heading": "JOIA",
    "classification": "accepted"
  },
  {
    "heading": "Karaca",
    "classification": "accepted"
  },
  {
    "heading": "KAYRA",
    "classification": "accepted"
  },
  {
    "heading": "Kiko Milano",
    "classification": "accepted"
  },
  {
    "heading": "KİDS HOME",
    "classification": "accepted"
  },
  {
    "heading": "KİĞILI",
    "classification": "accepted"
  },
  {
    "heading": "KİTİKATE",
    "classification": "accepted"
  },
  {
    "heading": "KOM",
    "classification": "accepted"
  },
  {
    "heading": "KORKMAZ",
    "classification": "accepted"
  },
  {
    "heading": "KOTON",
    "classification": "accepted"
  },
  {
    "heading": "KÜPPELİ",
    "classification": "accepted"
  },
  {
    "heading": "LAURA BELLA",
    "classification": "accepted"
  },
  {
    "heading": "LC WAİKİKİ",
    "classification": "accepted"
  },
  {
    "heading": "LCW DREAM",
    "classification": "accepted"
  },
  {
    "heading": "LCW XSIDE",
    "classification": "accepted"
  },
  {
    "heading": "LEE WRANGLER",
    "classification": "accepted"
  },
  {
    "heading": "LELAS PARFÜM",
    "classification": "accepted"
  },
  {
    "heading": "LESCON",
    "classification": "accepted"
  },
  {
    "heading": "Levi's",
    "classification": "accepted"
  },
  {
    "heading": "LOVE MY BODY",
    "classification": "accepted"
  },
  {
    "heading": "LTB",
    "classification": "accepted"
  },
  {
    "heading": "LUFIAN",
    "classification": "accepted"
  },
  {
    "heading": "LUI JO MILANO",
    "classification": "accepted"
  },
  {
    "heading": "MAD PARFUME",
    "classification": "accepted"
  },
  {
    "heading": "Mado Dondurma",
    "classification": "accepted"
  },
  {
    "heading": "MADAME COCO",
    "classification": "accepted"
  },
  {
    "heading": "MANUKA",
    "classification": "accepted"
  },
  {
    "heading": "MARKS & SPENCER",
    "classification": "accepted"
  },
  {
    "heading": "MAVİ",
    "classification": "accepted"
  },
  {
    "heading": "MEDİA MARKT",
    "classification": "accepted"
  },
  {
    "heading": "MİGROS",
    "classification": "accepted"
  },
  {
    "heading": "MİNİKİDO",
    "classification": "accepted"
  },
  {
    "heading": "MİNİSO",
    "classification": "accepted"
  },
  {
    "heading": "MrDIY",
    "classification": "accepted"
  },
  {
    "heading": "MUDO COLLECTION",
    "classification": "accepted"
  },
  {
    "heading": "NARAMAXX",
    "classification": "accepted"
  },
  {
    "heading": "NAUTICA",
    "classification": "accepted"
  },
  {
    "heading": "NOCTURNE",
    "classification": "accepted"
  },
  {
    "heading": "NOMINATION ITALY",
    "classification": "accepted"
  },
  {
    "heading": "OCCASION",
    "classification": "accepted"
  },
  {
    "heading": "OPTICITY",
    "classification": "accepted"
  },
  {
    "heading": "ORİENT'S SİLVER",
    "classification": "accepted"
  },
  {
    "heading": "Osmanlı Oud",
    "classification": "accepted"
  },
  {
    "heading": "OXXO",
    "classification": "accepted"
  },
  {
    "heading": "PANÇO",
    "classification": "accepted"
  },
  {
    "heading": "Pandora",
    "classification": "accepted"
  },
  {
    "heading": "PAUL&SHARK",
    "classification": "accepted"
  },
  {
    "heading": "PENTİ",
    "classification": "accepted"
  },
  {
    "heading": "PERGE KUYUMCULUK",
    "classification": "accepted"
  },
  {
    "heading": "PIERRE CARDIN",
    "classification": "accepted"
  },
  {
    "heading": "PİSERRO",
    "classification": "accepted"
  },
  {
    "heading": "POLO GARAGE",
    "classification": "accepted"
  },
  {
    "heading": "PURPUR ACCESSORIES",
    "classification": "accepted"
  },
  {
    "heading": "Roberto Bravo",
    "classification": "accepted"
  },
  {
    "heading": "ROSSMANN",
    "classification": "accepted"
  },
  {
    "heading": "ROYAL PLATINUM PARFÜM",
    "classification": "accepted"
  },
  {
    "heading": "RUBA",
    "classification": "accepted"
  },
  {
    "heading": "RUE",
    "classification": "accepted"
  },
  {
    "heading": "RUZ-KA AKSESUAR",
    "classification": "accepted"
  },
  {
    "heading": "SAAT&SAAT",
    "classification": "accepted"
  },
  {
    "heading": "SAMSONITE",
    "classification": "accepted"
  },
  {
    "heading": "SAMSUNG",
    "classification": "accepted"
  },
  {
    "heading": "SARAR",
    "classification": "accepted"
  },
  {
    "heading": "SAREV",
    "classification": "accepted"
  },
  {
    "heading": "SCHAFER",
    "classification": "accepted"
  },
  {
    "heading": "SHOP&SHOES",
    "classification": "accepted"
  },
  {
    "heading": "SKECHERS",
    "classification": "accepted"
  },
  {
    "heading": "SNEAKS UP",
    "classification": "accepted"
  },
  {
    "heading": "SPORTHINK",
    "classification": "accepted"
  },
  {
    "heading": "SPORTIVE",
    "classification": "accepted"
  },
  {
    "heading": "SPX MEGA",
    "classification": "accepted"
  },
  {
    "heading": "SPX POP-UP",
    "classification": "accepted"
  },
  {
    "heading": "STUDIO KIDS",
    "classification": "accepted"
  },
  {
    "heading": "SUNGLASS HUT",
    "classification": "accepted"
  },
  {
    "heading": "SUPERSTEP",
    "classification": "accepted"
  },
  {
    "heading": "SUWEN",
    "classification": "accepted"
  },
  {
    "heading": "SÜVARİ",
    "classification": "accepted"
  },
  {
    "heading": "Takma Takma",
    "classification": "accepted"
  },
  {
    "heading": "TAMER TANCA",
    "classification": "accepted"
  },
  {
    "heading": "TERGAN",
    "classification": "accepted"
  },
  {
    "heading": "TERGAN DEEPO",
    "classification": "accepted"
  },
  {
    "heading": "The Moose Bay",
    "classification": "accepted"
  },
  {
    "heading": "TOI et MOI",
    "classification": "accepted"
  },
  {
    "heading": "TOMMY HILFIGER",
    "classification": "accepted"
  },
  {
    "heading": "TOYZZ SHOP",
    "classification": "accepted"
  },
  {
    "heading": "TUDORS",
    "classification": "accepted"
  },
  {
    "heading": "TUĞBA",
    "classification": "accepted"
  },
  {
    "heading": "TURKCELL",
    "classification": "accepted"
  },
  {
    "heading": "TÜRK TELEKOM",
    "classification": "accepted"
  },
  {
    "heading": "TWIST",
    "classification": "accepted"
  },
  {
    "heading": "TWİGY",
    "classification": "accepted"
  },
  {
    "heading": "U.S POLO KIDS",
    "classification": "accepted"
  },
  {
    "heading": "U.S. POLO ASSN. SHOES & BAGS",
    "classification": "accepted"
  },
  {
    "heading": "UNDER ARMOUR",
    "classification": "accepted"
  },
  {
    "heading": "UNITED COLORS OF BENETTON",
    "classification": "accepted"
  },
  {
    "heading": "US POLO ASSN.",
    "classification": "accepted"
  },
  {
    "heading": "VAKKO",
    "classification": "accepted"
  },
  {
    "heading": "VATAN",
    "classification": "accepted"
  },
  {
    "heading": "VIALLI SILVER",
    "classification": "accepted"
  },
  {
    "heading": "VODAFONE",
    "classification": "accepted"
  },
  {
    "heading": "W COLLECTION",
    "classification": "accepted"
  },
  {
    "heading": "WATSONS",
    "classification": "accepted"
  },
  {
    "heading": "YARGICI",
    "classification": "accepted"
  },
  {
    "heading": "YILMAZ OPTİK",
    "classification": "accepted"
  },
  {
    "heading": "YVES ROCHER",
    "classification": "accepted"
  },
  {
    "heading": "ZEN PIRLANTA",
    "classification": "accepted"
  },
  {
    "heading": "Choc Nette",
    "classification": "accepted"
  },
  {
    "heading": "FISTIKOĞLU KURUYEMİŞ",
    "classification": "accepted"
  },
  {
    "heading": "Kiko Milano",
    "classification": "accepted"
  },
  {
    "heading": "TERGAN",
    "classification": "accepted"
  },
  {
    "heading": "SPX MEGA",
    "classification": "accepted"
  },
  {
    "heading": "EXXE SELECTION",
    "classification": "accepted"
  },
  {
    "heading": "US POLO ASSN.",
    "classification": "accepted"
  },
  {
    "heading": "BEYMEN BUSINESS",
    "classification": "accepted"
  },
  {
    "heading": "AKSESUAR DÜNYASI",
    "classification": "excluded"
  },
  {
    "heading": "ANADOLU ATEŞİ",
    "classification": "excluded"
  },
  {
    "heading": "ANTALYA HEDİYELİK",
    "classification": "excluded"
  },
  {
    "heading": "ARBY'S",
    "classification": "excluded"
  },
  {
    "heading": "BAYDÖNER",
    "classification": "excluded"
  },
  {
    "heading": "BİLETİNİAL",
    "classification": "excluded"
  },
  {
    "heading": "BURGER KING",
    "classification": "excluded"
  },
  {
    "heading": "CAFE NERO",
    "classification": "excluded"
  },
  {
    "heading": "CARREFOURSA",
    "classification": "excluded"
  },
  {
    "heading": "CINEVERSE",
    "classification": "excluded"
  },
  {
    "heading": "COLD STONE",
    "classification": "excluded"
  },
  {
    "heading": "COOKSHOP",
    "classification": "excluded"
  },
  {
    "heading": "DEFACTO KIDS",
    "classification": "excluded"
  },
  {
    "heading": "DEPO KAFE",
    "classification": "excluded"
  },
  {
    "heading": "DÖNER STOP",
    "classification": "excluded"
  },
  {
    "heading": "DÜNYA GÖZ",
    "classification": "excluded"
  },
  {
    "heading": "ECZANE",
    "classification": "excluded"
  },
  {
    "heading": "ESPRESSOLAB",
    "classification": "excluded"
  },
  {
    "heading": "FENERIUM",
    "classification": "excluded"
  },
  {
    "heading": "GETIR",
    "classification": "excluded"
  },
  {
    "heading": "GİMART",
    "classification": "excluded"
  },
  {
    "heading": "GÖZDE OPTİK",
    "classification": "excluded"
  },
  {
    "heading": "GREYDER CAFE",
    "classification": "excluded"
  },
  {
    "heading": "HAKAN ÇANTA",
    "classification": "excluded"
  },
  {
    "heading": "JUMBO EV",
    "classification": "excluded"
  },
  {
    "heading": "KAHVE DÜNYASI",
    "classification": "excluded"
  },
  {
    "heading": "KFC",
    "classification": "excluded"
  },
  {
    "heading": "KİTAPÇI",
    "classification": "excluded"
  },
  {
    "heading": "KÖFTECİ RAMİZ",
    "classification": "excluded"
  },
  {
    "heading": "MADO CAFE",
    "classification": "excluded"
  },
  {
    "heading": "MCDONALD'S",
    "classification": "excluded"
  },
  {
    "heading": "MİGROS JET",
    "classification": "excluded"
  },
  {
    "heading": "NEVÇARŞI",
    "classification": "excluded"
  },
  {
    "heading": "NOTER",
    "classification": "excluded"
  },
  {
    "heading": "OTOPARK",
    "classification": "excluded"
  },
  {
    "heading": "PARK AFYON SERVİS",
    "classification": "excluded"
  },
  {
    "heading": "PİDE BY PİDE",
    "classification": "excluded"
  },
  {
    "heading": "POPEYES",
    "classification": "excluded"
  },
  {
    "heading": "SIMIT SARAYI",
    "classification": "excluded"
  },
  {
    "heading": "STARBUCKS",
    "classification": "excluded"
  },
  {
    "heading": "TACİRLER KUYUMCULUK",
    "classification": "excluded"
  },
  {
    "heading": "TAVUK DÜNYASI",
    "classification": "excluded"
  },
  {
    "heading": "TEKNOSA SERVİS",
    "classification": "excluded"
  },
  {
    "heading": "THE BARBER",
    "classification": "excluded"
  },
  {
    "heading": "TURKCELL İLETİŞİM",
    "classification": "excluded"
  },
  {
    "heading": "UÇAK BİLETİ",
    "classification": "excluded"
  },
  {
    "heading": "VODAFONE İLETİŞİM",
    "classification": "excluded"
  },
  {
    "heading": "WATSONS KASA",
    "classification": "excluded"
  },
  {
    "heading": "YEMEK KATI",
    "classification": "excluded"
  }
] as const;
const frozenSourceRowSha256 = "ddcdcc0fa8c4ad5553eb1a8671a5cad470f70bb67f7630b534a91c8c02069634";

const expectedRelationIds = [...new Set(Object.values(acceptedDisplayToBrandIds).flat())].sort();
const rawAcceptedRows = frozenRawRows.filter((row) => row.classification === "accepted");
const rawExcludedRows = frozenRawRows.filter((row) => row.classification === "excluded");
const rawAcceptedHeadings = [...new Set(rawAcceptedRows.map((row) => row.heading))];
const sourceRowSha256 = sha256(frozenRawRows);
const mappingSha256 = "85f53763c8e42d35426ef353deede494903ba5e5917c6ab601df077659bf895a";

assert(frozenRawRows.length === 231, "Deepo frozen raw-row count drifted.");
assert(rawAcceptedRows.length === 182, "Deepo accepted raw-row count drifted.");
assert(rawExcludedRows.length === 49, "Deepo excluded raw-row count drifted.");
assert(rawAcceptedHeadings.length === 176, "Deepo accepted unique-heading count drifted.");
assert(JSON.stringify(rawAcceptedHeadings.sort()) === JSON.stringify(Object.keys(acceptedDisplayToBrandIds).sort()), "Deepo accepted headings must exactly match the independently-defined mapping.");
assert(sourceRowSha256 === frozenSourceRowSha256, "Deepo frozen raw-row snapshot changed.");
assert(Object.keys(acceptedDisplayToBrandIds).length === 176, "Deepo accepted unique display count drifted.");
assert(sha256(acceptedDisplayToBrandIds) === mappingSha256, "Deepo frozen mapping changed.");
const removedCanonicalIds = [["h", "m"].join("-"), ["us", "polo", "assn"].join("-")];
assert(!removedCanonicalIds.some((id) => expectedRelationIds.includes(id)), "Removed canonical IDs must remain absent.");
assert(acceptedDisplayToBrandIds["H&M"]?.[0] === "h-and-m", "H&M must retain h-and-m.");
assert(acceptedDisplayToBrandIds["US POLO ASSN."]?.[0] === "u-s-polo-assn", "U.S. Polo parent must retain u-s-polo-assn.");
const actual = outletBrands.filter((relation) => relation.outletId === "deepo-outlet-center");
assert(actual.length === expectedRelationIds.length, `Expected ${expectedRelationIds.length} Deepo relations, found ${actual.length}.`);
assert(JSON.stringify(actual.map((relation) => relation.brandId)) === JSON.stringify(expectedRelationIds), "Deepo relations must be alphabetically sorted and mapping-derived.");
for (const relation of actual) assert(!relation.featured && relation.relationStatus === "active", `Invalid Deepo relation fields for ${relation.brandId}.`);
const brandIds = new Set(brands.map((brand) => brand.brandId));
for (const brandId of expectedRelationIds) assert(brandIds.has(brandId), `Deepo mapping references missing canonical: ${brandId}.`);
console.log(`Deepo coverage valid: ${actual.length} relations; source SHA-256 ${sourceRowSha256}; mapping SHA-256 ${mappingSha256}.`);

function assertCompletedTurkeyRelationsMatchMergeBase(): void {
  const mergeBase = execFileSync("git", ["merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
  const baseTurkeySource = execFileSync("git", ["show", `${mergeBase}:src/constants/outletBrands/turkey.ts`], { encoding: "utf8" });
  const completedOutlets = [["oliviumBrandIds", "olivium-outlet-center", 94], ["starCityBrandIds", "starcity-outlet", 101], ["istanbulOptimumBrandIds", "optimum-premium-outlet-istanbul", 112], ["izmirOptimumBrandIds", "izmir-optimum", 194], ["viaportBrandIds", "viaport-asia-outlet-shopping", 187], ["outlet212BrandIds", "212-outlet", 105], ["veneziaBrandIds", "venezia-mega-outlet", 127]] as const;
  for (const [constantName, outletId, expectedCount] of completedOutlets) {
    const baseList = baseTurkeySource.match(new RegExp(`const ${constantName} = \\[([\\s\\S]*?)\\];`))?.[1];
    assert(baseList, `Merge-base ${constantName} sequence is unavailable.`);
    const baseIds = [...baseList.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    const expectedRelations = baseIds.map((brandId) => ({ outletId, brandId, featured: false, relationStatus: "active" }));
    const currentRelations = outletBrands.filter((relation) => relation.outletId === outletId);
    assert(baseIds.length === expectedCount, `${outletId} merge-base count drifted.`);
    assert(JSON.stringify(currentRelations) === JSON.stringify(expectedRelations), `${outletId} relation sequence and four-field objects must be byte-for-byte identical to merge-base main.`);
  }
}
assertCompletedTurkeyRelationsMatchMergeBase();

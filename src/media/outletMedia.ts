import { ImageSourcePropType } from "react-native";

import { outlets } from "../constants/outlets";
import {
  outletMediaMetadata,
  type OutletMediaAssetMetadata,
  type OutletMediaSourceStatus,
} from "./outletMediaMetadata";

export type OutletMediaImage = string | ImageSourcePropType;
export type OutletMediaResolverMode = "inventory" | "production";
export type OutletMediaResolverOptions = { mode?: OutletMediaResolverMode };
export type OutletMediaCredit = OutletMediaAssetMetadata & { displayName: string };

type PublicMediaCreditMetadata = OutletMediaAssetMetadata & {
  credit: string;
  license: string;
};

type OutletMediaOutlet = {
  outletId?: string;
  heroImage?: string;
  galleryImages?: string[];
  [key: string]: unknown;
};

type OutletLocalImageEntry = {
  image: OutletMediaImage;
  assetPath: string;
  metadata?: OutletMediaAssetMetadata;
};

export const outletMediaFallbackImages: OutletMediaImage[] = [];

const outletLocalImages: Record<string, OutletMediaImage[]> = {
  "barberino": [
    require("../../assets/outlet-images/barberino/hero.webp"),
    require("../../assets/outlet-images/barberino/gallery1.webp"),
    require("../../assets/outlet-images/barberino/gallery2.webp"),
    require("../../assets/outlet-images/barberino/gallery3.webp"),
  ],
  "castel-romano": [
    require("../../assets/outlet-images/castel-romano/hero.webp"),
    require("../../assets/outlet-images/castel-romano/gallery1.webp"),
    require("../../assets/outlet-images/castel-romano/gallery2.webp"),
  ],
  "fidenza-village": [
    require("../../assets/outlet-images/fidenza-village/hero.webp"),
    require("../../assets/outlet-images/fidenza-village/gallery1.webp"),
    require("../../assets/outlet-images/fidenza-village/gallery2.webp"),
    require("../../assets/outlet-images/fidenza-village/gallery3.webp"),
  ],
  "la-reggia": [
    require("../../assets/outlet-images/la-reggia/hero.webp"),
    require("../../assets/outlet-images/la-reggia/gallery1.webp"),
    require("../../assets/outlet-images/la-reggia/gallery2.webp"),
  ],
  "noventa": [
    require("../../assets/outlet-images/noventa/hero.webp"),
    require("../../assets/outlet-images/noventa/gallery1.webp"),
    require("../../assets/outlet-images/noventa/gallery2.webp"),
    require("../../assets/outlet-images/noventa/gallery3.webp"),
  ],
  "serravalle-designer-outlet": [
    require("../../assets/outlet-images/serravalle-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/serravalle-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/serravalle-designer-outlet/gallery2.webp"),
    require("../../assets/outlet-images/serravalle-designer-outlet/gallery3.webp"),
  ],
  "the-mall-firenze": [
    require("../../assets/outlet-images/the-mall-firenze/hero.webp"),
    require("../../assets/outlet-images/the-mall-firenze/gallery1.webp"),
    require("../../assets/outlet-images/the-mall-firenze/gallery2.webp"),
    require("../../assets/outlet-images/the-mall-firenze/gallery3.webp"),
  ],
  "valdichiana-village": [
    require("../../assets/outlet-images/valdichiana-village/hero.webp"),
    require("../../assets/outlet-images/valdichiana-village/gallery1.webp"),
    require("../../assets/outlet-images/valdichiana-village/gallery2.webp"),
    require("../../assets/outlet-images/valdichiana-village/gallery3.webp"),
  ],
  "palmanova-designer-village": [
    require("../../assets/outlet-images/palmanova-designer-village/hero.webp"),
    require("../../assets/outlet-images/palmanova-designer-village/gallery1.webp"),
    require("../../assets/outlet-images/palmanova-designer-village/gallery2.webp"),
  ],
  "franciacorta-designer-village": [
    require("../../assets/outlet-images/franciacorta-designer-village/hero.webp"),
    require("../../assets/outlet-images/franciacorta-designer-village/gallery1.webp"),
    require("../../assets/outlet-images/franciacorta-designer-village/gallery2.webp"),
    require("../../assets/outlet-images/franciacorta-designer-village/gallery3.webp"),
  ],
  "mantova-village": [
    require("../../assets/outlet-images/mantova-village/hero.webp"),
    require("../../assets/outlet-images/mantova-village/gallery1.webp"),
    require("../../assets/outlet-images/mantova-village/gallery2.webp"),
    require("../../assets/outlet-images/mantova-village/gallery3.webp"),
  ],
  "vicolungo-the-style-outlets": [
    require("../../assets/outlet-images/vicolungo-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/vicolungo-the-style-outlets/gallery1.webp"),
    require("../../assets/outlet-images/vicolungo-the-style-outlets/gallery2.webp"),
  ],
  "castel-guelfo-the-style-outlets": [
    require("../../assets/outlet-images/castel-guelfo-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/castel-guelfo-the-style-outlets/gallery1.webp"),
    require("../../assets/outlet-images/castel-guelfo-the-style-outlets/gallery2.webp"),
  ],
  "puglia-village": [
    require("../../assets/outlet-images/puglia-village/hero.webp"),
    require("../../assets/outlet-images/puglia-village/gallery1.webp"),
    require("../../assets/outlet-images/puglia-village/gallery2.webp"),
    require("../../assets/outlet-images/puglia-village/gallery3.webp"),
  ],
  "sicilia-outlet-village": [
    require("../../assets/outlet-images/sicilia-outlet-village/hero.webp"),
    require("../../assets/outlet-images/sicilia-outlet-village/gallery1.webp"),
    require("../../assets/outlet-images/sicilia-outlet-village/gallery2.webp"),
  ],
  "scalo-milano-outlet-more": [
    require("../../assets/outlet-images/scalo-milano-outlet-more/hero.webp"),
    require("../../assets/outlet-images/scalo-milano-outlet-more/gallery1.webp"),
    require("../../assets/outlet-images/scalo-milano-outlet-more/gallery2.webp"),
    require("../../assets/outlet-images/scalo-milano-outlet-more/gallery3.webp"),
  ],
  "torino-outlet-village": [
    require("../../assets/outlet-images/torino-outlet-village/hero.webp"),
    require("../../assets/outlet-images/torino-outlet-village/gallery1.webp"),
    require("../../assets/outlet-images/torino-outlet-village/gallery2.webp"),
    require("../../assets/outlet-images/torino-outlet-village/gallery3.webp"),
  ],
  "mondovicino-outlet-village": [
    require("../../assets/outlet-images/mondovicino-outlet-village/hero.webp"),
    require("../../assets/outlet-images/mondovicino-outlet-village/gallery1.webp"),
    require("../../assets/outlet-images/mondovicino-outlet-village/gallery2.webp"),
  ],
  "brugnato-5terre-outlet-village": [
    require("../../assets/outlet-images/brugnato-5terre-outlet-village/hero.webp"),
    require("../../assets/outlet-images/brugnato-5terre-outlet-village/gallery1.webp"),
    require("../../assets/outlet-images/brugnato-5terre-outlet-village/gallery2.webp"),
    require("../../assets/outlet-images/brugnato-5terre-outlet-village/gallery3.webp"),
  ],
  "valmontone-outlet": [
    require("../../assets/outlet-images/valmontone-outlet/hero.webp"),
    require("../../assets/outlet-images/valmontone-outlet/gallery1.webp"),
    require("../../assets/outlet-images/valmontone-outlet/gallery2.webp"),
  ],
  "cilento-outlet-village": [
    require("../../assets/outlet-images/cilento-outlet-village/hero.webp"),
    require("../../assets/outlet-images/cilento-outlet-village/gallery1.webp"),
    require("../../assets/outlet-images/cilento-outlet-village/gallery2.webp"),
    require("../../assets/outlet-images/cilento-outlet-village/gallery3.webp"),
  ],
  "santangelo-outlet-village": [
    require("../../assets/outlet-images/santangelo-outlet-village/hero.webp"),
    require("../../assets/outlet-images/santangelo-outlet-village/gallery1.webp"),
    require("../../assets/outlet-images/santangelo-outlet-village/gallery2.webp"),
    require("../../assets/outlet-images/santangelo-outlet-village/gallery3.webp"),
  ],
  "city-outlet-bad-munstereifel": [
    require("../../assets/outlet-images/city-outlet-bad-munstereifel/hero.webp"),
    require("../../assets/outlet-images/city-outlet-bad-munstereifel/gallery1.webp"),
    require("../../assets/outlet-images/city-outlet-bad-munstereifel/gallery2.webp"),
  ],
  "designer-outlet-berlin": [
    require("../../assets/outlet-images/designer-outlet-berlin/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-berlin/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-berlin/gallery2.webp"),
  ],
  "designer-outlet-neumunster": [
    require("../../assets/outlet-images/designer-outlet-neumunster/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-neumunster/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-neumunster/gallery2.webp"),
    require("../../assets/outlet-images/designer-outlet-neumunster/gallery3.webp"),
  ],
  "designer-outlets-wolfsburg": [
    require("../../assets/outlet-images/designer-outlets-wolfsburg/hero.webp"),
    require("../../assets/outlet-images/designer-outlets-wolfsburg/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlets-wolfsburg/gallery2.webp"),
  ],
  "ingolstadt-village": [
    require("../../assets/outlet-images/ingolstadt-village/hero.webp"),
    require("../../assets/outlet-images/ingolstadt-village/gallery1.webp"),
    require("../../assets/outlet-images/ingolstadt-village/gallery2.webp"),
    require("../../assets/outlet-images/ingolstadt-village/gallery3.webp"),
  ],
  "montabaur-the-style-outlets": [
    require("../../assets/outlet-images/montabaur-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/montabaur-the-style-outlets/gallery1.webp"),
    require("../../assets/outlet-images/montabaur-the-style-outlets/gallery2.webp"),
  ],
  "outletcity-metzingen": [
    require("../../assets/outlet-images/outletcity-metzingen/hero.webp"),
    require("../../assets/outlet-images/outletcity-metzingen/gallery1.webp"),
  ],
  "wertheim-village": [
    require("../../assets/outlet-images/wertheim-village/hero.webp"),
    require("../../assets/outlet-images/wertheim-village/gallery1.webp"),
    require("../../assets/outlet-images/wertheim-village/gallery2.webp"),
    require("../../assets/outlet-images/wertheim-village/gallery3.webp"),
  ],
  "zweibrucken-fashion-outlet": [
    require("../../assets/outlet-images/zweibrucken-fashion-outlet/hero.webp"),
    require("../../assets/outlet-images/zweibrucken-fashion-outlet/gallery1.webp"),
  ],
  "halle-leipzig-the-style-outlets": [
    require("../../assets/outlet-images/halle-leipzig-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/halle-leipzig-the-style-outlets/gallery1.webp"),
  ],
  "designer-outlet-ochtrup": [
    require("../../assets/outlet-images/designer-outlet-ochtrup/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-ochtrup/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-ochtrup/gallery2.webp"),
    require("../../assets/outlet-images/designer-outlet-ochtrup/gallery3.webp"),
  ],
  "designer-outlet-provence": [
    require("../../assets/outlet-images/designer-outlet-provence/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-provence/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-provence/gallery2.webp"),
    require("../../assets/outlet-images/designer-outlet-provence/gallery3.webp"),
  ],
  "designer-outlet-troyes": [
    require("../../assets/outlet-images/designer-outlet-troyes/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-troyes/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-troyes/gallery2.webp"),
    require("../../assets/outlet-images/designer-outlet-troyes/gallery3.webp"),
  ],
  "la-vallee-village": [
    require("../../assets/outlet-images/la-vallee-village/hero.webp"),
    require("../../assets/outlet-images/la-vallee-village/gallery1.webp"),
    require("../../assets/outlet-images/la-vallee-village/gallery2.webp"),
    require("../../assets/outlet-images/la-vallee-village/gallery3.webp"),
  ],
  "roppenheim-the-style-outlets": [
    require("../../assets/outlet-images/roppenheim-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/roppenheim-the-style-outlets/gallery1.webp"),
    require("../../assets/outlet-images/roppenheim-the-style-outlets/gallery2.webp"),
  ],
  "paris-giverny-designer-outlet": [
    require("../../assets/outlet-images/paris-giverny-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/paris-giverny-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/paris-giverny-designer-outlet/gallery2.webp"),
    require("../../assets/outlet-images/paris-giverny-designer-outlet/gallery3.webp"),
  ],
  "one-nation-paris": [
    require("../../assets/outlet-images/one-nation-paris/hero.webp"),
    require("../../assets/outlet-images/one-nation-paris/gallery1.webp"),
    require("../../assets/outlet-images/one-nation-paris/gallery2.webp"),
    require("../../assets/outlet-images/one-nation-paris/gallery3.webp"),
  ],
  "the-village-outlet": [
    require("../../assets/outlet-images/the-village-outlet/hero.webp"),
    require("../../assets/outlet-images/the-village-outlet/gallery1.webp"),
    require("../../assets/outlet-images/the-village-outlet/gallery2.webp"),
    require("../../assets/outlet-images/the-village-outlet/gallery3.webp"),
  ],
  "roubaix-designer-outlet": [
    require("../../assets/outlet-images/roubaix-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/roubaix-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/roubaix-designer-outlet/gallery2.webp"),
  ],
  "bicester-village": [
    require("../../assets/outlet-images/bicester-village/hero.webp"),
    require("../../assets/outlet-images/bicester-village/gallery1.webp"),
    require("../../assets/outlet-images/bicester-village/gallery2.webp"),
    require("../../assets/outlet-images/bicester-village/gallery3.webp"),
  ],
  "cheshire-oaks": [
    require("../../assets/outlet-images/cheshire-oaks/hero.webp"),
    require("../../assets/outlet-images/cheshire-oaks/gallery1.webp"),
    require("../../assets/outlet-images/cheshire-oaks/gallery2.webp"),
    require("../../assets/outlet-images/cheshire-oaks/gallery3.webp"),
  ],
  "ashford-designer-outlet": [
    require("../../assets/outlet-images/ashford-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/ashford-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/ashford-designer-outlet/gallery2.webp"),
    require("../../assets/outlet-images/ashford-designer-outlet/gallery3.webp"),
  ],
  "bridgend-designer-outlet": [
    require("../../assets/outlet-images/bridgend-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/bridgend-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/bridgend-designer-outlet/gallery2.webp"),
    require("../../assets/outlet-images/bridgend-designer-outlet/gallery3.webp"),
  ],
  "caledonia-park": [
    require("../../assets/outlet-images/caledonia-park/hero.webp"),
    require("../../assets/outlet-images/caledonia-park/gallery1.webp"),
    require("../../assets/outlet-images/caledonia-park/gallery2.webp"),
    require("../../assets/outlet-images/caledonia-park/gallery3.webp"),
  ],
  "clarks-village": [
    require("../../assets/outlet-images/clarks-village/hero.webp"),
    require("../../assets/outlet-images/clarks-village/gallery1.webp"),
    require("../../assets/outlet-images/clarks-village/gallery2.webp"),
    require("../../assets/outlet-images/clarks-village/gallery3.webp"),
  ],
  "dalton-park": [
    require("../../assets/outlet-images/dalton-park/hero.webp"),
    require("../../assets/outlet-images/dalton-park/gallery1.webp"),
    require("../../assets/outlet-images/dalton-park/gallery2.webp"),
  ],
  "east-midlands-designer-outlet": [
    require("../../assets/outlet-images/east-midlands-designer-outlet/hero.webp"),
  ],
  "fleetwood-outlet": [
    require("../../assets/outlet-images/fleetwood-outlet/hero.webp"),
    require("../../assets/outlet-images/fleetwood-outlet/gallery1.webp"),
    require("../../assets/outlet-images/fleetwood-outlet/gallery2.webp"),
  ],
  "gloucester-quays": [
    require("../../assets/outlet-images/gloucester-quays/hero.webp"),
    require("../../assets/outlet-images/gloucester-quays/gallery1.webp"),
    require("../../assets/outlet-images/gloucester-quays/gallery2.webp"),
    require("../../assets/outlet-images/gloucester-quays/gallery3.webp"),
  ],
  "gunwharf-quays": [
    require("../../assets/outlet-images/gunwharf-quays/hero.webp"),
    require("../../assets/outlet-images/gunwharf-quays/gallery1.webp"),
    require("../../assets/outlet-images/gunwharf-quays/gallery2.webp"),
    require("../../assets/outlet-images/gunwharf-quays/gallery3.webp"),
  ],
  "icon-outlet-at-the-o2": [
    require("../../assets/outlet-images/icon-outlet-at-the-o2/hero.webp"),
    require("../../assets/outlet-images/icon-outlet-at-the-o2/gallery1.webp"),
  ],
  "junction-32-outlet": [
    require("../../assets/outlet-images/junction-32-outlet/hero.webp"),
    require("../../assets/outlet-images/junction-32-outlet/gallery1.webp"),
    require("../../assets/outlet-images/junction-32-outlet/gallery2.webp"),
    require("../../assets/outlet-images/junction-32-outlet/gallery3.webp"),
  ],
  "lakeside-village": [
    require("../../assets/outlet-images/lakeside-village/hero.webp"),
    require("../../assets/outlet-images/lakeside-village/gallery1.webp"),
    require("../../assets/outlet-images/lakeside-village/gallery2.webp"),
  ],
  "livingston-designer-outlet": [
    require("../../assets/outlet-images/livingston-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/livingston-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/livingston-designer-outlet/gallery2.webp"),
    require("../../assets/outlet-images/livingston-designer-outlet/gallery3.webp"),
  ],
  "london-designer-outlet": [
    require("../../assets/outlet-images/london-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/london-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/london-designer-outlet/gallery2.webp"),
  ],
  "springfields-outlet": [
    require("../../assets/outlet-images/springfields-outlet/hero.webp"),
    require("../../assets/outlet-images/springfields-outlet/gallery1.webp"),
    require("../../assets/outlet-images/springfields-outlet/gallery2.webp"),
  ],
  "swindon-designer-outlet": [
    require("../../assets/outlet-images/swindon-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/swindon-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/swindon-designer-outlet/gallery2.webp"),
    require("../../assets/outlet-images/swindon-designer-outlet/gallery3.webp"),
  ],
  "the-boulevard-banbridge": [
    require("../../assets/outlet-images/the-boulevard-banbridge/hero.webp"),
    require("../../assets/outlet-images/the-boulevard-banbridge/gallery1.webp"),
    require("../../assets/outlet-images/the-boulevard-banbridge/gallery2.webp"),
    require("../../assets/outlet-images/the-boulevard-banbridge/gallery3.webp"),
  ],
  "the-galleria-outlet": [
    require("../../assets/outlet-images/the-galleria-outlet/hero.webp"),
    require("../../assets/outlet-images/the-galleria-outlet/gallery1.webp"),
    require("../../assets/outlet-images/the-galleria-outlet/gallery2.webp"),
  ],
  "west-midlands-designer-outlet": [
    require("../../assets/outlet-images/west-midlands-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/west-midlands-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/west-midlands-designer-outlet/gallery2.webp"),
  ],
  "york-designer-outlet": [
    require("../../assets/outlet-images/york-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/york-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/york-designer-outlet/gallery2.webp"),
    require("../../assets/outlet-images/york-designer-outlet/gallery3.webp"),
  ],
  "braintree-village": [
    require("../../assets/outlet-images/braintree-village/hero.webp"),
    require("../../assets/outlet-images/braintree-village/gallery1.webp"),
    require("../../assets/outlet-images/braintree-village/gallery2.webp"),
    require("../../assets/outlet-images/braintree-village/gallery3.webp"),
  ],
  "affinity-sterling-mills": [
    require("../../assets/outlet-images/affinity-sterling-mills/hero.webp"),
    require("../../assets/outlet-images/affinity-sterling-mills/gallery1.webp"),
    require("../../assets/outlet-images/affinity-sterling-mills/gallery2.webp"),
  ],
  "las-rozas-village": [
    require("../../assets/outlet-images/las-rozas-village/hero.webp"),
    require("../../assets/outlet-images/las-rozas-village/gallery1.webp"),
    require("../../assets/outlet-images/las-rozas-village/gallery2.webp"),
    require("../../assets/outlet-images/las-rozas-village/gallery3.webp"),
  ],
  "designer-outlet-malaga": [
    require("../../assets/outlet-images/designer-outlet-malaga/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-malaga/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-malaga/gallery2.webp"),
  ],
  "viladecans-the-style-outlets": [
    require("../../assets/outlet-images/viladecans-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/viladecans-the-style-outlets/gallery1.webp"),
    require("../../assets/outlet-images/viladecans-the-style-outlets/gallery2.webp"),
    require("../../assets/outlet-images/viladecans-the-style-outlets/gallery3.webp"),
  ],
  "la-roca-village": [
    require("../../assets/outlet-images/la-roca-village/hero.webp"),
    require("../../assets/outlet-images/la-roca-village/gallery1.webp"),
    require("../../assets/outlet-images/la-roca-village/gallery2.webp"),
  ],
  "mallorca-fashion-outlet": [
    require("../../assets/outlet-images/mallorca-fashion-outlet/hero.webp"),
    require("../../assets/outlet-images/mallorca-fashion-outlet/gallery1.webp"),
    require("../../assets/outlet-images/mallorca-fashion-outlet/gallery2.webp"),
    require("../../assets/outlet-images/mallorca-fashion-outlet/gallery3.webp"),
  ],
  "sevilla-fashion-outlet": [
    require("../../assets/outlet-images/sevilla-fashion-outlet/hero.webp"),
    require("../../assets/outlet-images/sevilla-fashion-outlet/gallery1.webp"),
    require("../../assets/outlet-images/sevilla-fashion-outlet/gallery2.webp"),
  ],
  "getafe-the-style-outlets": [
    require("../../assets/outlet-images/getafe-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/getafe-the-style-outlets/gallery1.webp"),
    require("../../assets/outlet-images/getafe-the-style-outlets/gallery2.webp"),
  ],
  "san-sebastian-de-los-reyes-the-style-outlets": [
    require("../../assets/outlet-images/san-sebastian-de-los-reyes-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/san-sebastian-de-los-reyes-the-style-outlets/gallery1.webp"),
    require("../../assets/outlet-images/san-sebastian-de-los-reyes-the-style-outlets/gallery2.webp"),
  ],
  "coruna-the-style-outlets": [
    require("../../assets/outlet-images/coruna-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/coruna-the-style-outlets/gallery1.webp"),
    require("../../assets/outlet-images/coruna-the-style-outlets/gallery2.webp"),
  ],
  "sambil-madrid": [
    require("../../assets/outlet-images/sambil-madrid/hero.webp"),
    require("../../assets/outlet-images/sambil-madrid/gallery1.webp"),
    require("../../assets/outlet-images/sambil-madrid/gallery2.webp"),
  ],
  "designer-outlet-roermond": [
    require("../../assets/outlet-images/designer-outlet-roermond/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-roermond/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-roermond/gallery2.webp"),
    require("../../assets/outlet-images/designer-outlet-roermond/gallery3.webp"),
  ],
  "designer-outlet-roosendaal": [
    require("../../assets/outlet-images/designer-outlet-roosendaal/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-roosendaal/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-roosendaal/gallery2.webp"),
  ],
  "amsterdam-the-style-outlets": [
    require("../../assets/outlet-images/amsterdam-the-style-outlets/hero.webp"),
    require("../../assets/outlet-images/amsterdam-the-style-outlets/gallery1.webp"),
    require("../../assets/outlet-images/amsterdam-the-style-outlets/gallery2.webp"),
    require("../../assets/outlet-images/amsterdam-the-style-outlets/gallery3.webp"),
  ],
  "batavia-stad-fashion-outlet": [
    require("../../assets/outlet-images/batavia-stad-fashion-outlet/hero.webp"),
    require("../../assets/outlet-images/batavia-stad-fashion-outlet/gallery1.webp"),
    require("../../assets/outlet-images/batavia-stad-fashion-outlet/gallery2.webp"),
    require("../../assets/outlet-images/batavia-stad-fashion-outlet/gallery3.webp"),
  ],
  "factory-ursus": [
    require("../../assets/outlet-images/factory-ursus/hero.webp"),
    require("../../assets/outlet-images/factory-ursus/gallery1.webp"),
    require("../../assets/outlet-images/factory-ursus/gallery2.webp"),
  ],
  "factory-annopol": [
    require("../../assets/outlet-images/factory-annopol/hero.webp"),
    require("../../assets/outlet-images/factory-annopol/gallery1.webp"),
    require("../../assets/outlet-images/factory-annopol/gallery2.webp"),
  ],
  "wroclaw-fashion-outlet": [
    require("../../assets/outlet-images/wroclaw-fashion-outlet/hero.webp"),
    require("../../assets/outlet-images/wroclaw-fashion-outlet/gallery1.webp"),
    require("../../assets/outlet-images/wroclaw-fashion-outlet/gallery2.webp"),
  ],
  "designer-outlet-gdansk": [
    require("../../assets/outlet-images/designer-outlet-gdansk/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-gdansk/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-gdansk/gallery2.webp"),
  ],
  "designer-outlet-sosnowiec": [
    require("../../assets/outlet-images/designer-outlet-sosnowiec/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-sosnowiec/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-sosnowiec/gallery2.webp"),
    require("../../assets/outlet-images/designer-outlet-sosnowiec/gallery3.webp"),
  ],
  "designer-outlet-warszawa": [
    require("../../assets/outlet-images/designer-outlet-warszawa/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-warszawa/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-warszawa/gallery2.webp"),
  ],
  "freeport-lisboa-fashion-outlet": [
    require("../../assets/outlet-images/freeport-lisboa-fashion-outlet/hero.webp"),
    require("../../assets/outlet-images/freeport-lisboa-fashion-outlet/gallery1.webp"),
    require("../../assets/outlet-images/freeport-lisboa-fashion-outlet/gallery2.webp"),
    require("../../assets/outlet-images/freeport-lisboa-fashion-outlet/gallery3.webp"),
  ],
  "vila-do-conde-porto-fashion-outlet": [
    require("../../assets/outlet-images/vila-do-conde-porto-fashion-outlet/hero.webp"),
    require("../../assets/outlet-images/vila-do-conde-porto-fashion-outlet/gallery1.webp"),
  ],
  "fashion-house-outlet-centre-bucharest": [
    require("../../assets/outlet-images/fashion-house-outlet-centre-bucharest/hero.webp"),
    require("../../assets/outlet-images/fashion-house-outlet-centre-bucharest/gallery1.webp"),
    require("../../assets/outlet-images/fashion-house-outlet-centre-bucharest/gallery2.webp"),
    require("../../assets/outlet-images/fashion-house-outlet-centre-bucharest/gallery3.webp"),
  ],
  "fashion-house-outlet-centre-pallady": [
    require("../../assets/outlet-images/fashion-house-outlet-centre-pallady/hero.webp"),
    require("../../assets/outlet-images/fashion-house-outlet-centre-pallady/gallery1.webp"),
    require("../../assets/outlet-images/fashion-house-outlet-centre-pallady/gallery2.webp"),
  ],
  "ringsted-outlet": [
    require("../../assets/outlet-images/ringsted-outlet/hero.webp"),
    require("../../assets/outlet-images/ringsted-outlet/gallery1.webp"),
    require("../../assets/outlet-images/ringsted-outlet/gallery2.webp"),
    require("../../assets/outlet-images/ringsted-outlet/gallery3.webp"),
  ],
  "t1-tallinn-outlet": [
    require("../../assets/outlet-images/t1-tallinn-outlet/hero.webp"),
    require("../../assets/outlet-images/t1-tallinn-outlet/gallery1.webp"),
    require("../../assets/outlet-images/t1-tallinn-outlet/gallery2.webp"),
    require("../../assets/outlet-images/t1-tallinn-outlet/gallery3.webp"),
  ],
  "maasmechelen-village": [
    require("../../assets/outlet-images/maasmechelen-village/hero.webp"),
    require("../../assets/outlet-images/maasmechelen-village/gallery1.webp"),
    require("../../assets/outlet-images/maasmechelen-village/gallery2.webp"),
    require("../../assets/outlet-images/maasmechelen-village/gallery3.webp"),
  ],
  "designer-outlet-luxembourg": [
    require("../../assets/outlet-images/designer-outlet-luxembourg/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-luxembourg/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-luxembourg/gallery2.webp"),
  ],
  "ros-designer-outlet": [
    require("../../assets/outlet-images/ros-designer-outlet/hero.webp"),
    require("../../assets/outlet-images/ros-designer-outlet/gallery1.webp"),
    require("../../assets/outlet-images/ros-designer-outlet/gallery2.webp"),
    require("../../assets/outlet-images/ros-designer-outlet/gallery3.webp"),
  ],
  "premier-outlet-budapest": [
    require("../../assets/outlet-images/premier-outlet-budapest/hero.webp"),
    require("../../assets/outlet-images/premier-outlet-budapest/gallery1.webp"),
    require("../../assets/outlet-images/premier-outlet-budapest/gallery2.webp"),
    require("../../assets/outlet-images/premier-outlet-budapest/gallery3.webp"),
  ],
  "designer-outlet-athens": [
    require("../../assets/outlet-images/designer-outlet-athens/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-athens/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-athens/gallery2.webp"),
    require("../../assets/outlet-images/designer-outlet-athens/gallery3.webp"),
  ],
  "kildare-village": [
    require("../../assets/outlet-images/kildare-village/hero.webp"),
    require("../../assets/outlet-images/kildare-village/gallery1.webp"),
    require("../../assets/outlet-images/kildare-village/gallery2.webp"),
    require("../../assets/outlet-images/kildare-village/gallery3.webp"),
  ],
  "via-jurmala-outlet-village": [
    require("../../assets/outlet-images/via-jurmala-outlet-village/hero.webp"),
    require("../../assets/outlet-images/via-jurmala-outlet-village/gallery1.webp"),
    require("../../assets/outlet-images/via-jurmala-outlet-village/gallery2.webp"),
    require("../../assets/outlet-images/via-jurmala-outlet-village/gallery3.webp"),
  ],
  "outlet-park-vilnius": [
    require("../../assets/outlet-images/outlet-park-vilnius/hero.webp"),
    require("../../assets/outlet-images/outlet-park-vilnius/gallery1.webp"),
    require("../../assets/outlet-images/outlet-park-vilnius/gallery2.webp"),
    require("../../assets/outlet-images/outlet-park-vilnius/gallery3.webp"),
  ],
  "norwegian-outlet": [
    require("../../assets/outlet-images/norwegian-outlet/hero.webp"),
    require("../../assets/outlet-images/norwegian-outlet/gallery1.webp"),
    require("../../assets/outlet-images/norwegian-outlet/gallery2.webp"),
  ],
  "ideapark-lempaala-outlet": [
    require("../../assets/outlet-images/ideapark-lempaala-outlet/hero.webp"),
    require("../../assets/outlet-images/ideapark-lempaala-outlet/gallery1.webp"),
    require("../../assets/outlet-images/ideapark-lempaala-outlet/gallery2.webp"),
    require("../../assets/outlet-images/ideapark-lempaala-outlet/gallery3.webp"),
  ],
  "fashion-arena-prague-outlet": [
    require("../../assets/outlet-images/fashion-arena-prague-outlet/hero.webp"),
    require("../../assets/outlet-images/fashion-arena-prague-outlet/gallery1.webp"),
    require("../../assets/outlet-images/fashion-arena-prague-outlet/gallery2.webp"),
  ],
  "designer-outlet-parndorf": [
    require("../../assets/outlet-images/designer-outlet-parndorf/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-parndorf/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-parndorf/gallery2.webp"),
    require("../../assets/outlet-images/designer-outlet-parndorf/gallery3.webp"),
  ],
  "designer-outlet-salzburg": [
    require("../../assets/outlet-images/designer-outlet-salzburg/hero.webp"),
    require("../../assets/outlet-images/designer-outlet-salzburg/gallery1.webp"),
    require("../../assets/outlet-images/designer-outlet-salzburg/gallery2.webp"),
  ],
  "hede-fashion-outlet": [
    require("../../assets/outlet-images/hede-fashion-outlet/hero.webp"),
    require("../../assets/outlet-images/hede-fashion-outlet/gallery1.webp"),
    require("../../assets/outlet-images/hede-fashion-outlet/gallery2.webp"),
  ],
  "foxtown-factory-stores": [
    require("../../assets/outlet-images/foxtown-factory-stores/hero.webp"),
    require("../../assets/outlet-images/foxtown-factory-stores/gallery1.webp"),
  ],
  "landquart-fashion-outlet": [
    require("../../assets/outlet-images/landquart-fashion-outlet/hero.webp"),
    require("../../assets/outlet-images/landquart-fashion-outlet/gallery1.webp"),
    require("../../assets/outlet-images/landquart-fashion-outlet/gallery2.webp"),
    require("../../assets/outlet-images/landquart-fashion-outlet/gallery3.webp"),
  ],
  "fashion-fish-factory-outlet": [
    require("../../assets/outlet-images/fashion-fish-factory-outlet/hero.webp"),
    require("../../assets/outlet-images/fashion-fish-factory-outlet/gallery1.webp"),
    require("../../assets/outlet-images/fashion-fish-factory-outlet/gallery2.webp"),
  ],
};

const productionClearedSourceStatuses = new Set<OutletMediaSourceStatus>([
  "project-owned",
  "licensed",
  "public-domain",
  "permission-granted",
  "official-operator",
]);

function getResolverMode(
  options: OutletMediaResolverOptions | undefined,
): OutletMediaResolverMode {
  return options?.mode ?? "inventory";
}

function isProductionMode(
  options: OutletMediaResolverOptions | undefined,
): boolean {
  return getResolverMode(options) === "production";
}

export function isMediaAssetProductionCleared(
  metadata: OutletMediaAssetMetadata | undefined,
): metadata is OutletMediaAssetMetadata {
  return metadata
    ? productionClearedSourceStatuses.has(metadata.sourceStatus)
    : false;
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPublicMediaCreditMetadata(
  metadata: OutletMediaAssetMetadata | undefined,
): metadata is PublicMediaCreditMetadata {
  return (
    isMediaAssetProductionCleared(metadata) &&
    metadata.sourceStatus !== "project-owned" &&
    metadata.sourceStatus !== "official-operator" &&
    hasText(metadata.credit) &&
    hasText(metadata.license) &&
    hasText(metadata.sourceUrl) &&
    hasText(metadata.licenseUrl)
  );
}

function getOutletDisplayName(outletId: string): string {
  return outlets.find((outlet) => outlet.outletId === outletId)?.name ?? outletId;
}

function getOutletLocalImageEntries(outletId?: string): OutletLocalImageEntry[] {
  if (!outletId) return [];

  const metadataForOutlet = outletMediaMetadata.filter(
    (metadata) => metadata.outletId === outletId,
  );

  return (outletLocalImages[outletId] ?? []).map((image, index) => ({
    image,
    assetPath: metadataForOutlet[index]?.assetPath ?? outletId + ":" + index,
    metadata: metadataForOutlet[index],
  }));
}

function compareOfficialOverlayFirst(
  a: OutletLocalImageEntry,
  b: OutletLocalImageEntry,
): number {
  const aIsOfficial = a.metadata?.sourceStatus === "official-operator";
  const bIsOfficial = b.metadata?.sourceStatus === "official-operator";

  if (aIsOfficial === bIsOfficial) return 0;
  return aIsOfficial ? -1 : 1;
}

function getSortedOutletLocalImageEntries(outletId?: string): OutletLocalImageEntry[] {
  return [...getOutletLocalImageEntries(outletId)].sort(compareOfficialOverlayFirst);
}

function getProductionSafeLocalImages(outletId?: string): OutletMediaImage[] {
  return getSortedOutletLocalImageEntries(outletId)
    .filter((entry) => isMediaAssetProductionCleared(entry.metadata))
    .map((entry) => entry.image);
}

export function getProductionMediaCredits(): OutletMediaCredit[] {
  return outletMediaMetadata.flatMap((metadata): OutletMediaCredit[] => {
    if (!isPublicMediaCreditMetadata(metadata)) return [];

    return [{ ...metadata, displayName: getOutletDisplayName(metadata.outletId) }];
  });
}

export function getOutletMediaCredits(): OutletMediaCredit[] {
  return getProductionMediaCredits();
}

export function getMediaCreditsForOutlet(outletId: string): OutletMediaCredit[] {
  return getProductionMediaCredits().filter((credit) => credit.outletId === outletId);
}

export function countLocalMediaAssets(): number {
  return outletMediaMetadata.length;
}

export function countInventoryResolvedLocalImages(): number {
  return Object.values(outletLocalImages).reduce((count, images) => count + images.length, 0);
}

export function countProductionResolvedLocalImages(): number {
  return Object.keys(outletLocalImages).reduce(
    (count, outletId) => count + getProductionSafeLocalImages(outletId).length,
    0,
  );
}

export function countProductionClearedLocalImages(): number {
  return outletMediaMetadata.filter(isMediaAssetProductionCleared).length;
}

export function countUnknownLocalImages(): number {
  return outletMediaMetadata.filter((metadata) => metadata.sourceStatus === "unknown").length;
}

export function getProductionSafeResolvedUnknownLocalAssetCount(): number {
  return Object.keys(outletLocalImages).reduce((count, outletId) => {
    return (
      count +
      getOutletLocalImageEntries(outletId).filter(
        (entry) =>
          entry.metadata?.sourceStatus === "unknown" &&
          getProductionSafeLocalImages(outletId).includes(entry.image),
      ).length
    );
  }, 0);
}

export function getOutletLocalImages(
  outletId?: string,
  options?: OutletMediaResolverOptions,
): OutletMediaImage[] {
  if (isProductionMode(options)) return getProductionSafeLocalImages(outletId);
  return getSortedOutletLocalImageEntries(outletId).map((entry) => entry.image);
}

export function getOutletMediaImages(
  outlet: OutletMediaOutlet,
  options?: OutletMediaResolverOptions,
): OutletMediaImage[] {
  const localImages = getOutletLocalImages(outlet.outletId, options);
  if (localImages.length > 0) return localImages;

  const dataImages = [outlet.heroImage, ...(outlet.galleryImages ?? [])].filter(
    Boolean,
  ) as OutletMediaImage[];
  if (dataImages.length > 0) return dataImages;

  return isProductionMode(options) ? [] : outletMediaFallbackImages;
}

export function getOutletCardHeroImage(
  outlet: OutletMediaOutlet,
  options?: OutletMediaResolverOptions,
): OutletMediaImage | undefined {
  const localImages = getOutletLocalImages(outlet.outletId, options);
  if (localImages.length > 0) return localImages[0];

  return [outlet.heroImage, ...(outlet.galleryImages ?? [])].find(Boolean) as
    | OutletMediaImage
    | undefined;
}

export function getOutletHeroImage(
  outlet: OutletMediaOutlet,
  options?: OutletMediaResolverOptions,
): OutletMediaImage | undefined {
  return getOutletMediaImages(outlet, options)[0];
}

export function getImageSource(image: OutletMediaImage): ImageSourcePropType {
  return typeof image === "string" ? { uri: image } : image;
}

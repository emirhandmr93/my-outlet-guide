export type Outlet = {
id: string;
name: string;
city: string;
country: string;
stores: string;
taxFree: string;
distance: string;
hours: string;
airportDistance: string;
bestFor: string;
brands: string[];
restaurants: string[];
description: string;
};

export const outlets: Outlet[] = [
{
id: "la-vallee-village",
name: "La Vallée Village",
city: "Paris",
country: "France",
stores: "110+ Stores",
taxFree: "Tax Free",
distance: "Near Paris",
hours: "10:00 - 20:00",
airportDistance: "Around 40 km",
bestFor: "Luxury, fashion, premium brands",
brands: ["Gucci", "Prada", "Armani", "Burberry", "Coach", "Sandro", "Maje"],
restaurants: ["Cafes", "French restaurants", "Quick bites", "Dessert spots"],
description:
"La Vallée Village is one of the most popular luxury outlet destinations near Paris. It is ideal for travellers who want premium shopping, Tax Free opportunities and a stylish open-air village experience.",
},
{
id: "serravalle",
name: "Serravalle",
city: "Milan",
country: "Italy",
stores: "230+ Stores",
taxFree: "Tax Free",
distance: "Near Milan",
hours: "10:00 - 20:00",
airportDistance: "Around 95 km",
bestFor: "Large outlet shopping, luxury, fashion",
brands: ["Prada", "Gucci", "Versace", "Nike", "Adidas", "Moncler"],
restaurants: [
"Cafes",
"Italian restaurants",
"Quick service restaurants"
],
description:
"Serravalle is one of Europe’s largest designer outlets and a major shopping destination near Milan. It offers a wide brand mix, restaurants and a full-day outlet shopping experience.",
},

{
id: "fidenza-village",
name: "Fidenza Village",
city: "Milan",
country: "Italy",
stores: "120+ Stores",
taxFree: "Tax Free",
distance: "Near Milan",
hours: "10:00 - 20:00",
airportDistance: "Around 120 km",
bestFor: "Luxury and fashion shopping",
brands: ["Armani", "Coach", "Furla", "Michael Kors", "Guess"],
restaurants: ["Italian Cafes", "Restaurants"],
description:
"Fidenza Village is a luxury outlet destination in Northern Italy offering premium brands and a relaxed shopping environment.",
},

{
id: "noventa-di-piave",
name: "Noventa di Piave",
city: "Venice",
country: "Italy",
stores: "160+ Stores",
taxFree: "Tax Free",
distance: "Near Venice",
hours: "10:00 - 20:00",
airportDistance: "Around 30 km",
bestFor: "Luxury shopping and tourism",
brands: ["Prada", "Gucci", "Nike", "Adidas", "Armani"],
restaurants: ["Cafes", "Italian Restaurants"],
description:
"Noventa di Piave is one of Italy's most popular designer outlets and is frequently visited by travellers exploring Venice.",
},

{
id: "metzingen",
name: "Outletcity Metzingen",
city: "Stuttgart",
country: "Germany",
stores: "170+ Stores",
taxFree: "Tax Free",
distance: "Near Stuttgart",
hours: "10:00 - 20:00",
airportDistance: "Around 25 km",
bestFor: "Designer shopping",
brands: ["Hugo Boss", "Armani", "Coach", "Tommy Hilfiger"],
restaurants: ["Cafes", "Restaurants"],
description:
"Outletcity Metzingen is Germany's most famous outlet destination and home to the flagship Hugo Boss outlet.",
},

{
id: "ingolstadt-village",
name: "Ingolstadt Village",
city: "Munich",
country: "Germany",
stores: "110+ Stores",
taxFree: "Tax Free",
distance: "Near Munich",
hours: "10:00 - 20:00",
airportDistance: "Around 70 km",
bestFor: "Luxury shopping and day trips",
brands: ["Burberry", "Gucci", "Prada", "Coach"],
restaurants: ["Cafes", "Restaurants"],
description:
"Ingolstadt Village is one of Germany's premium outlet destinations located near Munich.",
},

{
id: "wertheim-village",
name: "Wertheim Village",
city: "Frankfurt",
country: "Germany",
stores: "110+ Stores",
taxFree: "Tax Free",
distance: "Near Frankfurt",
hours: "10:00 - 20:00",
airportDistance: "Around 90 km",
bestFor: "Luxury shopping and tourism",
brands: ["Gucci", "Prada", "Armani", "Coach"],
restaurants: ["Cafes", "Restaurants"],
description:
"Wertheim Village is a popular luxury outlet village serving visitors from Frankfurt and Southern Germany.",
},
];
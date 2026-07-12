export type Currency = {
currencyCode: string;
currencyName: string;
symbol: string;
currencyFlag: string;
};

export const currencies: Currency[] = [
{ currencyCode: "EUR", currencyName: "Euro", symbol: "€", currencyFlag: "🇪🇺" },
{ currencyCode: "USD", currencyName: "US Dollar", symbol: "$", currencyFlag: "🇺🇸" },
{ currencyCode: "TRY", currencyName: "Turkish Lira", symbol: "₺", currencyFlag: "🇹🇷" },
{ currencyCode: "GBP", currencyName: "British Pound", symbol: "£", currencyFlag: "🇬🇧" },
{ currencyCode: "CHF", currencyName: "Swiss Franc", symbol: "CHF", currencyFlag: "🇨🇭" },
{ currencyCode: "AED", currencyName: "UAE Dirham", symbol: "د.إ", currencyFlag: "🇦🇪" },
{ currencyCode: "JPY", currencyName: "Japanese Yen", symbol: "¥", currencyFlag: "🇯🇵" },
{ currencyCode: "PLN", currencyName: "Polish Złoty", symbol: "zł", currencyFlag: "🇵🇱" },
{ currencyCode: "DKK", currencyName: "Danish Krone", symbol: "kr", currencyFlag: "🇩🇰" },
{ currencyCode: "SEK", currencyName: "Swedish Krona", symbol: "kr", currencyFlag: "🇸🇪" },
{ currencyCode: "NOK", currencyName: "Norwegian Krone", symbol: "kr", currencyFlag: "🇳🇴" },
{ currencyCode: "CZK", currencyName: "Czech Koruna", symbol: "Kč", currencyFlag: "🇨🇿" },
{ currencyCode: "HUF", currencyName: "Hungarian Forint", symbol: "Ft", currencyFlag: "🇭🇺" },
{ currencyCode: "RON", currencyName: "Romanian Leu", symbol: "lei", currencyFlag: "🇷🇴" },
];

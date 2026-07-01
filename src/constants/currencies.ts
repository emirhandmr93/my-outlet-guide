export type Currency = {
currencyCode: string;
currencyName: string;
symbol: string;
currencyFlag: string;
};

export const currencies: Currency[] = [
{ currencyCode: "EUR", currencyName: "Euro", symbol: "€", currencyFlag: "🇪🇺" },
{ currencyCode: "TRY", currencyName: "Turkish Lira", symbol: "₺", currencyFlag: "🇹🇷" },
{ currencyCode: "USD", currencyName: "US Dollar", symbol: "$", currencyFlag: "🇺🇸" },
{ currencyCode: "GBP", currencyName: "British Pound", symbol: "£", currencyFlag: "🇬🇧" },
{ currencyCode: "CHF", currencyName: "Swiss Franc", symbol: "CHF", currencyFlag: "🇨🇭" },
{ currencyCode: "AED", currencyName: "UAE Dirham", symbol: "د.إ", currencyFlag: "🇦🇪" },
{ currencyCode: "KRW", currencyName: "South Korean Won", symbol: "₩", currencyFlag: "🇰🇷" },
{ currencyCode: "JPY", currencyName: "Japanese Yen", symbol: "¥", currencyFlag: "🇯🇵" },
{ currencyCode: "CNY", currencyName: "Chinese Yuan", symbol: "¥", currencyFlag: "🇨🇳" },
{ currencyCode: "RUB", currencyName: "Russian Ruble", symbol: "₽", currencyFlag: "🇷🇺" },
{ currencyCode: "THB", currencyName: "Thai Baht", symbol: "฿", currencyFlag: "🇹🇭" },
{ currencyCode: "SAR", currencyName: "Saudi Riyal", symbol: "﷼", currencyFlag: "🇸🇦" },
];
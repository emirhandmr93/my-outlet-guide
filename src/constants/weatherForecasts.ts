export type WeatherForecastDay = {
date: string;
icon: string;
temperature: number;
};

export type WeatherForecast = {
cityId: string;
cityName: string;
forecasts: WeatherForecastDay[];
};

export const weatherForecasts: WeatherForecast[] = [
{
cityId: "paris",
cityName: "Paris",
forecasts: [
{ date: "2026-06-20", icon: "☀️", temperature: 26 },
{ date: "2026-06-21", icon: "🌤️", temperature: 24 },
{ date: "2026-06-22", icon: "🌧️", temperature: 21 },
{ date: "2026-06-23", icon: "☀️", temperature: 25 },
{ date: "2026-06-24", icon: "🌤️", temperature: 23 },
],
},
{
cityId: "milan",
cityName: "Milan",
forecasts: [
{ date: "2026-06-20", icon: "☀️", temperature: 29 },
{ date: "2026-06-21", icon: "☀️", temperature: 30 },
{ date: "2026-06-22", icon: "🌤️", temperature: 27 },
{ date: "2026-06-23", icon: "☀️", temperature: 31 },
{ date: "2026-06-24", icon: "🌧️", temperature: 24 },
{ date: "2026-06-25", icon: "☀️", temperature: 28 },
{ date: "2026-06-26", icon: "🌤️", temperature: 27 },
],
},
{
cityId: "london",
cityName: "London",
forecasts: [
{ date: "2026-06-20", icon: "🌧️", temperature: 18 },
{ date: "2026-06-21", icon: "🌥️", temperature: 19 },
{ date: "2026-06-22", icon: "☀️", temperature: 22 },
{ date: "2026-06-23", icon: "🌤️", temperature: 21 },
{ date: "2026-06-24", icon: "🌧️", temperature: 17 },
],
},
];
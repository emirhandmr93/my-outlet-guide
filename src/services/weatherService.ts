export type CurrentWeather = {
  temperature: number;
  weatherCode: number;
  condition: string;
  conditionKey: string;
  icon: string;
};

function getWeatherCondition(weatherCode: number) {
  if (weatherCode === 0) {
    return { condition: "Clear", conditionKey: "weather.condition.clear", icon: "☀️" };
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return { condition: "Cloudy", conditionKey: "weather.condition.cloudy", icon: "⛅" };
  }

  if ([45, 48].includes(weatherCode)) {
    return { condition: "Foggy", conditionKey: "weather.condition.foggy", icon: "🌫️" };
  }

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    return { condition: "Rainy", conditionKey: "weather.condition.rainy", icon: "🌧️" };
  }

  if ([71, 73, 75, 85, 86].includes(weatherCode)) {
    return { condition: "Snowy", conditionKey: "weather.condition.snowy", icon: "❄️" };
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return { condition: "Stormy", conditionKey: "weather.condition.stormy", icon: "⛈️" };
  }

  return { condition: "Weather", conditionKey: "weather.condition.weather", icon: "🌤️" };
}

export async function getCurrentWeather(
  latitude: number,
  longitude: number
): Promise<CurrentWeather> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid coordinates for weather request.");
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
  );

  if (!response.ok) {
    throw new Error("Weather request failed.");
  }

  const data = await response.json();
  const temperature = Math.round(Number(data?.current?.temperature_2m));
  const weatherCode = Number(data?.current?.weather_code);

  if (!Number.isFinite(temperature) || !Number.isFinite(weatherCode)) {
    throw new Error("Weather response is incomplete.");
  }

  const weatherInfo = getWeatherCondition(weatherCode);

  return {
    temperature,
    weatherCode,
    condition: weatherInfo.condition,
    conditionKey: weatherInfo.conditionKey,
    icon: weatherInfo.icon,
  };
}

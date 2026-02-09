
interface CurrentWeather {
  temperature: number
  humidity: number
  feelsLike: number
  precipitation: number
  weatherCode: number
  windSpeed: number
}

interface HourlyWeather {
  time: Date
  temperature: number
  precipitationProbability: number
  weatherCode: number
}

interface DailyWeather {
  time: Date
  weatherCode: number
  temperatureMax: number
  temperatureMin: number
  precipitationSum: number
  precipitationProbability: number
}

export interface WeatherDataResponse {
  current: CurrentWeather | null
  hourly: HourlyWeather[]
  daily: DailyWeather[]
}
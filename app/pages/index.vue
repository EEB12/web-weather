<script setup lang="ts">
import { fetchWeatherApi } from "openmeteo";

const items = ref(['Backlog', 'Todo', 'In Progress', 'Done'])
const searchValue = ref('')

// Weather data
const weatherData = ref({
  current: null,
  hourly: [],
  daily: []
})

const fetchWeather = async (lat: number, lon: number) => {
  const params = {
    latitude: lat,
    longitude: lon,
    current: ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "precipitation", "weather_code", "wind_speed_10m"],
    hourly: ["temperature_2m", "precipitation_probability", "weather_code"],
    daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_sum", "precipitation_probability_max"],
    timezone: "auto"
  }
  
  const url = "https://api.open-meteo.com/v1/forecast"
  const responses = await fetchWeatherApi(url, params)
  const response = responses[0]
  
  const utcOffsetSeconds = response.utcOffsetSeconds()
  
  // Current weather
  const current = response.current()!
  weatherData.value.current = {
    temperature: current.variables(0)!.value(),
    humidity: current.variables(1)!.value(),
    feelsLike: current.variables(2)!.value(),
    precipitation: current.variables(3)!.value(),
    weatherCode: current.variables(4)!.value(),
    windSpeed: current.variables(5)!.value(),
  }
  
  const hourly = response.hourly()!
  const hourlyTime = Array.from(
    { length: 24 },
    (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
  )
  const hourlyTemp = hourly.variables(0)!.valuesArray()
  const hourlyPrecipProb = hourly.variables(1)!.valuesArray()
  const hourlyWeatherCode = hourly.variables(2)!.valuesArray()
  
  weatherData.value.hourly = hourlyTime.map((time, i) => ({
    time,
    temperature: hourlyTemp[i],
    precipitationProbability: hourlyPrecipProb[i],
    weatherCode: hourlyWeatherCode[i]
  }))
  
 
  const daily = response?.daily()!
  const dailyTime = Array.from(
    { length: 10 },
    (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
  )
  const dailyWeatherCode = daily.variables(0)!.valuesArray()
  const dailyTempMax = daily.variables(1)!.valuesArray()
  const dailyTempMin = daily.variables(2)!.valuesArray()
  const dailyPrecipSum = daily.variables(3)!.valuesArray()
  const dailyPrecipProb = daily.variables(4)!.valuesArray()
  
  weatherData.value.daily = dailyTime.map((time, i) => ({
    time,
    weatherCode: dailyWeatherCode[i],
    temperatureMax: dailyTempMax[i],
    temperatureMin: dailyTempMin[i],
    precipitationSum: dailyPrecipSum[i],
    precipitationProbability: dailyPrecipProb[i]
  }))
  
  console.log('Current:', weatherData.value.current)
  console.log('Hourly (24h):', weatherData.value.hourly)
  console.log('Daily (10 days):', weatherData.value.daily)
}

// Fetch weather for default location (Hanoi)
await fetchWeather(21.0283334, 105.8540410)

const searchLocation = async (query: string) => {
  const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
  
  if (!response.ok) {
    console.error('Geocode error:', response.status)
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}

// Test on client side
onMounted(async () => {
  try {
    const results = await searchLocation("curepipe")
    console.log('Search results:', results)
  } catch (error) {
    console.error('Search failed:', error)
  }
})
watch(()=>searchValue,()=>{

})
</script>

<template>
  <div class="h-screen relative bg-cover bg-center bg-no-repeat bg-[url(/rain.jpg)] " >
    <!-- Semi-transparent black overlay -->
    <div class="absolute inset-0 bg-black/70 z-0"></div>
    
    <!-- Content layer -->
    <div class="relative z-10 w-full h-full flex flex-row gap-4 p-4">
      <div class="w-3/4 flex flex-col">
         <UInputMenu 
           class="w-full !rounded-3xl mb-5 " 
           v-model="searchValue" 
           :items="items" 
           variant="subtle" 
           trailing-icon="i-lucide-search"
           :ui="{ base: ' bg-gray-500 rounded-3xl focus:!ring-gray-500' }"
         />
        <div class="w-full flex flex-col h-full bg-white/20 backdrop-blur-md rounded-2xl px-3 pt-4 items-center">
          <div class="flex flex-col my-16 gap-2 items-center text-center">
              <span class="text-white text-5xl">
                28 C
              </span>
              <span class="text-white text-4xl">
                Rainy Day
              </span>
          </div>
          <div class="grid grid-cols-2">

          </div>
        


        </div>
      </div>

      <div class="w-full flex flex-col gap-5">
        <div class="h-1/3 bg-white/20 backdrop-blur-md rounded-2xl px-3  text-white">Selected: {{ value || 'None' }}</div>
        <div class="h-1/3 bg-white/20 backdrop-blur-md rounded-2xl px-3  text-white">Selected: {{ value || 'None' }}</div>
        <div class="h-1/3 bg-white/20 backdrop-blur-md rounded-2xl px-3  text-white">Selected: {{ value || 'None' }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import { fetchWeatherApi } from "openmeteo";
import type { WeatherDataResponse } from "~/stores/weather";
interface LocationResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  label: string
  address?: {
    city?: string
    town?: string
    village?: string
    country?: string
    country_code?: string
  }
}

const items = ref<LocationResult[]>([])
const searchValue = ref<LocationResult >()
const searchQuery = ref('')

// Weather data
const weatherData = ref<WeatherDataResponse>({
  current: null,
  hourly: [],
  daily: []
})

const fetchWeather = async (lat: string, lon: string) => {
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

  const utcOffsetSeconds = response?.utcOffsetSeconds()
  
  // Current weather
  const current = response?.current()!
  weatherData.value.current = {
    temperature: current.variables(0)!.value(),
    humidity: current.variables(1)!.value(),
    feelsLike: current.variables(2)!.value(),
    precipitation: current.variables(3)!.value(),
    weatherCode: current.variables(4)!.value(),
    windSpeed: current.variables(5)!.value(),
  }
  
  const hourly = response?.hourly()!
  const hourlyTime = Array.from(
    { length: 24 },
    (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds!) * 1000)
  )
  const hourlyTemp = hourly.variables(0)!.valuesArray()
  const hourlyPrecipProb = hourly.variables(1)!.valuesArray()
  const hourlyWeatherCode = hourly.variables(2)!.valuesArray()
  
  weatherData.value.hourly = hourlyTime.map((time, i) => ({
    time,
    temperature: hourlyTemp?.[i] ?? 0,
    precipitationProbability: hourlyPrecipProb?.[i] ?? 0,
    weatherCode: hourlyWeatherCode?.[i] ?? 0
  }))
  
 
  const daily = response?.daily()!
  const dailyTime = Array.from(
    { length: 10 },
    (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds!) * 1000)
  )
  const dailyWeatherCode = daily.variables(0)!.valuesArray()
  const dailyTempMax = daily.variables(1)!.valuesArray()
  const dailyTempMin = daily.variables(2)!.valuesArray()
  const dailyPrecipSum = daily.variables(3)!.valuesArray()
  const dailyPrecipProb = daily.variables(4)!.valuesArray()
  
  
  weatherData.value.daily = dailyTime.map((time, i) => ({
    time,
    weatherCode: dailyWeatherCode?.[i] ?? 0,
    temperatureMax: dailyTempMax?.[i] ?? 0,
    temperatureMin: dailyTempMin?.[i] ?? 0,
    precipitationSum: dailyPrecipSum?.[i] ?? 0,
    precipitationProbability: dailyPrecipProb?.[i] ?? 0
  }))
  

  
}


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
    await fetchWeather('-20.3150516', '57.5211497')
  } catch (error) {
    console.error('Search failed:', error)
  }
})
const isLoadingSearch=ref(false)

const handleSearch =async (val:LocationResult)=>{
 await fetchWeather(val.lat, val.lon)
 console.log(weatherData.value)
}

watchDebounced(()=>searchQuery.value,async()=>{
  if(searchQuery.value=='')return
  try{
    isLoadingSearch.value=true
   const results = await searchLocation(searchQuery.value)
    items.value = results.map((r: any) => ({
      ...r,
      label: r.address?.city || r.address?.town || r.address?.village || r.display_name
    }))
    isLoadingSearch.value=false
  }catch(e){
    console.error(e)
  }
  
} ,{ debounce: 500, maxWait: 2500 })
</script>

<template>
  <div class="h-screen relative bg-cover bg-center bg-no-repeat bg-[url(/rain.jpg)] " >
    <div class="absolute inset-0 bg-black/70 z-0"></div>
    
    <div class="relative z-10 w-full h-full flex flex-row gap-4 p-4">
      <div class="w-3/4 flex flex-col">
         <UInputMenu 
           class="w-full !rounded-3xl mb-5 text-white" 
           v-model="searchValue"
           v-model:search-term="searchQuery"
           :items="items"
           :loading="isLoadingSearch"
           label-key="label"
           variant="subtle" 
           trailing-icon="i-lucide-search"
           @update:model-value="handleSearch"
           :ignore-filter="true"
           :reset-search-term-on-select="false"
           :ui="{ base: ' bg-gray-500 rounded-3xl focus:!ring-gray-500 text-white ' }"
         />
        <div class="w-full flex flex-col h-full bg-white/20 backdrop-blur-md rounded-2xl px-3 pt-4 items-center">
          <div class="flex flex-col my-16 gap-2 items-center text-center">
              <span class="text-white text-5xl">
                {{weatherData.current?.temperature.toFixed(1)}} C
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
        <div class="h-1/3 bg-white/20 backdrop-blur-md rounded-2xl px-3  text-white">Selected: {{ searchValue || 'None' }}</div>

      </div>
    </div>
  </div>
</template>
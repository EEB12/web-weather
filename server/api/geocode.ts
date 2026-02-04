export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchQuery = query.q as string

  if (!searchQuery) {
    throw createError({
      statusCode: 400,
      message: 'Query parameter "q" is required'
    })
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}` +
      `&format=json` +
      `&limit=5` +
      `&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'WeatherApp/1.0'
        }
      }
    )

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `Nominatim API error: ${response.statusText}`
      })
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch location data'
    })
  }
})

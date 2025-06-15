export const apiConfig = {
  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY || '',
    baseURL: 'https://api.openweathermap.org/data/2.5',
  },
  pokemon: {
    baseURL: 'https://pokeapi.co/api/v2',
  },
} as const;

export function validateApiConfig() {
  if (!apiConfig.openWeather.apiKey) {
    throw new Error('OPENWEATHER_API_KEY is required in environment variables');
  }
} 
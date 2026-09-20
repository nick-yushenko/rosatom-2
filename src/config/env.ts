import 'dotenv/config'

function readNumber(name: string, defaultValue: number) {
	const value = process.env[name]

	if (!value) {
		return defaultValue
	}

	const parsedValue = Number(value)

	return Number.isFinite(parsedValue) ? parsedValue : defaultValue
}

export const config = {
	env: process.env.NODE_ENV || 'development',
	port: Number(process.env.PORT || 3000),
	corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
	logLevel: process.env.LOG_LEVEL || 'info',
	weather: {
		forecastApiUrl:
			process.env.WEATHER_FORECAST_API_URL || 'https://api.open-meteo.com/v1/forecast',
		forecastDays: readNumber('WEATHER_FORECAST_DAYS', 1),
		apiTimeoutMs: readNumber('WEATHER_API_TIMEOUT_MS', 5000),
		suitability: {
			minTemperatureC: readNumber('WEATHER_MIN_TEMPERATURE_C', -15),
			maxTemperatureC: readNumber('WEATHER_MAX_TEMPERATURE_C', 25),
			maxWindSpeedMs: readNumber('WEATHER_MAX_WIND_SPEED_MS', 3),
			maxPrecipitationMm: readNumber('WEATHER_MAX_PRECIPITATION_MM', 1),
		},
	},
}

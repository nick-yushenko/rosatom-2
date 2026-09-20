import { config } from '@/config/env'
import { WeatherApiError } from '@/errors/WeatherApiError'

export interface WeatherCoordinates {
	lat: number
	lon: number
}

export interface WeatherForecastDay {
	date: string
	temperatureMinC: number
	temperatureMaxC: number
	precipitationMm: number
	windSpeedMaxMs: number
}

export interface WeatherForecast {
	latitude: number
	longitude: number
	timezone: string
	days: WeatherForecastDay[]
}

type OpenMeteoResponse = {
	latitude?: number
	longitude?: number
	timezone?: string
	error?: boolean
	reason?: string
	daily?: {
		time?: string[]
		temperature_2m_min?: number[]
		temperature_2m_max?: number[]
		precipitation_sum?: number[]
		wind_speed_10m_max?: number[]
	}
}

type OpenMeteoDailyForecast = Required<NonNullable<OpenMeteoResponse['daily']>>

function assertDailyForecast(data: OpenMeteoResponse): OpenMeteoDailyForecast {
	const daily = data.daily

	if (
		!daily?.time ||
		!daily.temperature_2m_min ||
		!daily.temperature_2m_max ||
		!daily.precipitation_sum ||
		!daily.wind_speed_10m_max
	) {
		throw new WeatherApiError('Погодный API вернул неполный прогноз')
	}

	return daily as OpenMeteoDailyForecast
}

export async function fetchForecast(coordinates: WeatherCoordinates): Promise<WeatherForecast> {
	const url = new URL(config.weather.forecastApiUrl)

	url.search = new URLSearchParams({
		latitude: String(coordinates.lat),
		longitude: String(coordinates.lon),
		daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
		timezone: 'auto',
		forecast_days: String(config.weather.forecastDays),
		temperature_unit: 'celsius',
		precipitation_unit: 'mm',
		wind_speed_unit: 'ms',
	}).toString()

	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), config.weather.apiTimeoutMs)

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			signal: controller.signal,
		})

		if (!response.ok) {
			throw new WeatherApiError(`Погодный API вернул статус ${response.status}`)
		}

		let data: OpenMeteoResponse

		try {
			data = (await response.json()) as OpenMeteoResponse
		} catch {
			throw new WeatherApiError('Погодный API вернул некорректный JSON')
		}

		if (data.error) {
			throw new WeatherApiError(data.reason || 'Погодный API вернул ошибку')
		}

		const daily = assertDailyForecast(data)

		return {
			latitude: data.latitude ?? coordinates.lat,
			longitude: data.longitude ?? coordinates.lon,
			timezone: data.timezone ?? 'auto',
			days: daily.time.map((date, index) => ({
				date,
				temperatureMinC: daily.temperature_2m_min?.[index] ?? 0,
				temperatureMaxC: daily.temperature_2m_max?.[index] ?? 0,
				precipitationMm: daily.precipitation_sum?.[index] ?? 0,
				windSpeedMaxMs: daily.wind_speed_10m_max?.[index] ?? 0,
			})),
		}
	} catch (err) {
		if (err instanceof WeatherApiError) {
			throw err
		}

		if (err instanceof Error && err.name === 'AbortError') {
			throw new WeatherApiError('Превышено время ожидания ответа погодного API', 504)
		}

		if (err instanceof TypeError) {
			throw new WeatherApiError('Не удалось подключиться к погодному API')
		}

		throw new WeatherApiError()
	} finally {
		clearTimeout(timeoutId)
	}
}

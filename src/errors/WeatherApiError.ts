import { AppError } from '@/errors/AppError'

export class WeatherApiError extends AppError {
	constructor(message = 'Не удалось получить прогноз погоды', statusCode = 502) {
		super({
			code: 'WEATHER_API_ERROR',
			message,
			statusCode,
		})
	}
}

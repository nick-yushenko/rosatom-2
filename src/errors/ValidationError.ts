import { AppError, type ErrorDetail } from '@/errors/AppError'

export class ValidationError extends AppError {
	constructor(details: ErrorDetail[] = [], message = 'Некорректные данные запроса') {
		super({
			code: 'VALIDATION_ERROR',
			message,
			statusCode: 400,
			details,
		})
	}
}

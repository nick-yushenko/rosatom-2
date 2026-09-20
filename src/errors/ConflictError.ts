import { AppError, ErrorDetail } from '@/errors/AppError'

export class ConflictError extends AppError {
	constructor(message = 'Конфликт данных', details: ErrorDetail[] = []) {
		super({
			code: 'CONFLICT',
			message,
			statusCode: 409,
			details,
		})
	}
}

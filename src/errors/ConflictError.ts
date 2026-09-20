import { AppError } from '@/errors/AppError'

export class ConflictError extends AppError {
	constructor(message = 'Конфликт данных', details = []) {
		super({
			code: 'CONFLICT',
			message,
			statusCode: 409,
			details,	
		})
	}
}

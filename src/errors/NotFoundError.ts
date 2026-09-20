import { AppError } from '@/errors/AppError'

export class NotFoundError extends AppError {
	constructor(message = 'Ресурс не найден') {
		super({
			code: 'NOT_FOUND',
			message,
			statusCode: 404,
		})
	}
}

import { AppError } from '@/errors/AppError'

export class StorageError extends AppError {
	constructor(message = 'Ошибка работы с хранилищем') {
		super({
			code: 'STORAGE_ERROR',
			message,
			statusCode: 500,
		})
	}
}
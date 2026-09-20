import type { NextFunction, Request, Response } from 'express'

import { AppError } from '@/errors/AppError'
import { logger } from '@/logs/logger'

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
	if (res.headersSent) {
		return next(err)
	}

	const error = err instanceof Error ? err : new Error('Unknown error')
	const isKnownError = err instanceof AppError
	const statusCode = isKnownError ? err.statusCode : 500
	const code = isKnownError ? err.code : 'INTERNAL_ERROR'
	const message = isKnownError ? err.message : 'Внутренняя ошибка сервера'
	const details = isKnownError ? err.details : []

	logger.error(message, {
		code,
		statusCode,
		requestId: req.requestId,
		stack: error.stack,
	})

	return res.status(statusCode).json({
		error: {
			code,
			message,
			details,
			requestId: req.requestId,
		},
	})
}

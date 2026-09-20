import type { NextFunction, Request, Response } from 'express'

import { AppError } from '@/errors/AppError'
import { logger } from '@/logs/logger'

type BodyParserError = SyntaxError & {
	status?: number
	statusCode?: number
	type?: string
}

function isJsonParseError(err: unknown): err is BodyParserError {
	return err instanceof SyntaxError && (err as BodyParserError).type === 'entity.parse.failed'
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
	if (res.headersSent) {
		return next(err)
	}

	const error = err instanceof Error ? err : new Error('Unknown error')
	const isKnownError = err instanceof AppError
	const isInvalidJson = isJsonParseError(err)
	const statusCode = isKnownError ? err.statusCode : isInvalidJson ? 400 : 500
	const code = isKnownError ? err.code : isInvalidJson ? 'INVALID_JSON' : 'INTERNAL_ERROR'
	const message = isKnownError
		? err.message
		: isInvalidJson
			? 'Некорректный JSON в теле запроса'
			: 'Внутренняя ошибка сервера'
	const details = isKnownError
		? err.details
		: isInvalidJson
			? [
					{
						field: 'body',
						message: 'Проверьте, что ключи и строки написаны в двойных кавычках',
					},
				]
			: []

	logger.error(message, {
		code,
		statusCode,
		requestId: req.requestId,
		originalMessage: error.message,
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

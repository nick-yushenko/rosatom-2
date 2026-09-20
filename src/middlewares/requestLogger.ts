import type { NextFunction, Request, Response } from 'express'

import { logger } from '@/logs/logger'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
	const startedAt = Date.now()

	res.on('finish', () => {
		logger.info('HTTP request completed', {
			method: req.method,
			path: req.originalUrl,
			statusCode: res.statusCode,
			durationMs: Date.now() - startedAt,
			requestId: req.requestId,
		})
	})

	next()
}

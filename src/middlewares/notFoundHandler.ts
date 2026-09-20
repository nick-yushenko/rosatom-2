import type { NextFunction, Request, Response } from 'express'

import { NotFoundError } from '@/errors/NotFoundError'

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
	next(new NotFoundError(`Маршрут ${req.method} ${req.originalUrl} не найден`))
}

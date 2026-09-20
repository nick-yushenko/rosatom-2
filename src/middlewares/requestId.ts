import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

export function requestId(req: Request, res: Response, next: NextFunction) {
	req.requestId = req.headers['x-request-id']?.toString() || crypto.randomUUID()
	res.setHeader('x-request-id', req.requestId)
	next()
}

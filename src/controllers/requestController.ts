import type { NextFunction, Request, Response } from 'express'

export async function getRequests(req: Request, res: Response, next: NextFunction) {
	try {
		res.json({ data: [] })
	} catch (err) {
		next(err)
	}
}

export async function getRequestById(req: Request, res: Response, next: NextFunction) {
	try {
		res.json({ data: {} })
	} catch (err) {
		next(err)
	}
}

export async function createRequest(req: Request, res: Response, next: NextFunction) {
	try {
		res.status(201).json({ data: {} })
	} catch (err) {
		next(err)
	}
}

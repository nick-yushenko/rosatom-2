import type { NextFunction, Request, Response } from 'express'

import * as requestService from '@/services/requestService'

type RequestIdParams = {
	id: string
}

export async function getRequests(req: Request, res: Response, next: NextFunction) {
	try {
		const requests = await requestService.getRequests()
		res.json({ data: requests })
	} catch (err) {
		next(err)
	}
}

export async function getRequestById(req: Request<RequestIdParams>, res: Response, next: NextFunction) {
	try {
		const request = await requestService.getRequestById(req.params.id)

		res.json({ data: request })
	} catch (err) {
		next(err)
	}
}

export async function createRequest(req: Request, res: Response, next: NextFunction) {
	try {
		const request = await requestService.createRequest(req.body)

		res.status(201).json({ data: request })
	} catch (err) {
		next(err)
	}
}

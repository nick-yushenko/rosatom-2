import type { NextFunction, Request, Response } from 'express'

import * as requestService from '@/services/requestService'
import { RequestListQuery } from '@/validators/requestValidator'

type RequestIdParams = {
	id: string
}

export async function getRequests(req: Request, res: Response, next: NextFunction) {
	try {
		const query = res.locals.query as RequestListQuery
		const requests = await requestService.getRequests(query)
		res.json(requests)
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

export async function updateRequestById(
	req: Request<RequestIdParams>,
	res: Response,
	next: NextFunction
) {
	try {
		const request = await requestService.updateRequestById(req.params.id, req.body)

		res.json({ data: request })
	} catch (err) {
		next(err)
	}
}

export async function updateRequestStatusById(
	req: Request<RequestIdParams>,
	res: Response,
	next: NextFunction
) {
	try {
		const request = await requestService.updateRequestStatusById(req.params.id, req.body.status)

		res.json({ data: request })
	} catch (err) {
		next(err)
	}
}

export async function deleteRequestById(
	req: Request<RequestIdParams>,
	res: Response,
	next: NextFunction
) {
	try {
		await requestService.deleteRequestById(req.params.id)

		res.status(204).send()
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

import type { NextFunction, Request, Response } from 'express'

export async function getEquipments(req: Request, res: Response, next: NextFunction) {
	try {
		res.json({ data: [] })
	} catch (err) {
		next(err)
	}
}

export async function getEquipmentById(req: Request, res: Response, next: NextFunction) {
	try {
		res.json({ data: {} })
	} catch (err) {
		next(err)
	}
}

export async function createEquipment(req: Request, res: Response, next: NextFunction) {
	try {
		res.status(201).json({ data: {} })
	} catch (err) {
		next(err)
	}
}

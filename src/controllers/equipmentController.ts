import type { NextFunction, Request, Response } from 'express'

import * as equipmentService from '@/services/equipmentService'
import { EquipmentListQuery } from '@/validators/equipmentValidator'
import { ConflictError } from '@/errors/ConflictError'

type EquipmentIdParams = {
	id: string
}

export async function getEquipments(req: Request, res: Response, next: NextFunction) {
	try {
		const query = res.locals.query as EquipmentListQuery
		const equipment = await equipmentService.getEquipments(query)
		res.json(equipment)
	} catch (err) {
		next(err)
	}
}

export async function getEquipmentById(
	req: Request<EquipmentIdParams>,
	res: Response,
	next: NextFunction
) {
	try {
		const equipment = await equipmentService.getEquipmentById(req.params.id)

		res.json({ data: equipment })
	} catch (err) {
		next(err)
	}
}

export async function createEquipment(req: Request, res: Response, next: NextFunction) {
	try {
		const equipment = await equipmentService.createEquipment(req.body)

		res.status(201).json({ data: equipment })
	} catch (err) {
		next(err)
	}
}

export async function updateEquipmentById(
	req: Request<EquipmentIdParams>,
	res: Response,
	next: NextFunction
) {
	try {
		const equipment = await equipmentService.updateEquipmentById(req.params.id, req.body)

		res.json({ data: equipment })
	} catch (err) {
		next(err)
	}
}

export async function deleteEquipmentById(
	req: Request<EquipmentIdParams>,
	res: Response,
	next: NextFunction
) {
	try {
		await equipmentService.deleteEquipmentById(req.params.id)

		res.status(204).send()
	} catch (err) {
		next(err)
	}
}

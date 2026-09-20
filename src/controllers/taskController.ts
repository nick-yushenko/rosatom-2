import type { NextFunction, Request, Response } from 'express'

import * as taskService from '@/services/taskService'
import type { CreateTaskDto } from '@/types/task'

export async function getTasks(req: Request, res: Response, next: NextFunction) {
	try {
		const tasks = await taskService.getTasks()
		res.json({ data: tasks })
	} catch (err) {
		next(err)
	}
}

export async function getTaskById(req: Request, res: Response, next: NextFunction) {
	try {
		const task = await taskService.getTaskById(req.params.id)
		res.json({ data: task })
	} catch (err) {
		next(err)
	}
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
	try {
		const task = await taskService.createTask(req.body as CreateTaskDto)
		res.status(201).json({ data: task })
	} catch (err) {
		next(err)
	}
}

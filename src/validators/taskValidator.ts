import type { NextFunction, Request, Response } from 'express'

import type { ErrorDetail } from '@/errors/AppError'
import { ValidationError } from '@/errors/ValidationError'
import type { TaskPriority } from '@/types/task'

const allowedPriorities: TaskPriority[] = ['low', 'medium', 'high']

export function validateCreateTask(req: Request, res: Response, next: NextFunction) {
	const details: ErrorDetail[] = []
	const { title, priority } = req.body as { title?: unknown; priority?: unknown }

	if (!title || typeof title !== 'string') {
		details.push({ field: 'title', message: 'Название обязательно' })
	}

	if (priority !== undefined && !allowedPriorities.includes(priority as TaskPriority)) {
		details.push({ field: 'priority', message: 'Недопустимое значение' })
	}

	if (details.length > 0) {
		return next(new ValidationError(details))
	}

	return next()
}

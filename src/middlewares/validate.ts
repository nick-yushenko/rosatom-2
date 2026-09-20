import type { NextFunction, Request, Response } from 'express'
import * as z from 'zod'

import { ValidationError } from '@/errors/ValidationError'

type ValidationSchemas = {
	body?: z.ZodType
	params?: z.ZodType
	query?: z.ZodType
}

export function validate(schemas: ValidationSchemas) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			if (schemas.body) {
				req.body = schemas.body.parse(req.body)
			}

			if (schemas.params) {
				req.params = schemas.params.parse(req.params) as typeof req.params
			}

			if (schemas.query) {
				req.query = schemas.query.parse(req.query) as typeof req.query
			}

			return next()
		} catch (err) {
			if (err instanceof z.ZodError) {
				const details = err.issues.map((issue) => ({
					field: issue.path.join('.'),
					message: issue.message,
				}))

				return next(new ValidationError(details))
			}

			return next(err)
		}
	}
}
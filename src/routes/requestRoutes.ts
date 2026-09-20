import { Router } from 'express'

import { validate } from '@/middlewares/validate'
import {
	createRequest,
	deleteRequestById,
	getRequestById,
	getRequests,
	updateRequestById,
	updateRequestStatusById,
} from '@/controllers/requestController'
import {
	createRequestSchema,
	requestIdParamsSchema,
	requestListQuerySchema,
	updateRequestSchema,
	updateRequestStatusSchema,
} from '@/validators/requestValidator'

const router = Router()

router.get('/', validate({ query: requestListQuerySchema }), getRequests)
router.get('/:id', validate({ params: requestIdParamsSchema }), getRequestById)

router.post('/', validate({ body: createRequestSchema }), createRequest)

router.patch(
	'/:id/status',
	validate({ params: requestIdParamsSchema, body: updateRequestStatusSchema }),
	updateRequestStatusById
)
router.patch(
	'/:id',
	validate({ params: requestIdParamsSchema, body: updateRequestSchema }),
	updateRequestById
)
router.delete('/:id', validate({ params: requestIdParamsSchema }), deleteRequestById)

export default router

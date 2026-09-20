import { Router } from 'express'

import { validate } from '@/middlewares/validate'
import { createRequest, getRequestById, getRequests } from '@/controllers/requestController'
import { createRequestSchema, requestIdParamsSchema } from '@/validators/requestValidator'

const router = Router()

router.get('/', getRequests)
router.post('/', validate({ body: createRequestSchema }), createRequest)
router.get('/:id', validate({ params: requestIdParamsSchema }), getRequestById)

export default router

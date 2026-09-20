import { Router } from 'express'

import { validate } from '@/middlewares/validate'
import { createRequest, getRequests } from '@/controllers/requestController'
import { createRequestSchema } from '@/validators/requestValidator'

const router = Router()

router.get('/', getRequests)
router.post('/', validate({ body: createRequestSchema }), createRequest)

export default router

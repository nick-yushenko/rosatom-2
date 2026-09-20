import { Router } from 'express'

import * as healthController from '@/controllers/healthController'

const router = Router()

router.get('/', healthController.getHealth)

export default router

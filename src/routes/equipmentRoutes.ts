import { Router } from 'express'

import { validate } from '@/middlewares/validate'
import { createEquipmentSchema } from '@/validators/equipmentValidator'
import { createEquipment } from '@/controllers/equipmentController'

const router = Router()

router.post('/', validate({ body: createEquipmentSchema }), createEquipment)

export default router
	
import { Router } from 'express'

import { validate } from '@/middlewares/validate'
import { createEquipmentSchema, equipmentIdParamsSchema, updateEquipmentSchema } from '@/validators/equipmentValidator'
import { createEquipment, deleteEquipmentById, getEquipmentById, getEquipments, updateEquipmentById } from '@/controllers/equipmentController'

const router = Router()

router.get('/', getEquipments)
router.get('/:id', validate({ params: equipmentIdParamsSchema }), getEquipmentById)

router.post('/', validate({ body: createEquipmentSchema }), createEquipment)
router.patch('/:id', validate({ params: equipmentIdParamsSchema, body: updateEquipmentSchema }), updateEquipmentById)
router.delete('/:id', validate({ params: equipmentIdParamsSchema }), deleteEquipmentById)

export default router
	

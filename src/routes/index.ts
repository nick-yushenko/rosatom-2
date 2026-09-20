import { Router } from 'express'

import healthRoutes from '@/routes/healthRoutes'
import equipmentRoutes from './equipmentRoutes'
import requestRoutes from './requestRoutes'

const router = Router()

router.use('/health', healthRoutes)
router.use('/equipment', equipmentRoutes)
router.use('/request', requestRoutes)
router.use('/equipment', equipmentRoutes)

export default router

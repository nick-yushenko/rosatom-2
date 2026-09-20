import { Router } from 'express'

import healthRoutes from '@/routes/healthRoutes'
import taskRoutes from '@/routes/taskRoutes'

const router = Router()

router.use('/health', healthRoutes)
router.use('/tasks', taskRoutes)

export default router

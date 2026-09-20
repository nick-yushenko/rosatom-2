import { Router } from 'express'

import * as taskController from '@/controllers/taskController'
import { validateCreateTask } from '@/validators/taskValidator'

const router = Router()

router.get('/', taskController.getTasks)
router.get('/:id', taskController.getTaskById)
router.post('/', validateCreateTask, taskController.createTask)

export default router

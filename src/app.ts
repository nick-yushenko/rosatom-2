import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { config } from '@/config/env'
import { errorHandler } from '@/middlewares/errorHandler'
import { notFoundHandler } from '@/middlewares/notFoundHandler'
import { requestId } from '@/middlewares/requestId'
import { requestLogger } from '@/middlewares/requestLogger'
import routes from '@/routes'

export function createApp() {
	const app = express()

	app.use(requestId)
	app.use(helmet())
	app.use(cors({ origin: config.corsOrigin }))
	app.use(express.json())
	app.use(requestLogger)

	app.use('/api', routes)

	app.use(notFoundHandler)
	app.use(errorHandler)

	return app
}

import { createApp } from '@/app'
import { config } from '@/config/env'
import { logger } from '@/logs/logger'

const app = createApp()

const server = app.listen(config.port, () => {
	logger.info(`Server started on port ${config.port}`)
})

process.on('SIGTERM', () => {
	logger.info('SIGTERM received, shutting down')
	server.close(() => process.exit(0))
})

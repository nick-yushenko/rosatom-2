import 'dotenv/config'

export const config = {
	env: process.env.NODE_ENV || 'development',
	port: Number(process.env.PORT || 3000),
	corsOrigin: process.env.CORS_ORIGIN || '*',
	logLevel: process.env.LOG_LEVEL || 'info',
}

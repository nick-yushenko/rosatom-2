import { config } from '@/config/env'

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

const levels: LogLevel[] = ['error', 'warn', 'info', 'debug']

function shouldLog(level: LogLevel) {
	return levels.indexOf(level) <= levels.indexOf(config.logLevel as LogLevel)
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
	if (!shouldLog(level)) return

	const payload = {
		level,
		message,
		...(meta ? { meta } : {}),
		timestamp: new Date().toISOString(),
	}

	console[level === 'debug' ? 'log' : level](JSON.stringify(payload))
}

export const logger = {
	error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
	warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
	info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
	debug: (message: string, meta?: Record<string, unknown>) => write('debug', message, meta),
}

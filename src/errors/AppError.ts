export interface ErrorDetail {
	field: string
	message: string
}

interface AppErrorParams {
	code: string
	message: string
	statusCode?: number
	details?: ErrorDetail[]
}

export class AppError extends Error {
	code: string
	statusCode: number
	details: ErrorDetail[]

	constructor({ code, message, statusCode = 500, details = [] }: AppErrorParams) {
		super(message)
		this.name = this.constructor.name
		this.code = code
		this.statusCode = statusCode
		this.details = details
		Error.captureStackTrace(this, this.constructor)
	}
}

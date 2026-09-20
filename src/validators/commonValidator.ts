import * as z from 'zod'

export const paginationQueryShape = {
	page: z.coerce
		.number({ error: 'page должен быть числом' })
		.int('page должен быть целым числом')
		.positive('page должен быть больше 0')
		.default(1),

	limit: z.coerce
		.number({ error: 'limit должен быть числом' })
		.int('limit должен быть целым числом')
		.positive('limit должен быть больше 0')
		.max(100, 'limit не должен быть больше 100')
		.default(20),
}

export const sortOrderSchema = z
	.enum(['asc', 'desc'], {
		error: 'sortOrder должен быть asc или desc',
	})
	.default('asc')

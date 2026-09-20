import { requestPriorities, requestStatuses } from '@/types/request'
import * as z from 'zod'

export const requestIdParamsSchema = z.object({
	id: z.uuid({ error: 'Некорректный id запроса на ремонт оборудования' }),
})

export const createRequestSchema = z.object({
	equipmentId: z.uuid({ error: 'Некорректный id оборудования' }),
	title: z
		.string({ error: 'Поле обязательно для заполнения' })
		.trim()
		.min(5, 'Заголовок должен быть не короче 5 символов')
		.max(120, 'Заголовок должен быть не длиннее 120 символов'),
	description: z
		.string()
		.trim()
		.max(2000, 'Описание должно быть не длиннее 2000 символов')
		.optional(),
	priority: z.enum(requestPriorities, {
		message: 'Недопустимый приоритет запроса на ремонт оборудования',
	}),
	plannedAt: z.iso
		.datetime('Планируемая дата ремонта должна быть ISO-датой')
		.refine((value) => new Date(value) >= new Date(), {
			message: 'Планируемая дата ремонта не может быть в прошлом',
		}),
})

export const updateRequestStatusSchema = z.object({
	status: z.enum(requestStatuses, {
		error: 'Недопустимый статус заявки',
	}),
})

export const updateRequestSchema = z
	.object({
		title: createRequestSchema.shape.title.optional(),
		description: createRequestSchema.shape.description.optional(),
		priority: createRequestSchema.shape.priority.optional(),
		plannedAt: createRequestSchema.shape.plannedAt.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'Нужно передать хотя бы одно поле для обновления',
	})

export const requestListQuerySchema = z.object({
	status: z.enum(requestStatuses).optional(),
	priority: z.enum(requestPriorities).optional(),
	equipmentId: z.uuid({ error: 'Некорректный id оборудования' }).optional(),

	dateFrom: z.iso.datetime({ error: 'dateFrom должен быть ISO-дата-время' }).optional(),
	dateTo: z.iso.datetime({ error: 'dateTo должен быть ISO-дата-время' }).optional(),

	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),

	sortBy: z.enum(['createdAt', 'updatedAt', 'plannedAt', 'priority', 'status']).optional(),

	sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

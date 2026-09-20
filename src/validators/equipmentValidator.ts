import { equipmentStatuses, equipmentTypes } from '@/types/equipments'
import * as z from 'zod'
import { paginationQueryShape, sortOrderSchema } from './commonValidator'

export const equipmentIdParamsSchema = z.object({
	id: z.uuid({ error: 'Некорректный id оборудования' }),
})

export const createEquipmentSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'Название должно быть не короче 3 символов')
		.max(100, 'Название должно быть не длиннее 100 символов'),

	type: z.enum(equipmentTypes, {
		message: 'Недопустимый тип оборудования',
	}),

	serialNumber: z.string().trim().min(1, 'Серийный номер обязателен'),

	location: z.object({
		lat: z
			.number()
			.min(-90, 'Широта должна быть не меньше -90')
			.max(90, 'Широта должна быть не больше 90'),

		lon: z
			.number()
			.min(-180, 'Долгота должна быть не меньше -180')
			.max(180, 'Долгота должна быть не больше 180'),
	}),

	status: z.enum(equipmentStatuses, {
		message: 'Недопустимый статус оборудования',
	}),

	installedAt: z.iso
		.datetime('Дата установки должна быть ISO-датой')
		.refine((value) => new Date(value) <= new Date(), {
			message: 'Дата установки не может быть в будущем',
		}),
})

export const updateEquipmentSchema = z
	.object({
		name: createEquipmentSchema.shape.name.optional(),
		type: createEquipmentSchema.shape.type.optional(),
		serialNumber: createEquipmentSchema.shape.serialNumber.optional(),
		location: createEquipmentSchema.shape.location.optional(),
		status: createEquipmentSchema.shape.status.optional(),
		installedAt: createEquipmentSchema.shape.installedAt.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'Нужно передать хотя бы одно поле для обновления',
	})

export const equipmentListQuerySchema = z
	.object({
		status: z.enum(equipmentStatuses).optional(),
		type: z.enum(equipmentTypes).optional(),

		installedFrom: z.iso.datetime({ error: 'installedFrom должен быть ISO-дата-время' }).optional(),
		installedTo: z.iso.datetime({ error: 'installedTo должен быть ISO-дата-время' }).optional(),

		sortBy: z
			.enum(['name', 'type', 'status', 'installedAt'], {
				error: 'sortBy должен быть одним из: name, type, status, installedAt',
			})
			.optional()
			.default('name'),

		sortOrder: sortOrderSchema,
	})
	.extend(paginationQueryShape)

export type EquipmentListQuery = z.infer<typeof equipmentListQuerySchema>

import crypto from 'node:crypto'

import { ConflictError } from '@/errors/ConflictError'
import { NotFoundError } from '@/errors/NotFoundError'
import * as equipmentRepository from '@/repositories/equipmentRepository'
import * as requestRepository from '@/repositories/requestRepository'
import {
	CreateMaintenanceRequestDto,
	MaintenanceRequest,
	RequestStatus,
	UpdateMaintenanceRequestDto,
} from '@/types/request'
import { RequestListQuery } from '@/validators/requestValidator'

const allowedStatusTransitions: Record<RequestStatus, RequestStatus[]> = {
	new: ['in_progress', 'rejected'],
	in_progress: ['done', 'rejected'],
	done: [],
	rejected: [],
}

export async function getRequests(query: RequestListQuery) {
	const { status, priority, equipmentId, dateFrom, dateTo, page, limit, sortBy, sortOrder } = query
	let requests = await requestRepository.findAll()

	if (status) {
		requests = requests.filter((item) => item.status === status)
	}

	if (priority) {
		requests = requests.filter((item) => item.priority === priority)
	}

	if (equipmentId) {
		requests = requests.filter((item) => item.equipmentId === equipmentId)
	}

	if (dateFrom) {
		requests = requests.filter((item) => new Date(item.createdAt) >= new Date(dateFrom))
	}

	if (dateTo) {
		requests = requests.filter((item) => new Date(item.createdAt) <= new Date(dateTo))
	}

	if (sortBy) {
		requests = [...requests].sort((a, b) => {
			const left = a[sortBy]
			const right = b[sortBy]

			if (left < right) return sortOrder === 'asc' ? -1 : 1
			if (left > right) return sortOrder === 'asc' ? 1 : -1
			return 0
		})
	}

	const total = requests.length
	const start = (page - 1) * limit
	const end = start + limit
	const data = requests.slice(start, end)

	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	}
}

export async function getRequestById(id: string) {
	const request = await requestRepository.findById(id)

	if (!request) {
		throw new NotFoundError('Запрос на ремонт оборудования не найден')
	}

	return request
}

export async function createRequest(
	data: CreateMaintenanceRequestDto
): Promise<MaintenanceRequest> {
	const equipment = await equipmentRepository.findById(data.equipmentId)

	if (!equipment) {
		throw new NotFoundError('Оборудование не найдено')
	}

	const now = new Date().toISOString()
	const request: MaintenanceRequest = {
		id: crypto.randomUUID(),
		equipmentId: data.equipmentId,
		description: data.description?.trim(),
		status: 'new',
		createdAt: now,
		updatedAt: now,
		plannedAt: data.plannedAt,
		priority: data.priority,
		title: data.title.trim(),
	}

	return requestRepository.create(request)
}

export async function updateRequestById(id: string, data: UpdateMaintenanceRequestDto) {
	const request = await getRequestById(id)

	const updatedRequest: MaintenanceRequest = {
		...request,
		...data,
		title: data.title?.trim() ?? request.title,
		description: data.description?.trim() ?? request.description,
		updatedAt: new Date().toISOString(),
	}

	return requestRepository.update(id, updatedRequest)
}

export async function updateRequestStatusById(id: string, status: RequestStatus) {
	const request = await getRequestById(id)

	if (!allowedStatusTransitions[request.status].includes(status)) {
		throw new ConflictError('Недопустимый переход статуса заявки', [
			{
				field: 'status',
				message: `Нельзя изменить статус с ${request.status} на ${status}`,
			},
		])
	}

	const updatedRequest: MaintenanceRequest = {
		...request,
		status,
		updatedAt: new Date().toISOString(),
	}

	return requestRepository.update(id, updatedRequest)
}

export async function deleteRequestById(id: string) {
	const deleted = await requestRepository.remove(id)

	if (!deleted) {
		throw new NotFoundError('Запрос на ремонт оборудования не найден')
	}
}

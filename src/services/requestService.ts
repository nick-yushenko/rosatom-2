import crypto from 'node:crypto'

import { NotFoundError } from '@/errors/NotFoundError'
import * as requestRepository from '@/repositories/requestRepository'
import { CreateMaintenanceRequestDto, MaintenanceRequest } from '@/types/request'

export async function getRequests() {
	return requestRepository.findAll()
}

export async function getRequestById(id: string) {
	const request = await requestRepository.findById(id)

	if (!request) {
		throw new NotFoundError('Запрос на ремонт оборудования не найден')
	}

	return request
}

export async function createRequest(data: CreateMaintenanceRequestDto): Promise<MaintenanceRequest> {
	const request: MaintenanceRequest = {
		id: crypto.randomUUID(),
		equipmentId: data.equipmentId,
		description: data.description?.trim(),
		status: 'new',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		plannedAt: data.plannedAt,
		priority: data.priority || 'medium',
		title: data.title.trim(),
	}

	return requestRepository.create(request)
}

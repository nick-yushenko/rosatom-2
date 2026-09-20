import crypto from 'node:crypto'

import { NotFoundError } from '@/errors/NotFoundError'
import * as equipmentRepository from '@/repositories/equipmentRepository'
import * as requestRepository from '@/repositories/requestRepository'
import { CreateEquipmentDto, Equipment, UpdateEquipmentDto } from '@/types/equipments'
import { EquipmentListQuery } from '@/validators/equipmentValidator'
import { ConflictError } from '@/errors/ConflictError'

async function ensureSerialNumberUnique(serialNumber: string, currentEquipmentId?: string) {
	const existingEquipment = await equipmentRepository.findBySerialNumber(serialNumber.trim())

	if (existingEquipment && existingEquipment.id !== currentEquipmentId) {
		throw new ConflictError('Оборудование с таким серийным номером уже существует', [
			{
				field: 'serialNumber',
				message: 'Серийный номер должен быть уникальным',
			},
		])
	}
}

export async function getEquipments(query: EquipmentListQuery) {
	const { status, type, installedFrom, installedTo, page, limit, sortBy, sortOrder } = query
	let equipment = await equipmentRepository.findAll()

	if (status) {
		equipment = equipment.filter((item) => item.status === status)
	}

	if (type) {
		equipment = equipment.filter((item) => item.type === type)
	}

	if (installedFrom) {
		equipment = equipment.filter((item) => new Date(item.installedAt) >= new Date(installedFrom))
	}

	if (installedTo) {
		equipment = equipment.filter((item) => new Date(item.installedAt) <= new Date(installedTo))
	}

	if (sortBy) {
		equipment = [...equipment].sort((a, b) => {
			const left = a[sortBy]
			const right = b[sortBy]

			if (left < right) return sortOrder === 'asc' ? -1 : 1
			if (left > right) return sortOrder === 'asc' ? 1 : -1
			return 0
		})
	}

	const total = equipment.length
	const start = (page - 1) * limit
	const end = start + limit
	const data = equipment.slice(start, end)

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

export async function getEquipmentById(id: string) {
	const equipment = await equipmentRepository.findById(id)

	if (!equipment) {
		throw new NotFoundError('Оборудование не найдено')
	}

	return equipment
}

export async function findEquipmentBySerialNumber(serialNumber: string) {
	return equipmentRepository.findBySerialNumber(serialNumber)
}

export async function createEquipment(data: CreateEquipmentDto): Promise<Equipment> {
	await ensureSerialNumberUnique(data.serialNumber)

	const equipment: Equipment = {
		name: data.name.trim(),
		type: data.type,
		serialNumber: data.serialNumber.trim(),
		location: { lat: data.location.lat, lon: data.location.lon },
		status: data.status,
		installedAt: data.installedAt,
		id: crypto.randomUUID(),
	}

	return equipmentRepository.create(equipment)
}

export async function updateEquipmentById(id: string, data: UpdateEquipmentDto) {
	const equipment = await getEquipmentById(id)

	if (data.serialNumber) {
		await ensureSerialNumberUnique(data.serialNumber, id)
	}

	const updatedEquipment = {
		...equipment,
		...data,
		// предварительная обработка отдельных полей
		name: data.name?.trim() ?? equipment.name,
		serialNumber: data.serialNumber?.trim() ?? equipment.serialNumber,
	}

	return equipmentRepository.update(id, updatedEquipment)
}

export async function deleteEquipmentById(id: string) {
	const equipment = await equipmentRepository.findById(id)

	if (!equipment) {
		throw new NotFoundError('Оборудование не найдено')
	}

	const requests = await requestRepository.findActiveByEquipmentId(id)

	if (requests.length > 0) {
		throw new ConflictError('Нельзя удалить оборудование, по которому есть активные заявки', [
			{
				field: 'id',
				message: 'Сначала удалите или завершите связанные заявки',
			},
		])
	}

	await equipmentRepository.remove(id)
}

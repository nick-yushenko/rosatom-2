import crypto from 'node:crypto'

import { NotFoundError } from '@/errors/NotFoundError'
import * as equipmentRepository from '@/repositories/equipmentRepository'
import { CreateEquipmentDto, Equipment, UpdateEquipmentDto } from '@/types/equipments'

export async function getEquipments() {
	return equipmentRepository.findAll()
}

export async function getEquipmentById(id: string) {
	const equipment = await equipmentRepository.findById(id)

	if (!equipment) {
		throw new NotFoundError('Оборудование не найдено')
	}

	return equipment
}

export async function createEquipment(data: CreateEquipmentDto): Promise<Equipment> {
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
	const deleted = await equipmentRepository.remove(id)

	if (!deleted) {
		throw new NotFoundError('Оборудование не найдено')
	}
}

import { readDb, writeDb } from '@/storage/jsonStorage'
import { MaintenanceRequest } from '@/types/request'

export async function findAll() {
	const db = await readDb()
	return db.requests as MaintenanceRequest[]
}

export async function findByEquipmentId(equipmentId: string) {
	const db = await readDb()
	return db.requests.filter((request) => request.equipmentId === equipmentId)
}

export async function findActiveByEquipmentId(equipmentId: string) {
	const db = await readDb()
	return db.requests.filter(
		(request) =>
			request.equipmentId === equipmentId &&
			request.status !== 'done' &&
			request.status !== 'rejected'
	)
}

export async function create(request: MaintenanceRequest) {
	const db = await readDb()
	db.requests.push(request)
	await writeDb(db)

	return request
}

export async function findById(id: string) {
	const db = await readDb()
	return db.requests.find((r) => r.id === id) || null
}

export async function update(id: string, request: MaintenanceRequest) {
	const db = await readDb()
	const index = db.requests.findIndex((item) => item.id === id)

	if (index === -1) {
		return null
	}

	db.requests[index] = request
	await writeDb(db)

	return request
}

export async function remove(id: string) {
	const db = await readDb()
	const index = db.requests.findIndex((item) => item.id === id)

	if (index === -1) {
		return null
	}

	const [deletedRequest] = db.requests.splice(index, 1)
	await writeDb(db)

	return deletedRequest
}

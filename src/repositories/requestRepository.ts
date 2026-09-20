import { readDb, writeDb } from '@/storage/jsonStorage'
import { MaintenanceRequest } from '@/types/request'

export async function findAll() {
	const db = await readDb()
	return db.requests as MaintenanceRequest[]
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
import { readDb, writeDb } from '@/storage/jsonStorage'
import { Equipment } from '@/types/equipments'

export async function findAll() {
	const db = await readDb()
	return db.equipment as Equipment[]
}

export async function findById(id: string) {
	const db = await readDb()
	return db.equipment.find((e) => e.id === id) || null
}

export async function findBySerialNumber(serialNumber: string) {
	const db = await readDb()
	return db.equipment.find((e) => e.serialNumber === serialNumber) || null
}

export async function create(equipment: Equipment) {
	const db = await readDb()
	db.equipment.push(equipment)
	await writeDb(db)

	return equipment
}

export async function update(id: string, equipment: Equipment) {
	const db = await readDb()
	const index = db.equipment.findIndex((item) => item.id === id)

	if (index === -1) {
		return null
	}

	db.equipment[index] = equipment
	await writeDb(db)

	return equipment
}

export async function remove(id: string) {
	const db = await readDb()
	const index = db.equipment.findIndex((item) => item.id === id)

	if (index === -1) {
		return null
	}

	const [deletedEquipment] = db.equipment.splice(index, 1)
	await writeDb(db)

	return deletedEquipment
}

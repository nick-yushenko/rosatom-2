import { Equipment } from '@/types/equipments'
import { MaintenanceRequest } from '@/types/request'
import { StorageError } from '@/errors/StorageError'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const dbPath = path.resolve('data/db.json')

type Database = {
	equipment: Equipment[]
	requests: MaintenanceRequest[]
}

const defaultDb: Database = {
	equipment: [],
	requests: [],
}

export async function readDb(): Promise<Database> {
	try {
		const content = await readFile(dbPath, 'utf-8')
		return JSON.parse(content) as Database
	} catch (err) {
		if (err instanceof SyntaxError) {
			throw new StorageError('JSON-хранилище повреждено')
		}

		const db = defaultDb
		await writeDb(db)
		return db
	}
}

export async function writeDb(db: Database) {
	try {
		await mkdir(path.dirname(dbPath), { recursive: true })
		await writeFile(dbPath, JSON.stringify(db, null, 2))
	} catch {
		throw new StorageError('Не удалось записать данные в JSON-хранилище')
	}
}

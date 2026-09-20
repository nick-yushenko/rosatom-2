import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import request from 'supertest'

import { createApp } from '@/app'
import { readDb, writeDb } from '@/storage/jsonStorage'

describe('app', () => {
	const app = createApp()
	let originalDb = ''

	function equipmentPayload(overrides: Record<string, unknown> = {}) {
		return {
			name: 'Тестовая турбина',
			type: 'turbine',
			serialNumber: `TST-${randomUUID()}`,
			location: {
				lat: 55.751244,
				lon: 37.618423,
			},
			status: 'operational',
			installedAt: '2024-05-10T09:00:00.000Z',
			...overrides,
		}
	}

	function maintenanceRequestPayload(equipmentId: string, overrides: Record<string, unknown> = {}) {
		return {
			equipmentId,
			title: 'Плановая проверка',
			description: 'Проверить состояние оборудования',
			priority: 'high',
			plannedAt: '2030-05-10T09:00:00.000Z',
			...overrides,
		}
	}

	async function createEquipment(overrides: Record<string, unknown> = {}) {
		const response = await request(app)
			.post('/api/equipment')
			.send(equipmentPayload(overrides))
			.expect(201)

		return response.body.data
	}

	async function createMaintenanceRequest(
		equipmentId: string,
		overrides: Record<string, unknown> = {}
	) {
		const response = await request(app)
			.post('/api/requests')
			.send(maintenanceRequestPayload(equipmentId, overrides))
			.expect(201)

		return response.body.data
	}

	beforeEach(async () => {
		originalDb = await readFile('data/db.json', 'utf-8').catch(() =>
			JSON.stringify({ equipment: [], requests: [] })
		)
		await writeDb({ equipment: [], requests: [] })
	})

	afterEach(async () => {
		mock.restoreAll()
		await writeFile('data/db.json', originalDb)
	})

	it('returns health status', async () => {
		const response = await request(app).get('/api/health').expect(200)

		assert.equal(response.body.status, 'ok')
		assert.ok(response.body.requestId)
	})

	it('creates equipment', async () => {
		const serialNumber = `TST-${randomUUID()}`

		const response = await request(app)
			.post('/api/equipment')
			.send(equipmentPayload({ serialNumber }))
			.expect(201)

		assert.equal(response.body.data.serialNumber, serialNumber)
		assert.ok(response.body.data.id)
	})

	it('lists, reads, updates and deletes equipment', async () => {
		const equipment = await createEquipment({ name: 'Тестовый инвертор', type: 'inverter' })

		const listResponse = await request(app)
			.get('/api/equipment')
			.query({ type: 'inverter' })
			.expect(200)

		assert.equal(listResponse.body.pagination.total, 1)
		assert.equal(listResponse.body.data[0].id, equipment.id)

		const readResponse = await request(app).get(`/api/equipment/${equipment.id}`).expect(200)

		assert.equal(readResponse.body.data.name, 'Тестовый инвертор')

		const updateResponse = await request(app)
			.patch(`/api/equipment/${equipment.id}`)
			.send({ status: 'maintenance', name: 'Обновленный инвертор' })
			.expect(200)

		assert.equal(updateResponse.body.data.status, 'maintenance')
		assert.equal(updateResponse.body.data.name, 'Обновленный инвертор')

		await request(app).delete(`/api/equipment/${equipment.id}`).expect(204)
		await request(app).get(`/api/equipment/${equipment.id}`).expect(404)
	})

	it('persists equipment and maintenance requests in JSON storage', async () => {
		const equipment = await createEquipment({ serialNumber: 'JSON-STORE-001' })
		const maintenanceRequest = await createMaintenanceRequest(equipment.id)

		const db = await readDb()

		assert.equal(db.equipment.length, 1)
		assert.equal(db.equipment[0].serialNumber, 'JSON-STORE-001')
		assert.equal(db.requests.length, 1)
		assert.equal(db.requests[0].id, maintenanceRequest.id)
		assert.equal(db.requests[0].equipmentId, equipment.id)
	})

	it('returns storage error when JSON storage is corrupted', async () => {
		await writeFile('data/db.json', '{ broken json')

		const response = await request(app).get('/api/equipment').expect(500)

		assert.equal(response.body.error.code, 'STORAGE_ERROR')
	})

	it('rejects duplicated serialNumber on create and update', async () => {
		const serialNumber = 'DUPLICATE-SERIAL-001'
		const firstEquipment = await createEquipment({ serialNumber })
		const secondEquipment = await createEquipment({ serialNumber: 'DUPLICATE-SERIAL-002' })

		const createResponse = await request(app)
			.post('/api/equipment')
			.send(equipmentPayload({ serialNumber }))
			.expect(409)

		assert.equal(createResponse.body.error.code, 'CONFLICT')
		assert.equal(createResponse.body.error.details[0].field, 'serialNumber')

		const updateResponse = await request(app)
			.patch(`/api/equipment/${secondEquipment.id}`)
			.send({ serialNumber: firstEquipment.serialNumber })
			.expect(409)

		assert.equal(updateResponse.body.error.code, 'CONFLICT')
		assert.equal(updateResponse.body.error.details[0].field, 'serialNumber')
	})

	it('creates, lists, reads, updates and deletes maintenance requests', async () => {
		const equipment = await createEquipment()
		const maintenanceRequest = await createMaintenanceRequest(equipment.id, {
			title: 'Заменить датчик вибрации',
			priority: 'critical',
		})

		assert.equal(maintenanceRequest.status, 'new')

		const listResponse = await request(app)
			.get('/api/requests')
			.query({ equipmentId: equipment.id, priority: 'critical' })
			.expect(200)

		assert.equal(listResponse.body.pagination.total, 1)
		assert.equal(listResponse.body.data[0].id, maintenanceRequest.id)

		const readResponse = await request(app)
			.get(`/api/requests/${maintenanceRequest.id}`)
			.expect(200)

		assert.equal(readResponse.body.data.title, 'Заменить датчик вибрации')

		const updateResponse = await request(app)
			.patch(`/api/requests/${maintenanceRequest.id}`)
			.send({ title: 'Проверить датчик вибрации', priority: 'medium' })
			.expect(200)

		assert.equal(updateResponse.body.data.title, 'Проверить датчик вибрации')
		assert.equal(updateResponse.body.data.priority, 'medium')

		await request(app).delete(`/api/requests/${maintenanceRequest.id}`).expect(204)
		await request(app).get(`/api/requests/${maintenanceRequest.id}`).expect(404)
	})

	it('allows valid status transitions and rejects invalid ones', async () => {
		const equipment = await createEquipment()
		const maintenanceRequest = await createMaintenanceRequest(equipment.id)

		const inProgressResponse = await request(app)
			.patch(`/api/requests/${maintenanceRequest.id}/status`)
			.send({ status: 'in_progress' })
			.expect(200)

		assert.equal(inProgressResponse.body.data.status, 'in_progress')

		const doneResponse = await request(app)
			.patch(`/api/requests/${maintenanceRequest.id}/status`)
			.send({ status: 'done' })
			.expect(200)

		assert.equal(doneResponse.body.data.status, 'done')

		const invalidResponse = await request(app)
			.patch(`/api/requests/${maintenanceRequest.id}/status`)
			.send({ status: 'in_progress' })
			.expect(409)

		assert.equal(invalidResponse.body.error.code, 'CONFLICT')
		assert.equal(invalidResponse.body.error.details[0].field, 'status')
	})

	it('does not delete equipment while it has open maintenance requests', async () => {
		const equipment = await createEquipment()
		const maintenanceRequest = await createMaintenanceRequest(equipment.id)

		const deleteResponse = await request(app).delete(`/api/equipment/${equipment.id}`).expect(409)

		assert.equal(deleteResponse.body.error.code, 'CONFLICT')

		await request(app)
			.patch(`/api/requests/${maintenanceRequest.id}/status`)
			.send({ status: 'rejected' })
			.expect(200)

		await request(app).delete(`/api/equipment/${equipment.id}`).expect(204)
	})

	it('returns equipment weather and suitability', async () => {
		const equipment = await createEquipment()

		const fetchMock = mock.method(globalThis, 'fetch', (async (
			input: Parameters<typeof fetch>[0]
		) => {
			const url = new URL(input instanceof Request ? input.url : String(input))

			assert.equal(url.searchParams.get('latitude'), '55.751244')
			assert.equal(url.searchParams.get('longitude'), '37.618423')

			return new Response(
				JSON.stringify({
					latitude: 55.75,
					longitude: 37.62,
					timezone: 'Europe/Moscow',
					daily: {
						time: ['2026-09-20'],
						temperature_2m_min: [10],
						temperature_2m_max: [20],
						precipitation_sum: [0.5],
						wind_speed_10m_max: [2],
					},
				})
			)
		}) as typeof fetch)

		const response = await request(app).get(`/api/equipment/${equipment.id}/weather`).expect(200)

		assert.equal(fetchMock.mock.callCount(), 1)
		assert.equal(response.body.data.suitability.isSuitable, true)
		assert.deepEqual(response.body.data.suitability.reasons, [])
		assert.equal(response.body.data.forecast.days[0].windSpeedMaxMs, 2)
	})

	it('returns a handled error when weather API is unavailable', async () => {
		const equipment = await createEquipment()

		mock.method(globalThis, 'fetch', (async () => {
			throw new TypeError('network failed')
		}) as typeof fetch)

		const response = await request(app).get(`/api/equipment/${equipment.id}/weather`).expect(502)

		assert.equal(response.body.error.code, 'WEATHER_API_ERROR')
	})
})

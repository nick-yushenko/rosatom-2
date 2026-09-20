import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import request from 'supertest'

import { createApp } from '@/app'
import { writeDb } from '@/storage/jsonStorage'

describe('app', () => {
	const app = createApp()
	let originalDb = ''
	let server: Server
	let baseUrl = ''

	beforeEach(async () => {
		originalDb = await readFile('data/db.json', 'utf-8').catch(() =>
			JSON.stringify({ equipment: [], requests: [] })
		)
		await writeDb({ equipment: [], requests: [] })

		server = await new Promise<Server>((resolve) => {
			const listener = createServer(app)
			listener.listen(0, '127.0.0.1', () => resolve(listener))
		})

		const address = server.address()
		assert(address && typeof address === 'object')
		baseUrl = `http://127.0.0.1:${address.port}`
	})

	afterEach(async () => {
		mock.restoreAll()
		await new Promise<void>((resolve, reject) => {
			server.close((err) => (err ? reject(err) : resolve()))
		})
		await writeFile('data/db.json', originalDb)
	})

	it('returns health status', async () => {
		const response = await request(baseUrl).get('/api/health').expect(200)

		assert.equal(response.body.status, 'ok')
		assert.ok(response.body.requestId)
	})

	it('creates equipment', async () => {
		const serialNumber = `TST-${randomUUID()}`

		const response = await request(baseUrl)
			.post('/api/equipment')
			.send({
				name: 'Тестовая турбина',
				type: 'turbine',
				serialNumber,
				location: {
					lat: 55.751244,
					lon: 37.618423,
				},
				status: 'operational',
				installedAt: '2024-05-10T09:00:00.000Z',
			})
			.expect(201)

		assert.equal(response.body.data.serialNumber, serialNumber)
		assert.ok(response.body.data.id)
	})

	it('returns equipment weather and suitability', async () => {
		const equipmentResponse = await request(baseUrl)
			.post('/api/equipment')
			.send({
				name: 'Тестовая турбина',
				type: 'turbine',
				serialNumber: `TST-${randomUUID()}`,
				location: {
					lat: 55.751244,
					lon: 37.618423,
				},
				status: 'operational',
				installedAt: '2024-05-10T09:00:00.000Z',
			})
			.expect(201)

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

		const response = await request(baseUrl)
			.get(`/api/equipment/${equipmentResponse.body.data.id}/weather`)
			.expect(200)

		assert.equal(fetchMock.mock.callCount(), 1)
		assert.equal(response.body.data.suitability.isSuitable, true)
		assert.deepEqual(response.body.data.suitability.reasons, [])
		assert.equal(response.body.data.forecast.days[0].windSpeedMaxMs, 2)
	})

	it('returns a handled error when weather API is unavailable', async () => {
		const equipmentResponse = await request(baseUrl)
			.post('/api/equipment')
			.send({
				name: 'Тестовая турбина',
				type: 'turbine',
				serialNumber: `TST-${randomUUID()}`,
				location: {
					lat: 55.751244,
					lon: 37.618423,
				},
				status: 'operational',
				installedAt: '2024-05-10T09:00:00.000Z',
			})
			.expect(201)

		mock.method(globalThis, 'fetch', (async () => {
			throw new TypeError('network failed')
		}) as typeof fetch)

		const response = await request(baseUrl)
			.get(`/api/equipment/${equipmentResponse.body.data.id}/weather`)
			.expect(502)

		assert.equal(response.body.error.code, 'WEATHER_API_ERROR')
	})
})

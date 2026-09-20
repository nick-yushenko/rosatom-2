import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import request from 'supertest'

import { createApp } from '@/app'
import * as taskRepository from '@/repositories/taskRepository'

describe('app', () => {
	const app = createApp()

	beforeEach(async () => {
		await taskRepository.clear()
	})

	it('returns health status', async () => {
		const response = await request(app).get('/api/health').expect(200)

		assert.equal(response.body.status, 'ok')
		assert.ok(response.body.requestId)
	})

	it('creates a task', async () => {
		const response = await request(app)
			.post('/api/tasks')
			.send({ title: 'Write tests', priority: 'high' })
			.expect(201)

		assert.equal(response.body.data.title, 'Write tests')
		assert.equal(response.body.data.priority, 'high')
		assert.ok(response.body.data.id)
	})

	it('returns validation error in API format', async () => {
		const response = await request(app)
			.post('/api/tasks')
			.send({ title: 'Bad task', priority: 'urgent' })
			.set('x-request-id', 'b1f2c3d4')
			.expect(400)

		assert.deepEqual(response.body, {
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Некорректные данные запроса',
				details: [{ field: 'priority', message: 'Недопустимое значение' }],
				requestId: 'b1f2c3d4',
			},
		})
	})
})

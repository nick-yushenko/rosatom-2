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

	it('creates a request', async () => {
		const response = await request(app)
			.post('/api/requests')
			.send({ title: 'Write tests', priority: 'high' })
			.expect(201)

		assert.equal(response.body.data.title, 'Write tests')
		assert.equal(response.body.data.priority, 'high')
		assert.ok(response.body.data.id)
	})
})

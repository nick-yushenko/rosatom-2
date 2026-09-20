import crypto from 'node:crypto'

import { NotFoundError } from '@/errors/NotFoundError'
import * as taskRepository from '@/repositories/taskRepository'
import type { CreateTaskDto, Task } from '@/types/task'

export async function getTasks() {
	return taskRepository.findAll()
}

export async function getTaskById(id: string) {
	const task = await taskRepository.findById(id)

	if (!task) {
		throw new NotFoundError('Задача не найдена')
	}

	return task
}

export async function createTask(data: CreateTaskDto): Promise<Task> {
	const task = {
		id: crypto.randomUUID(),
		title: data.title.trim(),
		priority: data.priority || 'medium',
		createdAt: new Date().toISOString(),
	}

	return taskRepository.create(task)
}

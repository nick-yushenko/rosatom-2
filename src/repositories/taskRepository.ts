import type { Task } from '@/types/task'

const tasks = new Map<string, Task>()

export async function findAll() {
	return Array.from(tasks.values())
}

export async function findById(id: string) {
	return tasks.get(id) || null
}

export async function create(task: Task) {
	tasks.set(task.id, task)
	return task
}

export async function clear() {
	tasks.clear()
}

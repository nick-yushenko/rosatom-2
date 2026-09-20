export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
	id: string
	title: string
	priority: TaskPriority
	createdAt: string
}

export interface CreateTaskDto {
	title: string
	priority?: TaskPriority
}

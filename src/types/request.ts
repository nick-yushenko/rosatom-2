export const requestPriorities = ['low', 'medium', 'high', 'critical'] as const
export const requestStatuses = ['new', 'in_progress', 'done', 'rejected'] as const

export type RequestPriority = (typeof requestPriorities)[number]
export type RequestStatus = (typeof requestStatuses)[number]

export interface MaintenanceRequest {
	id: string
	equipmentId: string
	title: string
	description?: string
	priority: RequestPriority
	status: RequestStatus
	plannedAt: string
	createdAt: string
	updatedAt: string
}

export type CreateMaintenanceRequestDto = Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateMaintenanceRequestDto = Partial<
	Omit<MaintenanceRequest, 'id' | 'equipmentId' | 'status' | 'createdAt' | 'updatedAt'>
>

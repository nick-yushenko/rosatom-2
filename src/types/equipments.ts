export const equipmentTypes = ['turbine', 'inverter', 'sensor', 'substation'] as const
export const equipmentStatuses = ['operational', 'maintenance', 'fault', 'decommissioned'] as const

export type EquipmentType = (typeof equipmentTypes)[number]
export type EquipmentStatus = (typeof equipmentStatuses)[number]

export interface Equipment {
	id: string
	name: string
	type: EquipmentType
	serialNumber: string
	location: { lat: number; lon: number }
	status: EquipmentStatus
	installedAt: string
}

export type CreateEquipmentDto = Omit<Equipment, 'id'>
export type UpdateEquipmentDto = Partial<Omit<Equipment, 'id'>>

import { config } from '@/config/env'
import { fetchForecast, WeatherForecast, WeatherForecastDay } from '@/clients/weatherClient'
import * as equipmentService from '@/services/equipmentService'

type SuitabilityRules = typeof config.weather.suitability

type SuitabilityReason = {
	date: string
	message: string
}

function getDaySuitabilityReasons(day: WeatherForecastDay, rules: SuitabilityRules) {
	const reasons: SuitabilityReason[] = []

	if (day.temperatureMinC < rules.minTemperatureC) {
		reasons.push({
			date: day.date,
			message: `Минимальная температура ниже ${rules.minTemperatureC}°C`,
		})
	}

	if (day.temperatureMaxC > rules.maxTemperatureC) {
		reasons.push({
			date: day.date,
			message: `Максимальная температура выше ${rules.maxTemperatureC}°C`,
		})
	}

	if (day.windSpeedMaxMs > rules.maxWindSpeedMs) {
		reasons.push({
			date: day.date,
			message: `Скорость ветра выше ${rules.maxWindSpeedMs} м/с`,
		})
	}

	if (day.precipitationMm > rules.maxPrecipitationMm) {
		reasons.push({
			date: day.date,
			message: `Осадки выше ${rules.maxPrecipitationMm} мм`,
		})
	}

	return reasons
}

function evaluateSuitability(forecast: WeatherForecast) {
	const rules = config.weather.suitability
	const reasons = forecast.days.flatMap((day) => getDaySuitabilityReasons(day, rules))

	return {
		isSuitable: reasons.length === 0,
		rules,
		reasons,
	}
}

export async function getEquipmentWeatherById(id: string) {
	const equipment = await equipmentService.getEquipmentById(id)
	const forecast = await fetchForecast(equipment.location)

	return {
		equipment: {
			id: equipment.id,
			name: equipment.name,
			location: equipment.location,
		},
		forecast,
		suitability: evaluateSuitability(forecast),
	}
}

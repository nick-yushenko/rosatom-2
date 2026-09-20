# Equipment API

API-сервис на Express 5 + TypeScript для работы с оборудованием. Данные хранятся в JSON-файле.

## Запуск проекта

```bash
npm install
cp .env.example .env
cp data/db.example.json data/db.json
npm run dev
```

Команды:

```bash
npm run dev
npm run build
npm start
npm test
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Переменные окружения

| Переменная | Описание | Значение по умолчанию |
| --- | --- | --- |
| `NODE_ENV` | Окружение запуска | `development` |
| `PORT` | Порт сервера | `3000` |
| `CORS_ORIGIN` | Разрешенный origin для CORS | `*` |
| `LOG_LEVEL` | Уровень логирования | `info` |

## Таблица эндпоинтов

| Метод | Путь | Что делает |
| --- | --- | --- |
| `GET` | `/api/health` | Проверяет состояние API |
| `GET` | `/api/equipment` | Возвращает список оборудования с фильтрацией, сортировкой и пагинацией |
| `GET` | `/api/equipment/:id` | Возвращает оборудование по id |
| `POST` | `/api/equipment` | Создает оборудование |
| `PATCH` | `/api/equipment/:id` | Частично обновляет оборудование |
| `DELETE` | `/api/equipment/:id` | Удаляет оборудование |

## Модель оборудования

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"name": "Турбина Т-100",
	"type": "turbine",
	"serialNumber": "TUR-100-001",
	"location": {
		"lat": 55.751244,
		"lon": 37.618423
	},
	"status": "operational",
	"installedAt": "2024-05-10T09:00:00.000Z"
}
```

Допустимые `type`: `turbine`, `inverter`, `sensor`, `substation`.

Допустимые `status`: `operational`, `maintenance`, `fault`, `decommissioned`.

## GET /api/equipment

Пример запроса:

```http
GET /api/equipment?status=operational&type=turbine&page=1&limit=20&sortBy=name&sortOrder=asc
```

Query-параметры:

| Параметр | Описание | Пример |
| --- | --- | --- |
| `status` | Фильтр по статусу | `operational` |
| `type` | Фильтр по типу | `turbine` |
| `installedFrom` | Дата установки от | `2024-01-01T00:00:00.000Z` |
| `installedTo` | Дата установки до | `2025-12-31T23:59:59.999Z` |
| `page` | Номер страницы | `1` |
| `limit` | Количество записей на странице, максимум `100` | `20` |
| `sortBy` | Поле сортировки: `name`, `type`, `status`, `installedAt` | `name` |
| `sortOrder` | Направление сортировки: `asc` или `desc` | `asc` |

Пример ответа:

```json
{
	"data": [
		{
			"id": "550e8400-e29b-41d4-a716-446655440000",
			"name": "Турбина Т-100",
			"type": "turbine",
			"serialNumber": "TUR-100-001",
			"location": {
				"lat": 55.751244,
				"lon": 37.618423
			},
			"status": "operational",
			"installedAt": "2024-05-10T09:00:00.000Z"
		}
	],
	"pagination": {
		"page": 1,
		"limit": 20,
		"total": 1,
		"totalPages": 1
	}
}
```

## GET /api/equipment/:id

```http
GET /api/equipment/550e8400-e29b-41d4-a716-446655440000
```

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"name": "Турбина Т-100",
		"type": "turbine",
		"serialNumber": "TUR-100-001",
		"location": {
			"lat": 55.751244,
			"lon": 37.618423
		},
		"status": "operational",
		"installedAt": "2024-05-10T09:00:00.000Z"
	}
}
```

## POST /api/equipment

```http
POST /api/equipment
Content-Type: application/json
```

```json
{
	"name": "Турбина Т-100",
	"type": "turbine",
	"serialNumber": "TUR-100-001",
	"location": {
		"lat": 55.751244,
		"lon": 37.618423
	},
	"status": "operational",
	"installedAt": "2024-05-10T09:00:00.000Z"
}
```

Ответ:

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"name": "Турбина Т-100",
		"type": "turbine",
		"serialNumber": "TUR-100-001",
		"location": {
			"lat": 55.751244,
			"lon": 37.618423
		},
		"status": "operational",
		"installedAt": "2024-05-10T09:00:00.000Z"
	}
}
```

## PATCH /api/equipment/:id

```http
PATCH /api/equipment/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

```json
{
	"status": "maintenance",
	"name": "Турбина Т-100 обновленная"
}
```

Ответ:

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"name": "Турбина Т-100 обновленная",
		"type": "turbine",
		"serialNumber": "TUR-100-001",
		"location": {
			"lat": 55.751244,
			"lon": 37.618423
		},
		"status": "maintenance",
		"installedAt": "2024-05-10T09:00:00.000Z"
	}
}
```

В `PATCH` нужно передать хотя бы одно поле для обновления. Поле `id` не обновляется.

## DELETE /api/equipment/:id

```http
DELETE /api/equipment/550e8400-e29b-41d4-a716-446655440000
```

Успешный ответ:

```http
204 No Content
```

## Формат ошибки

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Некорректные данные запроса",
		"details": [
			{
				"field": "status",
				"message": "Недопустимый статус оборудования"
			}
		],
		"requestId": "b1f2c3d4"
	}
}
```

## Примеры ошибочных ответов

Некорректный статус:

```http
GET /api/equipment?status=broken&page=1&limit=20
```

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Некорректные данные запроса",
		"details": [
			{
				"field": "status",
				"message": "Недопустимый статус оборудования"
			}
		],
		"requestId": "b1f2c3d4"
	}
}
```

Оборудование не найдено:

```json
{
	"error": {
		"code": "NOT_FOUND",
		"message": "Оборудование не найдено",
		"details": [],
		"requestId": "b1f2c3d4"
	}
}
```

Серийный номер уже существует:

```json
{
	"error": {
		"code": "CONFLICT",
		"message": "Оборудование с таким серийным номером уже существует",
		"details": [
			{
				"field": "serialNumber",
				"message": "Серийный номер должен быть уникальным"
			}
		],
		"requestId": "b1f2c3d4"
	}
}
```

## Переходы статусов

Пока ограничения на переходы между статусами не реализованы. Оборудованию можно задать любой допустимый статус:

- `operational`
- `maintenance`
- `fault`
- `decommissioned`

Раздел будет дополнен после добавления бизнес-правил.

## Правила безопасности

- Заголовки безопасности подключены через `helmet`.
- CORS настраивается через `CORS_ORIGIN`.
- Тело запроса принимается в формате JSON через `express.json()`.
- Лимит пагинации: `limit` не больше `100`.
- Rate limit пока не реализован.

## Хранение данных

Данные хранятся в файле:

```txt
data/db.json
```

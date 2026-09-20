# Equipment API

API-сервис на Express 5 + TypeScript для учета оборудования и заявок на ремонт. Данные хранятся в JSON-файле.

## Запуск проекта

```bash
npm install
cp .env.example .env
cp data/db.example.json data/db.json
npm run dev
```

По умолчанию API доступен по адресу:

```txt
http://localhost:3000
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

Пример окружения хранится в `.env.example`.

| Переменная                     | Описание                                               | Значение по умолчанию                    |
| ------------------------------ | ------------------------------------------------------ | ---------------------------------------- |
| `NODE_ENV`                     | Окружение запуска                                      | `development`                            |
| `PORT`                         | Порт сервера                                           | `3000`                                   |
| `CORS_ORIGIN`                  | Разрешенный origin для CORS                            | `http://localhost:5173`                  |
| `LOG_LEVEL`                    | Уровень логирования                                    | `info`                                   |
| `WEATHER_FORECAST_API_URL`     | URL API прогноза погоды                                | `https://api.open-meteo.com/v1/forecast` |
| `WEATHER_FORECAST_DAYS`        | Количество дней прогноза                               | `3`                                      |
| `WEATHER_API_TIMEOUT_MS`       | Таймаут запроса к погодному API в миллисекундах        | `5000`                                   |
| `WEATHER_MIN_TEMPERATURE_C`    | Минимальная температура для пригодности работ          | `-15`                                    |
| `WEATHER_MAX_TEMPERATURE_C`    | Максимальная температура для пригодности работ         | `25`                                     |
| `WEATHER_MAX_WIND_SPEED_MS`    | Максимальная скорость ветра для пригодности работ, м/с | `3`                                      |
| `WEATHER_MAX_PRECIPITATION_MM` | Максимальные осадки для пригодности работ, мм          | `1`                                      |

## Таблица эндпоинтов

| Метод    | Путь                          | Что делает                                                                |
| -------- | ----------------------------- | ------------------------------------------------------------------------- |
| `GET`    | `/api/health`                 | Проверяет состояние API                                                   |
| `GET`    | `/api/equipment`              | Возвращает список оборудования с фильтрацией, сортировкой и пагинацией    |
| `GET`    | `/api/equipment/:id`          | Возвращает оборудование по id                                             |
| `GET`    | `/api/equipment/:id/weather`  | Возвращает прогноз погоды по координатам оборудования и пригодность работ |
| `GET`    | `/api/equipment/:id/requests` | Возвращает заявки, связанные с оборудованием                              |
| `POST`   | `/api/equipment`              | Создает оборудование                                                      |
| `PATCH`  | `/api/equipment/:id`          | Частично обновляет оборудование                                           |
| `DELETE` | `/api/equipment/:id`          | Удаляет оборудование                                                      |
| `GET`    | `/api/requests`               | Возвращает список заявок с фильтрацией, сортировкой и пагинацией          |
| `GET`    | `/api/requests/:id`           | Возвращает заявку по id                                                   |
| `POST`   | `/api/requests`               | Создает заявку на ремонт                                                  |
| `PATCH`  | `/api/requests/:id`           | Частично обновляет заявку                                                 |
| `PATCH`  | `/api/requests/:id/status`    | Меняет статус заявки по правилам переходов                                |
| `DELETE` | `/api/requests/:id`           | Удаляет заявку                                                            |

## Модели данных

### Equipment

```json
{
	"id": "f1fd5a7b-135a-4356-88b4-7d515194745d",
	"name": "Ветрогенератор ВГ-03",
	"type": "turbine",
	"serialNumber": "WG-2046-1111",
	"location": {
		"lat": 47.2357,
		"lon": 39.7015
	},
	"status": "operational",
	"installedAt": "2025-06-10T09:00:00.000Z"
}
```

Допустимые `type`: `turbine`, `inverter`, `sensor`, `substation`.

Допустимые `status`: `operational`, `maintenance`, `fault`, `decommissioned`.

### MaintenanceRequest

```json
{
	"id": "f06cb709-caeb-4578-89de-8eed78b2da90",
	"equipmentId": "f1fd5a7b-135a-4356-88b4-7d515194745d",
	"title": "Проверить оборудование",
	"description": "Плановая заявка на диагностику оборудования",
	"priority": "medium",
	"status": "new",
	"plannedAt": "2026-10-01T09:00:00.000Z",
	"createdAt": "2026-09-20T18:11:56.874Z",
	"updatedAt": "2026-09-20T18:11:56.874Z"
}
```

Допустимые `priority`: `low`, `medium`, `high`, `critical`.

Допустимые `status`: `new`, `in_progress`, `done`, `rejected`.

## Переходы статусов

Для оборудования ограничений на переходы нет: можно установить любой допустимый `status`.

Для заявок действуют правила:

| Текущий статус | Разрешенные следующие статусы |
| -------------- | ----------------------------- |
| `new`          | `in_progress`, `rejected`     |
| `in_progress`  | `done`, `rejected`            |
| `done`         | нет                           |
| `rejected`     | нет                           |

Недопустимый переход возвращает `409 CONFLICT`.

## Формат ошибок

Все управляемые ошибки возвращаются в едином формате:

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

Основные коды:

| HTTP-статус | `error.code`          | Когда возникает                           |
| ----------- | --------------------- | ----------------------------------------- |
| `400`       | `VALIDATION_ERROR`    | Невалидные параметры, тело или UUID       |
| `400`       | `INVALID_JSON`        | Некорректный JSON в теле запроса          |
| `404`       | `NOT_FOUND`           | Запись или маршрут не найдены             |
| `409`       | `CONFLICT`            | Конфликт бизнес-правил                    |
| `429`       | `RATE_LIMIT_EXCEEDED` | Превышен лимит запросов                   |
| `502/504`   | `WEATHER_API_ERROR`   | Ошибка или таймаут внешнего погодного API |
| `500`       | `INTERNAL_ERROR`      | Непредвиденная ошибка сервера             |

В текущей реализации ошибки валидации возвращаются со статусом `400`. Если в проверочных критериях отдельно указан `422`, он относится к тому же классу негативных сценариев валидации.

## Примеры запросов и ответов

### GET /api/health

```http
GET /api/health
```

```json
{
	"status": "ok",
	"requestId": "b1f2c3d4"
}
```

### GET /api/equipment

```http
GET /api/equipment?status=operational&type=turbine&page=1&limit=20&sortBy=name&sortOrder=asc
```

Query-параметры:

| Параметр        | Описание                                                 | Пример                     |
| --------------- | -------------------------------------------------------- | -------------------------- |
| `status`        | Фильтр по статусу оборудования                           | `operational`              |
| `type`          | Фильтр по типу оборудования                              | `turbine`                  |
| `installedFrom` | Дата установки от                                        | `2024-01-01T00:00:00.000Z` |
| `installedTo`   | Дата установки до                                        | `2026-12-31T23:59:59.999Z` |
| `page`          | Номер страницы                                           | `1`                        |
| `limit`         | Количество записей на странице, максимум `100`           | `20`                       |
| `sortBy`        | Поле сортировки: `name`, `type`, `status`, `installedAt` | `name`                     |
| `sortOrder`     | Направление сортировки: `asc` или `desc`                 | `asc`                      |

```json
{
	"data": [
		{
			"id": "f1fd5a7b-135a-4356-88b4-7d515194745d",
			"name": "Ветрогенератор ВГ-03",
			"type": "turbine",
			"serialNumber": "WG-2046-1111",
			"location": {
				"lat": 47.2357,
				"lon": 39.7015
			},
			"status": "operational",
			"installedAt": "2025-06-10T09:00:00.000Z"
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

### GET /api/equipment/:id

```http
GET /api/equipment/f1fd5a7b-135a-4356-88b4-7d515194745d
```

```json
{
	"data": {
		"id": "f1fd5a7b-135a-4356-88b4-7d515194745d",
		"name": "Ветрогенератор ВГ-03",
		"type": "turbine",
		"serialNumber": "WG-2046-1111",
		"location": {
			"lat": 47.2357,
			"lon": 39.7015
		},
		"status": "operational",
		"installedAt": "2025-06-10T09:00:00.000Z"
	}
}
```

### GET /api/equipment/:id/weather

Ручка берет координаты из `location`, запрашивает внешний погодный API и возвращает пригодность работ.

```http
GET /api/equipment/f1fd5a7b-135a-4356-88b4-7d515194745d/weather
```

```json
{
	"data": {
		"equipment": {
			"id": "f1fd5a7b-135a-4356-88b4-7d515194745d",
			"name": "Ветрогенератор ВГ-03",
			"location": {
				"lat": 47.2357,
				"lon": 39.7015
			}
		},
		"forecast": {
			"latitude": 47.24,
			"longitude": 39.7,
			"timezone": "Europe/Moscow",
			"days": [
				{
					"date": "2026-09-20",
					"temperatureMinC": 10.2,
					"temperatureMaxC": 18.7,
					"precipitationMm": 0.4,
					"windSpeedMaxMs": 2.5
				}
			]
		},
		"suitability": {
			"isSuitable": true,
			"rules": {
				"minTemperatureC": -15,
				"maxTemperatureC": 25,
				"maxWindSpeedMs": 3,
				"maxPrecipitationMm": 1
			},
			"reasons": []
		}
	}
}
```

### POST /api/equipment

```http
POST /api/equipment
Content-Type: application/json
```

```json
{
	"name": "Тестовая турбина",
	"type": "turbine",
	"serialNumber": "TUR-100-001",
	"location": {
		"lat": 55.751244,
		"lon": 37.618423
	},
	"status": "operational",
	"installedAt": "2026-01-10T09:00:00.000Z"
}
```

Успешный ответ: `201 Created`.

### PATCH /api/equipment/:id

```http
PATCH /api/equipment/f1fd5a7b-135a-4356-88b4-7d515194745d
Content-Type: application/json
```

```json
{
	"status": "maintenance",
	"name": "Ветрогенератор ВГ-03 обновленный"
}
```

В `PATCH` нужно передать хотя бы одно поле. Поле `id` не обновляется.

### DELETE /api/equipment/:id

```http
DELETE /api/equipment/f1fd5a7b-135a-4356-88b4-7d515194745d
```

Успешный ответ: `204 No Content`.

Если у оборудования есть активные заявки, API вернет `409 CONFLICT`.

### GET /api/requests

```http
GET /api/requests?status=new&priority=high&page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

Query-параметры:

| Параметр      | Описание                                                                     | Пример                                 |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| `status`      | Фильтр по статусу заявки                                                     | `new`                                  |
| `priority`    | Фильтр по приоритету                                                         | `high`                                 |
| `equipmentId` | Фильтр по id оборудования                                                    | `f1fd5a7b-135a-4356-88b4-7d515194745d` |
| `dateFrom`    | Дата создания от                                                             | `2026-09-01T00:00:00.000Z`             |
| `dateTo`      | Дата создания до                                                             | `2026-09-30T23:59:59.999Z`             |
| `page`        | Номер страницы                                                               | `1`                                    |
| `limit`       | Количество записей на странице, максимум `100`                               | `20`                                   |
| `sortBy`      | Поле сортировки: `createdAt`, `updatedAt`, `plannedAt`, `priority`, `status` | `createdAt`                            |
| `sortOrder`   | Направление сортировки: `asc` или `desc`                                     | `desc`                                 |

### POST /api/requests

```http
POST /api/requests
Content-Type: application/json
```

```json
{
	"equipmentId": "f1fd5a7b-135a-4356-88b4-7d515194745d",
	"title": "Проверка через API",
	"description": "Плановая диагностика оборудования",
	"priority": "high",
	"plannedAt": "2027-01-15T10:00:00.000Z"
}
```

Успешный ответ: `201 Created`. Новая заявка создается со статусом `new`.

### PATCH /api/requests/:id/status

```http
PATCH /api/requests/f06cb709-caeb-4578-89de-8eed78b2da90/status
Content-Type: application/json
```

```json
{
	"status": "in_progress"
}
```

### PATCH /api/requests/:id

```http
PATCH /api/requests/f06cb709-caeb-4578-89de-8eed78b2da90
Content-Type: application/json
```

```json
{
	"title": "Срочная проверка через API",
	"priority": "critical",
	"plannedAt": "2027-01-16T10:00:00.000Z"
}
```

### DELETE /api/requests/:id

```http
DELETE /api/requests/f06cb709-caeb-4578-89de-8eed78b2da90
```

Успешный ответ: `204 No Content`.

## Негативные сценарии

### 400/422: ошибка валидации

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
				"message": "Invalid option: expected one of \"operational\"|\"maintenance\"|\"fault\"|\"decommissioned\""
			}
		],
		"requestId": "b1f2c3d4"
	}
}
```

### 400: некорректный JSON

```json
{
	"error": {
		"code": "INVALID_JSON",
		"message": "Некорректный JSON в теле запроса",
		"details": [
			{
				"field": "body",
				"message": "Проверьте, что ключи и строки написаны в двойных кавычках"
			}
		],
		"requestId": "b1f2c3d4"
	}
}
```

### 404: запись не найдена

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

### 409: конфликт

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

Еще один пример `409`: недопустимый переход статуса заявки, например `new` -> `done`.

### 429: превышен лимит запросов

Лимит API: `100` запросов за `15` минут на маршруты `/api`.

```json
{
	"error": {
		"code": "RATE_LIMIT_EXCEEDED",
		"message": "Слишком много запросов",
		"details": [],
		"requestId": "b1f2c3d4"
	}
}
```

## Postman

Коллекция для импорта:

```txt
docs/postman/equipment-api.postman_collection.json
```

В коллекции заданы переменные:

| Переменная             | Значение по умолчанию                  |
| ---------------------- | -------------------------------------- |
| `baseUrl`              | `http://localhost:3000`                |
| `equipmentId`          | `f1fd5a7b-135a-4356-88b4-7d515194745d` |
| `requestId`            | `f06cb709-caeb-4578-89de-8eed78b2da90` |
| `existingSerialNumber` | `WG-2046-1111`                         |

Перед запуском коллекции поднимите сервер и убедитесь, что `data/db.json` создан из `data/db.example.json`.

## Правила безопасности и ограничения

- Заголовки безопасности подключены через `helmet`.
- CORS настраивается через `CORS_ORIGIN`.
- Тело запроса принимается в формате JSON через `express.json()`.
- Лимит запросов: `100` запросов за `15` минут на маршруты `/api`.
- Лимит пагинации: `limit` не больше `100`.

## Хранение данных

Данные хранятся в файле:

```txt
data/db.json
```

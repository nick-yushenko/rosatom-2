# Express 5 TypeScript Skeleton

Скелет API-приложения на Express 5 + TypeScript.

## Структура

- `src/routes`
- `src/controllers`
- `src/services`
- `src/repositories`
- `src/validators`
- `src/middlewares`
- `src/errors`
- `src/logs`
- `test`

## Установка

```bash
npm install
cp .env.example .env
```

## Команды

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

Импорты из `src` можно писать через alias `@`:

```ts
import { logger } from '@/logs/logger'
```

## API

- `GET /api/health`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`

Пример ошибки:

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Некорректные данные запроса",
		"details": [{ "field": "priority", "message": "Недопустимое значение" }],
		"requestId": "b1f2c3d4"
	}
}
```

Хранение данных
JSON-хранилище
data/db.json

Для копирования примера БД, перед первым запуском

```bash
cp data/db.example.json data/db.json
```

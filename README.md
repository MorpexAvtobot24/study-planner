# Study Planner

Навчальний React 19 + TypeScript застосунок для роботи зі списком завдань через REST API, API layer та Repository Pattern.

## Запуск

1. Встановіть залежності: `npm install`
2. Перевірте `.env` (приклад конфігурації у `.env.example`).
3. Запустіть застосунок: `npm run dev`

Для перевірок використовуйте `npm run lint` та `npm run build`.

Застосунок працює з DummyJSON `/todos`. API цього сервісу імітує POST/PATCH/DELETE і не зберігає зміни; створені й оновлені задачі підтримуються у клієнтському стані поточної сесії.

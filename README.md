# MAX Chat + GREEN-API

Тестовый проект на React + TypeScript для позиции Frontend Developer.

## Структура

```text
src/
├── api/           # client.ts, greenApi.ts, types.ts
├── features/
│   ├── auth/      # SetupScreen, useConnection, useCredentials
│   ├── chat/      # components, hooks, emoji, utils
│   └── settings/
├── shared/        # constants, hooks, types, utils
├── tests/         # fixtures.ts, mocks.ts, setup.ts
├── App.tsx
└── main.tsx
```
## Скриншоты
<img width="1440" height="855" alt="Screenshot 2026-09-26 at 19 36 44" src="https://github.com/user-attachments/assets/287175ad-8a93-4c87-8135-06b6a3c1cf61" />
<img width="1440" height="855" alt="Screenshot 2026-09-26 at 19 39 16" src="https://github.com/user-attachments/assets/5b0a22f3-7dc3-45a7-9976-e2a890999830" />

## Архитектура

**API** — компоненты не работают напрямую с `fetch`. Файл `client.ts` отвечает за формирование URL, кодирование credentials, query-параметры, `AbortSignal`, обработку ответов и ошибок. `greenApi.ts` содержит типизированные методы API.

**Features** — логика чата разделена между hooks и вспомогательными функциями. API DTO преобразуются в доменные типы через mapper.

**Types** — используется strict TypeScript. Типы API и доменные типы разделены.

## Основные возможности

* Оптимистическая отправка сообщений: `sending → sent` / `sending → failed`
* Long polling GREEN-API с отменой запросов и удалением обработанных уведомлений
* Защита от race conditions при подключении и загрузке истории
* Объединение сообщений по `id`
* Emoji picker с вставкой в позицию курсора

## Стек

React 19, TypeScript, Vite 8, Vitest 5, React Testing Library.

## Локальный запуск

Требуется Node.js 24.18.0.

```bash
npm install
npm run dev
```

После запуска приложение будет доступно по адресу:

```text
http://localhost:5173
```

## Сборка

```bash
npm run build
npm run preview
```

`npm run build` сначала выполняет проверку TypeScript, затем запускает production-сборку Vite.

## Тесты

```bash
npm test
npm run test:run
npm run test:ui
```

Примеры запуска отдельных тестов:

```bash
npx vitest run src/api/client.test.ts
npx vitest run -t "addMessage"
```

Тесты покрывают:

* `client.test.ts` — URL, encoding, query-параметры, GET/POST/DELETE, ответы и ошибки
* `useConnection.test.ts` — состояния подключения, ошибки и `connecting`
* `useCredentials.test.ts` — чтение, сохранение и очистку credentials
* `useChat.test.ts` — загрузку истории, ошибки, reload, отправку и `addMessage`
* `messageMappers.test.ts` — преобразование и фильтрацию сообщений

Общие fixtures и API mocks находятся в `src/tests/`.

## Деплой

Онлайн-версия:

https://max-green.netlify.app/

Настройки Netlify:

```text
Build command: npm run build
Publish directory: dist
```

## GREEN-API

Используемые методы:

`getStateInstance`, `setSettings`, `sendMessage`, `receiveNotification`, `deleteNotification`, `getChatHistory`.

Backend не используется. Credentials хранятся в `localStorage`.

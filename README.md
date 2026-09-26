# MAX Chat + GREEN-API

React + TypeScript test project for a Frontend Developer position.

## Stack

React 19, TypeScript, Vite 8, Vitest 5, React Testing Library.

## Structure

```text
src/
├── api/           # client.ts, greenApi.ts, types.ts
├── features/
│   ├── auth/      # SetupScreen, useConnection, useCredentials
│   ├── chat/      # components, hooks, emoji, utils
│   └── settings/
├── sheared/       # constants, hooks, types, utils
├── tests/         # fixtures.ts, mocks.ts, setup.ts
├── App.tsx
└── main.tsx
```

## Architecture

**API** — components never call `fetch`. `client.ts` handles URL building, credentials encoding, query params, `AbortSignal`, response parsing and errors. `greenApi.ts` provides typed API methods.

**Features** — chat logic is separated into hooks and utilities. API DTOs are mapped to domain types.

**Types** — strict TypeScript with separate API and domain types.

## Main Behaviors

* Optimistic message sending: `sending → sent` / `sending → failed`
* GREEN-API long polling with request cancellation and notification deletion
* Race protection for connection and chat history requests
* Message merging by `id`
* Emoji picker with cursor-position insertion

## Run

Node.js 24.18.0

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

`build` runs TypeScript checking before Vite build.

## Test

```bash
npm test
npm run test:run
npm run test:ui
```

Examples:

```bash
npx vitest run src/api/client.test.ts
npx vitest run -t "addMessage"
```

Tests cover API client, connection, credentials, chat logic and message mapping.

Fixtures and API mocks are located in `src/tests/`.

## Deploy

Live demo:

[https://max-green.netlify.app/](https://max-green.netlify.app/?utm_source=chatgpt.com)

Netlify:

```text
Build command: npm run build
Publish directory: dist
```

## GREEN-API

Used methods:

`getStateInstance`, `setSettings`, `sendMessage`, `receiveNotification`, `deleteNotification`, `getChatHistory`.

Credentials are stored in `localStorage`. No backend is used.

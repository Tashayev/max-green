# MAX Chat + GREEN-API

React + TypeScript test project for a Frontend Developer position.

## Architecture

The project is intentionally split by responsibility:

```text
src/
├── api/
│   ├── client.ts
│   ├── greenApi.ts
│   └── types.ts
├── features/
│   ├── auth/
│   ├── chat/
│   │   ├── components/
│   │   ├── emoji/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── utils/
│   └── settings/
├── hooks/
├── types/
├── App.tsx
└── main.tsx
```

### API layer

React components never call `fetch` directly.

`api/client.ts` contains the HTTP transport.

`api/greenApi.ts` contains GREEN-API methods and DTO types.

### Feature layer

Chat logic is isolated in:

- `useChat`
- `useNotifications`
- `messageMappers`
- `MessageList`
- `MessageBubble`
- `MessageComposer`
- `EmojiPicker`

### TypeScript

The project uses strict TypeScript.

API DTOs and application/domain models are separated.

GREEN-API response objects are converted to internal `Message` objects through a mapper.

### Emoji picker

Emoji data is outside the UI component.

The picker supports categories, click-outside behavior and keyboard-friendly buttons.

Emoji insertion uses textarea selection, so an emoji is inserted at the current cursor position instead of simply being appended.

### Notifications

Incoming messages use GREEN-API HTTP API long polling.

A request is aborted when the feature is unmounted or credentials change.

Processed notifications are deleted after handling.

The polling loop is scheduled recursively instead of creating overlapping intervals.

### Optimistic sending

Outgoing messages appear immediately with:

```text
sending -> sent
```

If the API request fails:

```text
sending -> failed
```

This keeps the UI responsive while still exposing the request state.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## GREEN-API

The implementation uses:

- `getStateInstance`
- `setSettings`
- `sendMessage`
- `receiveNotification`
- `deleteNotification`
- `getChatHistory`

The test project intentionally has no backend. Credentials are stored locally in the browser.

For a real production system, API credentials should normally be protected behind a backend/BFF rather than exposed directly to the browser.

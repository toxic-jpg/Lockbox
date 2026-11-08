# Project name

A local-first password vault and generator — encrypted keys, strength scoring, and cross-device sync-ready. Three surfaces: **web**, **mobile** (Expo/React Native), and **API server**.

All data stays in your browser/device by default (IndexedDB + Expo AsyncStorage). Cloud sync is opt-in through the API layer.

## Features

- 🔐 **Local-first encryption** — AES-GCM with client-side key derivation; your master PIN never leaves the device
- 📊 **Strength metering** — zxcvbn-powered entropy scoring with visual feedback
- 🔀 **Password generator** — configurable charset, length, ambiguity/similarity exclusion, memorable word lists
- 🔄 **Bulk operations** — copy, delete, tag entries across multiple selections at once
- 🌙 **Dark/light theme** — system-aware appearance context with smooth transitions
- 📱 **Mobile & web parity** — same crypto, same vault format, same UX patterns

## Stack

| Layer | Tech |
|-------|------|
| Mobile | Expo ~54 · React Native · expo-router |
| Web | Vite · React · shadcn/ui · Tailwind · Dexie (IndexedDB) |
| API | Express 5 · pino logging · Zod validation |
| Shared | Orval (OpenAPI → typed clients) · Drizzle ORM · esbuild |

## Quick Start

```bash
# Install all workspace dependencies
pnpm install

# Run the web vault
pnpm --filter @workspace/password-vault run dev

# Run the mobile app (requires Expo CLI)
pnpm --filter @workspace/lockbox-mobile run dev

# Run the API server
pnpm --filter @workspace/api-server run dev
```

Type-check everything: `pnpm run typecheck`
Build production: `pnpm run build`

## Architecture

```
artifacts/
  lockbox-mobile/   # Expo app – PIN lock, vault grid, generator
  password-vault/   # React web app – dashboard, password list, settings
  api-server/       # Express REST API – entry CRUD, bulk ops, health
  mockup-sandbox/   # Design preview (not part of shipping product)
lib/
  db/               # Drizzle schema (Postgres target for sync)
  api-spec/         # OpenAPI contract → Orval codegen
  api-zod/          # Runtime Zod validators from spec
  api-client-react/ # React Query hooks from OpenAPI
```

The API server is an optional sync layer. The web and mobile apps work fully offline with zero config.

## Development

- DB migrations: `pnpm --filter @workspace/db run push` (dev only, requires Postgres `DATABASE_URL`)
- Regenerate typed API from schema: `pnpm --filter @workspace/api-spec run codegen`
- Replit environment supported out of the box

## Security notes

- Master PIN is hashed locally; never transmitted to any server
- Vault entries are end-to-end encrypted before any network transfer
- Client-side key derivation uses PBKDF2 with per-user salts
- Audit report available in [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)

---

Built by [@toxic-jpg](https://github.com/toxic-jpg)

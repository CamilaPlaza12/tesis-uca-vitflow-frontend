# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at localhost:4200
npm run build      # Production build to dist/
npm run test       # Run unit tests with Vitest
npm run watch      # Build in watch mode (dev config)
```

No lint command is configured.

## Architecture Overview

**Angular 21** app using `AppModule` (non-standalone components). All components are declared in `AppModule` (`src/app/app-module.ts`).

### Routing

Defined in `src/app/app-routing-module.ts`. Protected routes use `canActivate: [AuthGuard]`, which checks Firebase auth state. Public routes: `/signin`, `/register`, `/backoffice`. Root and unknown routes redirect to `/signin`.

The root component (`src/app/app.ts`) listens to router events to hide/show the sidebar (hidden on auth and backoffice pages).

### Authentication

- **Firebase Auth** (`src/app/service/firebaseconfig.ts`) — `AuthService` uses `onAuthStateChanged()`
- **Inactivity auto-logout** after 120 minutes of no mouse/keyboard/scroll/touch activity
- **`AuthInterceptor`** (`src/app/interceptor/auth-token-interceptor.ts`) attaches Firebase ID tokens to all requests, retries on 401 with a forced token refresh. Skips token injection for `/hospital-onboarding` endpoints (public registration)

### API

Base URL is hardcoded as `http://localhost:8000/api/v1` across services. Services use Angular `HttpClient` with RxJS. Components sometimes convert to promises with `firstValueFrom()` for sequential async flows.

### State Management

No centralized store. Services expose `BehaviorSubject`s for shared state (e.g., `UserService.currentUserData$`). Component-level state uses Angular signals (`signal()`) and properties.

### Key Directories

- `src/app/screens/auth/` — SignIn, Register (multi-step wizard with stepper + steps)
- `src/app/screens/pages/` — Main app pages: home, bancos, turnos, pedidos-alertas, configuracion, equipos-roles
- `src/app/screens/common/` — Shared UI components (sidebar, modals, error/confirm dialogs)
- `src/app/backoffice/` — Admin area for hospital onboarding review/approval
- `src/app/service/` — All business logic and HTTP services
- `src/app/models/` — TypeScript interfaces for domain models
- `src/app/interceptor/` — HTTP interceptors

### UI Library

**PrimeNG 21** for UI components (tables, dialogs, dropdowns, calendars, icons). Styles imported globally in `src/styles.scss`. **Chart.js** for dashboard charts.

### Demo Mode

`BloodBankService` returns mock data. `StaffGuard` has a `DEMO_ALLOW = true` flag that bypasses backoffice auth — not production-ready.

### Prettier

Configured in `package.json`: `printWidth: 100`, `singleQuote: true`, Angular HTML parser for templates.

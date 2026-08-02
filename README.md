# ![Conduit](https://raw.githubusercontent.com/gothinkster/realworld/master/media/realworld.svg) — Angular Conduit

An Angular implementation of the [RealWorld](https://github.com/gothinkster/realworld) "Conduit" spec — a Medium.com clone — rebuilt on **Angular 21** using current, idiomatic Angular:

- Standalone components only (no `NgModule`)
- Zoneless change detection (no `zone.js`)
- Signals for all component/service state (`signal`, `computed`, `effect`)
- New template control flow (`@if`, `@for`, `@switch`)
- `inject()` function-based DI throughout
- Functional route guards and functional HTTP interceptors
- Typed reactive forms (`NonNullableFormBuilder`)
- Lazy-loaded, code-split routes (`loadComponent`)

## API

The app talks to the public RealWorld demo backend at `https://api.realworld.io/api` (configured in `src/app/core/api.config.ts` via an `API_URL` injection token — change it there if you want to point at a different backend implementing the [RealWorld API spec](https://realworld-docs.netlify.app/specifications/backend/)).

## Project layout

```
src/app/
  core/            # models, HTTP services, auth state, guards, interceptor
  shared/          # reusable standalone components & pipes (header, footer,
                    # article list/preview, tag list, error list, markdown pipe)
  features/        # one folder per routed page (home, auth, settings,
                    # editor, article, profile)
```

Authentication state lives in `AuthService` as a signal, persisted to `localStorage` and restored on app start via `provideAppInitializer`. The `authInterceptor` attaches the `Authorization: Token …` header to API requests, and `authGuard` protects `/settings` and `/editor`.

## Development server

```bash
npm install
ng serve
```

Then open `http://localhost:4200/`.

## Build

```bash
ng build
```

## Tests

```bash
ng test
```

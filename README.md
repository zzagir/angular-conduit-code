# Conduit — Angular 21 (RealWorld)

Это полная реализация [RealWorld](https://github.com/gothinkster/realworld) ("Conduit" — клон Medium.com) на **Angular 21**, написанная с нуля с использованием актуальных на 2026 год подходов Angular: standalone-компоненты, zoneless change detection, signals, новый синтаксис шаблонов (`@if`/`@for`), функциональные guard'ы и интерцепторы.

Проект — это фронтенд. Он ходит в публичный демо-бэкенд RealWorld (`https://api.realworld.io/api`), который реализует единый для всех клонов [API-спек](https://realworld-docs.netlify.app/specifications/backend/) (регистрация, логин, статьи, комментарии, подписки, избранное). Свой бэкенд писать не нужно — можно сразу пользоваться и регистрировать реальных пользователей на этом демо-сервере.

---

## Содержание

1. [Что это за проект и зачем он так устроен](#что-это-за-проект-и-зачем-он-так-устроен)
2. [Установка и запуск](#установка-и-запуск)
3. [Доступные команды](#доступные-команды)
4. [Структура проекта](#структура-проекта)
5. [Архитектурные решения](#архитектурные-решения-и-почему-именно-так)
6. [Разбор кода по слоям](#разбор-кода-по-слоям)
   - [core — модели, сервисы, guard, интерцептор](#core)
   - [shared — переиспользуемые компоненты](#shared)
   - [features — страницы приложения](#features)
7. [Как настроить API-адрес](#как-настроить-api-адрес)
8. [Стили и внешние ресурсы](#стили-и-внешние-ресурсы)
9. [Тестирование](#тестирование)
10. [Известные упрощения и что можно улучшить](#известные-упрощения-и-что-можно-улучшить)

---

## Что это за проект и зачем он так устроен

RealWorld — это открытый эталонный проект: одно и то же приложение "Conduit" (блог-платформа вроде Medium) реализовано десятками команд на разных фреймворках (React, Vue, Svelte, Angular и т.д.), но все они ходят в один и тот же API и должны вести себя одинаково. Смысл в том, чтобы можно было сравнивать, "как это принято делать" на конкретном фреймворке, а не выдумывать игрушечный пример.

Здесь она переписана на Angular 21 так, как её писал бы Angular-разработчик сегодня, а не так, как её писали в 2018–2020 годах (когда были обязательны `NgModule`, `*ngIf`/`*ngFor`, конструкторная инъекция и т.д.). Ключевая идея: **всё состояние — через signals, весь UI — через standalone-компоненты, никакого zone.js**.

## Установка и запуск

Требования: **Node.js 20.19+ / 22.12+ / 24+** и npm.

```bash
# 1. Установить зависимости
npm install

# 2. Запустить дев-сервер (с live reload)
npm start
# или
ng serve
```

После этого открыть **http://localhost:4200/**. Приложение автоматически перезагрузится при изменении файлов в `src/`.

Никакой backend поднимать не нужно — все запросы уходят на `https://api.realworld.io/api` (см. раздел [Как настроить API-адрес](#как-настроить-api-адрес), если нужен другой сервер).

## Доступные команды

Определены в `package.json`:

| Команда                                | Что делает                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm start` / `ng serve`               | Дев-сервер на `http://localhost:4200`, конфигурация `development` (см. `angular.json`)          |
| `npm run build` / `ng build`           | Продакшн-сборка в `dist/conduit/` (минификация, хэши в именах файлов, бюджеты на размер бандла) |
| `ng build --configuration development` | Сборка без минификации, с sourcemap — удобно для отладки собранного бандла                      |
| `npm run watch`                        | То же, что build в development-режиме, но в режиме watch                                        |
| `npm test` / `ng test`                 | Юнит-тесты на Vitest                                                                            |

## Структура проекта

```
src/
├── environments/
│   ├── environment.ts               # apiUrl для production-сборки
│   └── environment.development.ts   # apiUrl для dev-сервера / dev-сборки
├── index.html                       # шрифты, ionicons, базовый CSS Conduit — всё через CDN
├── main.ts                          # bootstrapApplication(App, appConfig)
└── app/
    ├── app.ts / app.html            # корневой компонент: <app-header> + <router-outlet> + <app-footer>
    ├── app.config.ts                 # ApplicationConfig: роутер, HttpClient, интерцептор, восстановление сессии
    ├── app.routes.ts                 # список маршрутов (все — лениво загружаемые)
    │
    ├── core/                         # то, что не относится к конкретной странице
    │   ├── api.config.ts             # InjectionToken API_URL
    │   ├── models/                   # TypeScript-интерфейсы под ответы API
    │   ├── services/                 # HTTP-обёртки над эндпоинтами RealWorld
    │   ├── guards/auth.guard.ts      # функциональный CanActivateFn
    │   └── interceptors/auth.interceptor.ts
    │
    ├── shared/                       # переиспользуемые "глупые" компоненты и пайп
    │   ├── components/header, footer, article-list, article-preview,
    │   │                 tag-list, tag-list-select, list-errors
    │   └── pipes/markdown.pipe.ts
    │
    └── features/                     # по одной папке на маршрут
        ├── home/                     # лента статей + теги
        ├── auth/login, auth/register
        ├── settings/                 # редактирование профиля, выход
        ├── editor/                   # создание/редактирование статьи
        ├── article/                  # страница статьи + комментарии
        │   ├── comment-form/
        │   └── comment-list/
        └── profile/                  # профиль пользователя, его статьи/избранное
```

Разделение `core` / `shared` / `features` — стандартный подход в Angular-проектах среднего и большого размера:

- **`core`** — сервисы и утилиты, которых в приложении по одному экземпляру (singleton, `providedIn: 'root'`), не привязаны к конкретному экрану.
- **`shared`** — компоненты и пайпы без собственного состояния/бизнес-логики, которые используются на нескольких экранах (превью статьи используется и на главной, и в профиле).
- **`features`** — всё, что относится к одному конкретному маршруту/экрану и больше нигде не переиспользуется.

## Архитектурные решения (и почему именно так)

### Standalone-компоненты, никаких `NgModule`

Каждый компонент сам объявляет свои зависимости через массив `imports` в декораторе `@Component`. Это дефолт в Angular с 17-й версии и единственный способ с 20-й — `NgModule` в новом коде уже не используется. Плюс: явно видно, какие директивы/пайпы/компоненты нужны конкретному шаблону, ничего не "протекает" из общего модуля.

### Zoneless (без `zone.js`)

В `package.json` нет зависимости `zone.js`, а в `app.config.ts` нет `provideZoneChangeDetection()`. Angular 21 по умолчанию создаёт приложение без Zone.js. Это значит, что change detection **не запускается автоматически** на любое событие/таймер/промис — вместо этого Angular следит за **signals** и точечно перерисовывает только те компоненты, чьи signals изменились.

Практическое следствие для разработчика: **всё состояние, которое должно отражаться в шаблоне, обязано быть signal'ом** (`signal()`, `computed()`), а не обычным полем класса. Именно поэтому во всех компонентах состояние объявлено как `protected readonly foo = signal(...)`, а не `foo = ...`.

### Signals вместо RxJS-состояния и `async` pipe

Раньше типичный Angular-код держал состояние в `BehaviorSubject` и разворачивал его в шаблоне через `| async`. Здесь состояние — просто `signal<T>()`, а HTTP-запросы (которые по своей природе асинхронны и остаются `Observable` из `HttpClient`) просто `.subscribe()`-ятся, и результат кладётся в signal:

```ts
protected readonly articles = signal<Article[]>([]);

this.articlesService.query(config).subscribe(({ articles }) => {
  this.articles.set(articles);
});
```

Это проще читать, чем цепочки RxJS-операторов, когда никакого сложного стрима на самом деле нет — просто "запрос → положить результат в состояние".

### Новый синтаксис шаблонов: `@if` / `@for` вместо `*ngIf` / `*ngFor`

Во всех `.html`-файлах используется блочный синтаксис (`@if (...) { } @else { }`, `@for (x of xs; track x.id) { }`). Он появился в Angular 17, не требует импортировать `CommonModule`/`NgIf`/`NgFor` и заставляет явно указывать `track` для `@for` (обязательный параметр — без него Angular не даст собраться), что защищает от типичных багов с потерей identity строк списка.

### `inject()` вместо конструктора

Везде, где раньше писали:

```ts
constructor(private http: HttpClient) {}
```

здесь написано:

```ts
private readonly http = inject(HttpClient);
```

Это позволяет объявлять поля класса в порядке, в каком они логически нужны, не тащить длинный список параметров конструктора, и (главное) `inject()` можно вызывать не только в конструкторе, но и в теле функций-фабрик (`InjectionToken`), в guard'ах-функциях и интерцепторах-функциях — что и используется ниже.

### Функциональные guard'ы и интерцепторы

`authGuard` (в `core/guards/auth.guard.ts`) и `authInterceptor` (в `core/interceptors/auth.interceptor.ts`) — это не классы, реализующие `CanActivate`/`HttpInterceptor`, а обычные функции (`CanActivateFn`, `HttpInterceptorFn`). Это текущая рекомендованная форма в Angular — меньше шаблонного кода, легче тестировать (это просто функция, которую можно вызвать напрямую).

### Типизированные reactive-формы

Все формы (логин, регистрация, настройки, редактор статьи) построены через `NonNullableFormBuilder`. Обычный `FormBuilder.group(...)` даёт полям тип `string | null`, из-за чего пришлось бы постоянно расставлять `!` или проверки на `null`. `NonNullableFormBuilder` сразу типизирует значение поля как `string` (с учётом дефолтного значения), потому что для форм в этом приложении `null` в полях никогда не нужен.

### Ленивая загрузка каждого маршрута

В `app.routes.ts` каждый маршрут — это `loadComponent: () => import(...)`, а не сразу импортированный класс. Это значит, что код `/editor` (форма редактора статьи) не попадёт в JS-бандл, который скачивает пользователь, впервые открывший главную страницу — он подгрузится отдельным чанком только когда пользователь реально перейдёт на `/editor`. Именно поэтому в выводе `ng build` видно отдельные файлы `chunk-....js | article-page`, `chunk-....js | home` и т.д.

## Разбор кода по слоям

### `core`

#### `api.config.ts`

```ts
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});
```

`InjectionToken` — стандартный Angular-способ внедрять через DI не класс, а простое значение (строку). Вместо того чтобы в каждом сервисе писать `'https://api.realworld.io/api'` руками, все сервисы делают `inject(API_URL)` — а сам адрес хранится в одном месте и переключается в зависимости от конфигурации сборки (см. [ниже](#как-настроить-api-адрес)).

#### `models/*.model.ts`

Обычные TypeScript `interface`, по одному файлу на сущность API: `User`, `Profile`, `Article`, `Comment`, плюс обёртки ответов (`ArticleResponse`, `MultipleArticlesResponse` и т.д.) — они один в один повторяют форму JSON, которую отдаёт RealWorld API, чтобы `HttpClient` мог типизировать ответ (`http.get<ArticleResponse>(...)`) без `any`.

`errors.model.ts` описывает формат ошибок валидации, которые API возвращает при 422 (`{ errors: { email: ["is invalid"] } }`) — этот формат используется в компоненте `ListErrors`.

#### `services/*.service.ts`

Четыре сервиса, каждый — тонкая обёртка над своей группой эндпоинтов, без какой-либо бизнес-логики внутри — это чисто транспортный слой:

- **`ArticlesService`** — список статей (`query`, с фильтрами `tag`/`author`/`favorited`/пагинация, и отдельно лента подписок `/articles/feed`), получение одной статьи, создание/обновление/удаление, favorite/unfavorite.
- **`ProfilesService`** — получить профиль по username, follow/unfollow.
- **`CommentsService`** — получить список комментариев статьи, добавить, удалить.
- **`TagsService`** — список всех тегов для сайдбара на главной.

Все инжектят `HttpClient` и `API_URL` через `inject()`, ничего не хранят в себе (никакого состояния в сервисе) — компонент сам решает, что делать с `Observable`, который сервис возвращает.

#### `services/auth.service.ts` — самый важный сервис

Держит текущего пользователя как **signal**:

```ts
private readonly currentUserSignal = signal<User | null>(this.readStoredUser());
readonly currentUser = this.currentUserSignal.asReadonly();
readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
```

- При создании сервиса читает пользователя из `localStorage` (ключ `conduit-user`) — так сессия переживает перезагрузку страницы.
- `login()` / `register()` / `updateUser()` — после успешного ответа API кладут пользователя (с JWT-токеном внутри) и в signal, и в `localStorage`.
- `logout()` — чистит и то, и другое.
- `getToken()` — используется интерцептором, чтобы подставить токен в заголовок запроса.

`currentUser`/`isAuthenticated` — `readonly`/`computed`, то есть **снаружи сервиса пользователя нельзя подменить напрямую**, только через методы `login`/`logout`/`updateUser` — это защищает от случайной порчи состояния из компонента.

#### `guards/auth.guard.ts`

```ts
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated()) return true;
  return router.createUrlTree(['/login']);
};
```

Возврат `UrlTree` (а не просто `false`) — правильный способ сделать редирект из guard'а: роутер сам перейдёт на `/login`, не нужно вручную вызывать `router.navigate` и городить побочные эффекты внутри guard'а. Навешан на `/settings`, `/editor` и `/editor/:slug` в `app.routes.ts`.

#### `interceptors/auth.interceptor.ts`

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiUrl = inject(API_URL);
  if (!req.url.startsWith(apiUrl)) return next(req);
  const token = authService.getToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Token ${token}` } }));
};
```

Подставляет заголовок `Authorization: Token <jwt>` (именно такой формат ожидает RealWorld API, не `Bearer`) во все запросы к нашему API — и **только** к нему (проверка `startsWith(apiUrl)` защищает от утечки токена, если приложение вдруг обратится к какому-то другому хосту). Подключается в `app.config.ts` через `provideHttpClient(withInterceptors([authInterceptor]))`.

#### `app.config.ts` — восстановление сессии при старте

```ts
provideAppInitializer(() => {
  const authService = inject(AuthService);
  if (!authService.isAuthenticated()) return of(null);
  return authService.fetchCurrentUser().pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) authService.logout();
      return of(null);
    }),
  );
}),
```

При каждом старте приложения, если в `localStorage` был найден пользователь (значит, есть JWT), делается запрос `GET /user`, чтобы: а) обновить данные профиля (вдруг их поменяли в другой вкладке/на другом устройстве), б) проверить, что токен всё ещё валиден. Если бэкенд ответил 401 — токен протух, пользователя разлогинивают. `provideAppInitializer` — это блокирующий инициализатор: Angular не отрендерит приложение, пока этот `Observable` не завершится, поэтому в шаблонах не бывает "мигания" залогинен/не залогинен.

### `shared`

Все компоненты здесь — presentational: получают данные через `input()`, отдают события наружу через `output()`, сами по себе не решают "что происходит на экране".

- **`header`** — навбар. Через `authService.isAuthenticated()` показывает либо "Sign in / Sign up", либо "New Article / Settings / <аватар и имя>".
- **`footer`** — статичная подвал-плашка.
- **`article-preview`** — карточка статьи в списке (автор, дата, кнопка favorite со счётчиком, теги, ссылка на статью). Сам дергает `ArticlesService.favorite()/unfavorite()` по клику и эмитит `toggleFavorite` с уже обновлённой статьёй — вызывающий компонент (`article-list`) обновляет свой массив.
- **`article-list`** — список превью + пагинация. Считает количество страниц как `computed(() => Math.ceil(articlesCount() / pageSize()))` и рисует кнопки страниц; не хранит текущую страницу сама — это ответственность родителя (`Home` или `ProfilePage`), список просто эмитит `pageChange`.
- **`tag-list`** — просто рисует список тегов-пилюль (без кликов). Используется в превью статьи, на странице статьи и в редакторе.
- **`tag-list-select`** — кликабельный вариант того же самого (для сайдбара "Popular Tags" на главной), эмитит `tagSelected`. Выделен в отдельный компонент, а не переиспользован `tag-list` с опциональным `output`, чтобы не смешивать "чисто отображение" и "интерактивный фильтр" в одном компоненте.
- **`list-errors`** — рендерит блок ошибок валидации API (`{ email: ["is invalid"] }` → `email is invalid`) под формами логина/регистрации/настроек/редактора.
- **`pipes/markdown.pipe.ts`** — тело статьи хранится в Markdown (так задумано в самом API), пайп прогоняет текст через библиотеку `marked` и оборачивает результат в `DomSanitizer.bypassSecurityTrustHtml`, чтобы можно было вставить как `[innerHTML]` на странице статьи. `bypassSecurityTrustHtml` используется осознанно: контент — это текст статьи с публичного API, а не что-то, введённое прямо в форму без обработки; тем не менее в реальном продакшене вместо "доверять всему" стоит либо санитайзить HTML на бэкенде, либо использовать более строгий рендерер.

### `features`

Каждая папка = один маршрут из `app.routes.ts`.

- **`home/`** — главная страница. Три состояния ленты (`FeedType = 'your' | 'global' | 'tag'`) хранятся в signals; `effect()` в конструкторе следит за `feedType`, `selectedTag`, `currentPage` и при любом изменении любого из них заново дергает `ArticlesService.query(...)`. Список тегов для сайдбара загружается один раз при создании компонента.
- **`auth/login`, `auth/register`** — типовые формы с `NonNullableFormBuilder`, при ошибке API (422/etc.) кладут `error.error.errors` в signal и рендерят через `<app-list-errors>`.
- **`settings/`** — форма редактирования профиля, предзаполненная текущими данными из `AuthService.currentUser()`. Поле пароля не обязательное: если оно пустое, из объекта на бэкенд поле `password` не отправляется вовсе (иначе API может воспринять пустую строку как попытку сбросить пароль). Кнопка "logout" внизу зовёт `AuthService.logout()` и уводит на главную.
- **`editor/`** — одна и та же страница обслуживает и `/editor` (создание), и `/editor/:slug` (редактирование). Подписывается на `route.paramMap`, а не читает `snapshot` один раз — так работает переход прямо с одной статьи на редактирование другой без пересоздания компонента. Теги статьи хранятся отдельным signal-массивом с ручным добавлением/удалением (по Enter в поле ввода).
- **`article/`** — страница статьи: заголовок, автор, кнопки follow/favorite (или edit/delete, если текущий пользователь — автор), тело в виде Markdown → HTML, список комментариев (`comment-list/`) и форма добавления комментария (`comment-form/`) как отдельные дочерние компоненты. Follow/favorite обновляют локальный signal статьи через иммутабельный `update()`, не перезапрашивая статью с сервера целиком.
- **`profile/`** — профиль пользователя с двумя вкладками ("My Articles" / "Favorited Articles"), реализованными как два разных маршрута (`/profile/:username` и `/profile/:username/favorites`), различаемых через `route.data.favoritesOnly`. Подписка идёт на `combineLatest([route.paramMap, route.data])`, чтобы корректно перезагружать данные и при смене пользователя, и при переключении вкладки.

## Как настроить API-адрес

Адрес API вынесен в Angular environment-файлы, а не зашит в код:

```
src/environments/environment.ts               → используется в `ng build` (production)
src/environments/environment.development.ts    → используется в `ng serve` и `ng build --configuration development`
```

Оба файла выглядят одинаково:

```ts
export const environment = {
  production: true, // или false
  apiUrl: 'https://api.realworld.io/api',
};
```

Подмена файла на нужную конфигурацию настроена в `angular.json` через `fileReplacements`. Чтобы указать другой backend (например, свой, реализующий тот же [API-спек](https://realworld-docs.netlify.app/specifications/backend/)) — достаточно поменять `apiUrl` в обоих файлах, пересобирать ничего больше не нужно: `core/api.config.ts` и все сервисы уже читают значение из `environment` через `API_URL`.

## Стили и внешние ресурсы

Приложение **не тащит свой CSS-фреймворк** в бандл — вместо этого в `src/index.html` подключены три внешних `<link>` (ровно то же самое, что используют все остальные реализации RealWorld, чтобы визуально совпадать друг с другом):

```html
<link href="https://fonts.googleapis.com/css?family=Titillium+Web:700|..." rel="stylesheet" />
<link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" />
<link rel="stylesheet" href="https://demo.productionready.io/main.css" />
```

Это шрифты (Titillium Web / Source Sans Pro и т.д.), иконки (`<i class="ion-heart">` и т.п.) и готовый Bootstrap-based CSS-файл с классами `.article-preview`, `.navbar`, `.tag-pill` и т.д. Все шаблоны в проекте используют именно эти классы, поэтому визуально приложение выглядит как оригинальный Conduit без единой строчки собственного CSS в компонентах (кроме пустых `*.scss`-заглушек, которые Angular создаёт по умолчанию для `App` и `Home`).

Если нужен полностью автономный билд без внешних CDN — эти три файла можно скачать и положить в `public/`, поменяв `<link href>` на локальные пути.

## Тестирование

Тесты запускаются через **Vitest** (дефолтный test runner для новых Angular CLI проектов, начиная с недавних версий — быстрее и проще в конфигурации, чем Karma+Jasmine).

```bash
ng test
```

Сейчас в проекте один тест (`app.spec.ts`) — smoke-test, что корневой компонент создаётся. Задел под остальные тесты есть: любой сервис или компонент можно протестировать через `TestBed`, как в `app.spec.ts` (там же показан паттерн подключения `provideHttpClientTesting()` для сервисов, использующих `HttpClient`).

## Известные упрощения и что можно улучшить

Это учебный/демонстрационный проект, поэтому осознанно оставлены упрощения:

- **Обработка ошибок на некоторых действиях минимальна.** Например, если запрос на добавление/удаление комментария или (не)подписку упадёт по сети — пользователь не увидит уведомление об ошибке (просто ничего не произойдёт). Формы логина/регистрации/настроек/редактора ошибки показывают.
- **404-страница не отдельная** — любой неизвестный путь (`**` в `app.routes.ts`) просто редиректит на главную, без отдельного экрана "страница не найдена".
- **Нет e2e-тестов** — Angular CLI больше не ставит e2e-фреймворк по умолчанию, юнит-тестов достаточно для целей этого проекта, но Playwright/Cypress можно добавить отдельно.
- **`bypassSecurityTrustHtml` в markdown-пайпе** — см. пояснение выше в разделе про `shared/pipes`.
- **Дублирование логики favorite/unfavorite** между `article-preview.ts` и `article-page.ts` — сознательно не вынесено в общий сервис/хелпер, потому что кода там по 5 строк в каждом месте и он не идентичен (в одном месте обновляется элемент списка, в другом — единственный signal статьи); выносить ради двух похожих мест было бы преждевременной абстракцией.

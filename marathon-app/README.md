# MarathonKZ — Next.js Web App

Полноценное веб-приложение марафона с авторизацией через Google и базой данных Supabase.

## Страницы
- `/` — Главная с обратным отсчётом и информацией
- `/login` — Вход через Google OAuth
- `/register` — Регистрация участника + расчёт ИМТ (требует авторизации)
- `/participants` — Список участников с фильтрами и поиском
- `/admin` — Панель администратора (только для ADMIN_EMAILS)

---

## Деплой на Vercel (пошаговая инструкция)

### 1. Создайте базу данных Supabase

1. Зайдите на [supabase.com](https://supabase.com) → New project
2. Откройте **SQL Editor** и выполните содержимое файла `supabase-schema.sql`
3. В **Project Settings → API** скопируйте:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Настройте Google OAuth

1. Откройте [console.cloud.google.com](https://console.cloud.google.com)
2. Создайте проект → **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
3. Тип: **Web application**
4. **Authorized redirect URIs**: добавьте:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
5. Скопируйте Client ID и Client Secret

### 3. Задеплойте на Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Или подключите GitHub-репозиторий на [vercel.com](https://vercel.com).

### 4. Добавьте переменные окружения в Vercel

В панели Vercel → Settings → Environment Variables добавьте все из `.env.example`:

| Переменная | Значение |
|---|---|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | из Google Console |
| `GOOGLE_CLIENT_SECRET` | из Google Console |
| `NEXT_PUBLIC_SUPABASE_URL` | из Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | из Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | из Supabase |
| `ADMIN_EMAILS` | ваш gmail через запятую |

### 5. Локальный запуск

```bash
npm install
cp .env.example .env.local
# заполните .env.local реальными значениями
npm run dev
```

---

## Структура проекта

```
marathon-app/
├── pages/
│   ├── api/
│   │   ├── auth/[...nextauth].js   # NextAuth Google OAuth
│   │   ├── runners/
│   │   │   ├── index.js            # GET список / POST новый
│   │   │   └── [id].js             # GET/PUT/DELETE по id
│   │   └── admin-check.js          # Проверка роли admin
│   ├── index.js                    # Главная страница
│   ├── login.js                    # Страница входа
│   ├── register.js                 # Регистрация + ИМТ
│   ├── participants.js             # Список участников
│   └── admin.js                    # Панель администратора
├── components/
│   ├── Layout.js                   # Обёртка с Navbar
│   ├── Navbar.js                   # Шапка с кнопкой выйти
│   └── Countdown.js                # Обратный отсчёт
├── lib/
│   ├── supabase.js                 # Supabase клиент
│   └── auth.js                     # Хелпер requireSession
├── styles/                         # CSS модули
└── supabase-schema.sql             # SQL для Supabase
```

## Особенности
- ✅ Вход только через Google OAuth 2.0
- ✅ Имя и фото пользователя в шапке
- ✅ Кнопка «Выйти» в навбаре
- ✅ Защищённые маршруты (редирект на /login)
- ✅ Все запросы к БД через API с проверкой user_id
- ✅ Ограничения полей (maxLength на каждом input/select)
- ✅ Расчёт ИМТ со шкалой и категориями
- ✅ Поиск, фильтры и сортировка участников
- ✅ Панель администратора (редактирование, удаление, добавление)

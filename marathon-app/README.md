# 🏃 MarathonSkills — Next.js Web App

Веб-версия десктопного WPF-приложения MarathonSkills. Реализована на **Next.js 14 + TypeScript + Supabase + NextAuth (Google OAuth)**, деплоится на **Vercel**.

---

## 🗺 Структура страниц

| Маршрут | Страница | Доступ |
|---------|---------|--------|
| `/` | О марафоне + обратный отсчёт | Все |
| `/login` | Вход через Google | Гости |
| `/register` | Регистрация участника | Авторизованные |
| `/bmi` | Калькулятор BMI + сохранение | Авторизованные |
| `/participants` | Список участников (фильтр/поиск/сортировка) | Все |
| `/admin` | Панель администратора | Только admin |
| `/admin/edit/[id]` | Редактирование участника | Только admin |
| `/admin/add` | Добавление участника | Только admin |

---

## 🚀 Быстрый старт (деплой на Vercel)

### Шаг 1 — Supabase (база данных)

1. Зайдите на [supabase.com](https://supabase.com) → создайте **New Project**
2. В Dashboard → **SQL Editor** → вставьте содержимое файла `supabase_schema.sql` → **Run**
3. Скопируйте из Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### Шаг 2 — Google OAuth

1. Откройте [console.cloud.google.com](https://console.cloud.google.com)
2. Создайте проект → **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth 2.0 Client ID** → тип: **Web application**
4. Authorized redirect URIs добавьте:
   ```
   https://YOUR-APP.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
5. Скопируйте `Client ID` и `Client Secret`

### Шаг 3 — Деплой на Vercel

1. Загрузите проект в GitHub (или GitLab)
2. Зайдите на [vercel.com](https://vercel.com) → **New Project** → выберите репозиторий
3. В разделе **Environment Variables** добавьте:

| Переменная | Значение |
|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL вашего Supabase проекта |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key из Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key из Supabase |
| `GOOGLE_CLIENT_ID` | Client ID из Google Console |
| `GOOGLE_CLIENT_SECRET` | Client Secret из Google Console |
| `NEXTAUTH_SECRET` | Сгенерируйте: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://YOUR-APP.vercel.app` |

4. Нажмите **Deploy** 🎉

### Шаг 4 — Сделать себя администратором

После первого входа через Google выполните SQL в Supabase:
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your@gmail.com';
```

---

## 💻 Локальная разработка

```bash
# 1. Установить зависимости
npm install

# 2. Создать .env.local (скопировать из .env.local.example и заполнить)
cp .env.local.example .env.local

# 3. Запустить dev server
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## 🗄 Структура БД (Supabase/PostgreSQL)

### `users`
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | Primary key |
| email | TEXT | Email Google-аккаунта |
| name | TEXT | Имя пользователя |
| image | TEXT | URL аватара |
| is_admin | BOOLEAN | Флаг администратора |

### `runners`
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| email | TEXT | Email участника |
| first_name | TEXT | Имя |
| last_name | TEXT | Фамилия |
| gender | TEXT | Мужской / Женский |
| birth_date | DATE | Дата рождения |
| country | TEXT | Страна |
| role | TEXT | Бегун / Координатор |
| bmi | NUMERIC | Индекс массы тела |

---

## 🔌 API Routes (`/api/`)

| Метод | Путь | Описание |
|-------|------|---------|
| GET | `/api/runners` | Список участников (фильтр/поиск/сорт) |
| POST | `/api/runners` | Зарегистрировать себя как участника |
| PATCH | `/api/runners/[id]` | Обновить данные (admin или владелец) |
| DELETE | `/api/runners/[id]` | Удалить участника (только admin) |
| POST | `/api/runners/admin-add` | Создать участника без Google-аккаунта (admin) |
| POST | `/api/bmi` | Сохранить BMI текущего пользователя |

---

## 🛠 Технологии

- **Next.js 14** (App Router)
- **TypeScript**
- **NextAuth.js** (Google OAuth 2.0)
- **Supabase** (PostgreSQL)
- **Tailwind CSS**
- **Vercel** (хостинг + Serverless Functions)

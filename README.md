# ClubReserve

Веб-система для онлайн-бронювання комп'ютерів у комп'ютерних клубах.

## Стек технологій

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — веб-фреймворк
- [PostgreSQL](https://www.postgresql.org/) — база даних
- [SQLAlchemy](https://www.sqlalchemy.org/) + [Alembic](https://alembic.sqlalchemy.org/) — ORM та міграції
- [JWT](https://jwt.io/) — автентифікація (access + refresh токени)

**Frontend**
- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Material UI](https://mui.com/) — UI компоненти
- [TanStack Query](https://tanstack.com/query) — кешування запитів
- [React Router](https://reactrouter.com/) — маршрутизація

**Інфраструктура**
- [Docker](https://www.docker.com/) + Docker Compose

---

## Запуск проєкту

### Варіант 1 — Docker (рекомендовано)

> Потрібен встановлений [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# Клонувати репозиторій
git clone <url>
cd clubreserve

# Запустити всі сервіси
docker-compose up --build
```

Після запуску відкрити в браузері:
- **Сайт** → http://localhost:3000
- **API документація** → http://localhost:8000/docs

Створити таблиці в БД (один раз):
```bash
docker-compose exec backend alembic revision --autogenerate -m "initial"
docker-compose exec backend alembic upgrade head
```

### Варіант 2 — Локально

**Вимоги:** Python 3.11+, Node.js 20+, PostgreSQL

**Backend:**
```bash
cd backend
cp .env.example .env
# Відредагувати .env — вказати DATABASE_URL

pip install -r requirements.txt

alembic revision --autogenerate -m "initial"
alembic upgrade head

uvicorn app.main:app --reload --port 8000
```

**Frontend** (окремий термінал):
```bash
cd frontend
npm install
npm run dev
```

---

## Структура проєкту

```
clubreserve/
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy моделі (User, Club, Computer, Booking)
│   │   ├── schemas/       # Pydantic схеми
│   │   ├── routers/       # API ендпоінти
│   │   ├── services/      # Бізнес-логіка (JWT, bcrypt, overlap-check)
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── alembic/           # Міграції БД
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios клієнт та запити
│   │   ├── components/    # Layout, Navbar
│   │   ├── contexts/      # AuthContext
│   │   ├── mocks/         # Mock дані для розробки
│   │   └── pages/         # Сторінки додатку
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

---

## API ендпоінти

| Метод | URL | Опис |
|-------|-----|------|
| POST | `/auth/register` | Реєстрація |
| POST | `/auth/login` | Вхід, отримання JWT |
| POST | `/auth/refresh` | Оновлення токену |
| GET | `/users/me` | Профіль поточного користувача |
| GET | `/clubs` | Список клубів |
| GET | `/clubs/{id}` | Деталі клубу |
| GET | `/computers` | Список комп'ютерів (фільтр по `club_id`) |
| GET | `/computers/{id}/availability` | Перевірка доступності |
| GET | `/bookings` | Мої бронювання |
| POST | `/bookings` | Створити бронювання |
| DELETE | `/bookings/{id}` | Скасувати бронювання |

Повна документація: http://localhost:8000/docs

---

## Функціонал

- Реєстрація та авторизація користувачів
- Перегляд клубів з пошуком та фільтрацією по місту
- Перевірка доступності комп'ютерів по часовому інтервалу
- Онлайн-бронювання з перевіркою перетину часових слотів
- Особистий кабінет з історією бронювань
- Скасування активних бронювань

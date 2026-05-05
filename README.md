# ClubReserve

Система бронювання комп'ютерних клубів. Дозволяє переглядати клуби, бачити реальну зайнятість комп'ютерів та бронювати місця онлайн.

## Стек

| Шар | Технологія |
|-----|------------|
| Frontend | React 18 + Vite, Material UI v6 |
| Backend | FastAPI (Python 3.11), SQLAlchemy 2, Alembic |
| База даних | PostgreSQL 16 |
| Інфраструктура | Docker Compose |

## Функціонал

- Перегляд клубів з фільтрами (рейтинг, ціна), сортуванням та пошуком
- Реальний статус зайнятості комп'ютерів (оновлення кожні 30 сек)
- Бронювання через DateTimePicker з кнопками швидкої тривалості
- Промо-коди зі знижками при бронюванні
- QR-код бронювання + завантаження PDF-квитанції
- Продовження активного бронювання (+1/+2 год)
- Відгуки та рейтинги клубів
- Профіль з рівнями лояльності та бейджами
- Адмін-панель: статистика, керування клубами/комп'ютерами/юзерами/промо-кодами
- Глобальний пошук у навбарі
- Темна/світла тема
- Експорт бронювань у CSV
- PWA (manifest + іконки)

## Запуск

```bash
docker compose up --build
```

Після запуску:
- Frontend: https://club-reserve.vercel.app/
- Backend API: https://clubreserve.onrender.com/
- Swagger docs: https://clubreserve.onrender.com/docs

### Перша ініціалізація

```bash
# Застосувати міграції
docker compose exec backend alembic upgrade head

# Завантажити тестові дані (3 клуби, комп'ютери з цінами)
docker compose exec backend python seed.py
```

## Структура проекту

```
ClubReserve/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy моделі
│   │   ├── routers/         # FastAPI ендпоінти
│   │   ├── schemas/         # Pydantic схеми
│   │   └── services/        # Авторизація, бізнес-логіка
│   ├── alembic/versions/    # Міграції БД
│   ├── seed.py              # Тестові дані
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios-функції для кожного ресурсу
│   │   ├── components/      # Layout, Navbar, ParticleCanvas, NavProgress
│   │   ├── contexts/        # Auth, Theme, Toast
│   │   ├── hooks/           # usePageTitle
│   │   └── pages/           # Всі сторінки
│   └── public/              # manifest.json, icon.svg
└── docker-compose.yml
```

## API ендпоінти

| Метод | URL | Опис |
|-------|-----|------|
| POST | `/auth/register` | Реєстрація |
| POST | `/auth/login` | Вхід (JWT) |
| GET | `/clubs` | Список клубів з рейтингом та цінами |
| GET | `/clubs/{id}/busy-computers` | Зайняті комп'ютери зараз |
| GET | `/computers?club_id=` | Комп'ютери клубу |
| GET | `/computers/{id}/availability` | Перевірка доступності |
| GET/POST | `/bookings` | Мої бронювання / створити |
| POST | `/bookings/{id}/extend` | Продовжити бронювання |
| DELETE | `/bookings/{id}` | Скасувати |
| GET/POST | `/clubs/{id}/reviews` | Відгуки клубу |
| POST | `/promos/validate` | Перевірити промо-код |
| GET | `/search?q=` | Глобальний пошук |
| GET | `/admin/stats` | Статистика для адміна |
| GET | `/users/me/stats` | Статистика профілю |

## Змінні середовища (backend)

| Змінна | За замовчуванням | Опис |
|--------|-----------------|------|
| `DATABASE_URL` | `postgresql://postgres:password@db:5432/clubreserve` | Рядок підключення до БД |
| `SECRET_KEY` | `dev-secret-key-change-in-production` | Ключ для JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Час життя access токена |
| `TZ` | `Europe/Kyiv` | Timezone контейнера |

## Міграції

```bash
# Застосувати всі
docker compose exec backend alembic upgrade head

# Відкатити одну
docker compose exec backend alembic downgrade -1

# Створити нову
docker compose exec backend alembic revision --autogenerate -m "назва"
```

## Технічні нотатки

- Часові мітки зберігаються як naive datetime у київському часі. Порівняння в бекенді виконується через `datetime.now(ZoneInfo('Europe/Kyiv'))`.
- HMR у Windows Docker: у `vite.config.js` увімкнено `watch: { usePolling: true }`.
- Статус бронювань оновлюється автоматично при кожному запиті `GET /bookings`.

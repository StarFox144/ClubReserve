#!/bin/bash
set -e

python -c "
from app.database import engine
from sqlalchemy import text, inspect

inspector = inspect(engine)
tables = inspector.get_table_names()
print('Existing tables:', tables)

if 'alembic_version' in tables and 'clubs' not in tables:
    print('Detected stale alembic_version — resetting...')
    with engine.connect() as conn:
        conn.execute(text('DELETE FROM alembic_version'))
        conn.commit()
    print('Reset done')
"

python -m alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port $PORT

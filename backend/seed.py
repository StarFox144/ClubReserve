"""
Seed script – fills the DB with sample clubs and computers.
Run: docker compose exec backend python seed.py
"""
from app.database import SessionLocal
from app.models.club import Club
from app.models.computer import Computer

CLUBS = [
    {
        "name": "GameZone Kyiv",
        "address": "вул. Хрещатик, 10, Київ",
        "description": "Топовий кіберспортивний клуб у центрі Києва. RTX 4070, 165 Гц монітори, зручні крісла.",
        "computers": [
            {"name": "PC-1", "description": "Intel i9-13900K · RTX 4070 · 32 GB RAM · 240 Гц"},
            {"name": "PC-2", "description": "Intel i9-13900K · RTX 4070 · 32 GB RAM · 240 Гц"},
            {"name": "PC-3", "description": "Intel i7-13700K · RTX 4060 Ti · 16 GB RAM · 165 Гц"},
            {"name": "PC-4", "description": "Intel i7-13700K · RTX 4060 Ti · 16 GB RAM · 165 Гц"},
            {"name": "PC-5", "description": "AMD Ryzen 9 7900X · RTX 4070 · 32 GB RAM · 165 Гц"},
            {"name": "PC-6 (VIP)", "description": "Intel i9-13900KS · RTX 4090 · 64 GB RAM · 360 Гц", "is_active": False},
        ],
    },
    {
        "name": "Cyber Arena Lviv",
        "address": "просп. Свободи, 5, Львів",
        "description": "Найбільший клуб Львова — 20 місць, стрімінгова студія, снекбар.",
        "computers": [
            {"name": "PC-01", "description": "AMD Ryzen 7 7700X · RX 7800 XT · 32 GB RAM · 144 Гц"},
            {"name": "PC-02", "description": "AMD Ryzen 7 7700X · RX 7800 XT · 32 GB RAM · 144 Гц"},
            {"name": "PC-03", "description": "Intel i5-13600K · RTX 3080 · 16 GB RAM · 144 Гц"},
            {"name": "PC-04", "description": "Intel i5-13600K · RTX 3080 · 16 GB RAM · 144 Гц"},
            {"name": "PC-05 (Стрім)", "description": "Intel i9-13900K · RTX 4080 · 64 GB RAM · 240 Гц"},
        ],
    },
    {
        "name": "PixelHub Kharkiv",
        "address": "вул. Сумська, 42, Харків",
        "description": "Затишний клуб для фанатів RPG та стратегій. Тихий зал, велика зона для командних ігор.",
        "computers": [
            {"name": "A1", "description": "Intel i7-12700K · RTX 3070 Ti · 32 GB RAM · 144 Гц"},
            {"name": "A2", "description": "Intel i7-12700K · RTX 3070 Ti · 32 GB RAM · 144 Гц"},
            {"name": "A3", "description": "AMD Ryzen 5 7600 · RX 6700 XT · 16 GB RAM · 144 Гц"},
            {"name": "A4 (Тех. огляд)", "description": "AMD Ryzen 5 7600 · RX 6700 XT · 16 GB RAM", "is_active": False},
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        if db.query(Club).count() > 0:
            print("DB already has clubs — skipping seed.")
            return

        for club_data in CLUBS:
            computers_data = club_data.pop("computers")
            club = Club(**club_data)
            db.add(club)
            db.flush()  # get club.id

            for pc in computers_data:
                db.add(Computer(club_id=club.id, **pc))

        db.commit()
        print(f"Seeded {len(CLUBS)} clubs with computers.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

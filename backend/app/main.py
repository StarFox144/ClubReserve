from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import admin_stats, auth, bookings, clubs, computers, promos, reviews, search, users
import app.models  # noqa: F401

app = FastAPI(
    title="ClubReserve API",
    description="Computer club reservation system",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(clubs.router)
app.include_router(computers.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(promos.router)
app.include_router(admin_stats.router)
app.include_router(search.router)


@app.get("/")
def root():
    return {"message": "ClubReserve API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/admin/make-admin")
def make_admin(secret: str, email: str):
    from app.config import settings
    from app.database import SessionLocal
    from app.models.user import User
    from fastapi import HTTPException
    if secret != settings.SECRET_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = True
    db.commit()
    db.close()
    return {"status": "ok", "email": email}


@app.post("/admin/seed")
def run_seed(secret: str, db=None):
    from app.config import settings
    if secret != settings.SECRET_KEY:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Forbidden")
    from seed import seed
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + "/..")
    seed()
    return {"status": "seeded"}

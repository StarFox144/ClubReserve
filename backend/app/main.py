from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, bookings, clubs, computers, users

app = FastAPI(
    title="ClubReserve API",
    description="Computer club reservation system",
    version="1.0.0",
)

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


@app.get("/")
def root():
    return {"message": "ClubReserve API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "ok"}

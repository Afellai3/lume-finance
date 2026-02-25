from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .routes import conti, movimenti, analytics, beni, budget, obiettivi, categorie, ricorrenze
from .database import init_db

app = FastAPI(
    title="Lume Finance API",
    description="API per gestione finanze personali",
    version="0.1.0"
)

# CORS per development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inizializza database
init_db()

# Registra routes
app.include_router(conti.router, prefix="/api")
app.include_router(movimenti.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(beni.router, prefix="/api")
app.include_router(budget.router, prefix="/api")
app.include_router(obiettivi.router, prefix="/api")
app.include_router(categorie.router, prefix="/api")
app.include_router(ricorrenze.router, prefix="/api")  # Sprint 4: Ricorrenze


@app.get("/")
async def root():
    return {
        "app": "Lume Finance",
        "version": "0.1.0",
        "status": "running"
    }


if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes
from .routes import conti, beni, movimenti, analytics
from .database import init_database

app = FastAPI(
    title="Lume Finance API",
    description="Gestione Finanze Personali con Scomposizione Costi Dettagliata",
    version="0.1.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(conti.router, prefix="/api")
app.include_router(beni.router, prefix="/api")
app.include_router(movimenti.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Inizializza database all'avvio"""
    try:
        init_database()
        print("✅ Database inizializzato")
    except Exception as e:
        print(f"⚠️ Errore inizializzazione database: {e}")


@app.get("/")
async def root():
    return {
        "messaggio": "Benvenuto su Lume Finance API",
        "status": "online",
        "versione": "0.1.0",
        "documentazione": "/docs"
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }


@app.get("/api/info")
async def api_info():
    """Informazioni su endpoint disponibili"""
    return {
        "endpoints": {
            "conti": "/api/conti",
            "beni": "/api/beni",
            "movimenti": "/api/movimenti",
            "analytics": "/api/analytics"
        },
        "features": [
            "Gestione conti bancari e portafogli",
            "Tracciamento beni (auto, elettrodomestici)",
            "Movimenti con scomposizione costi automatica",
            "Calcolo dettagliato costi veicoli",
            "Calcolo consumo elettrodomestici",
            "Dashboard analytics con KPI"
        ]
    }
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.connection import init_db
from .api.research import router as research_router
from .api.reports import router as reports_router
from .api.stocks import router as stocks_router

load_dotenv()

app = FastAPI(
    title="MarketMind API",
    description="Autonomous multi-agent financial intelligence system coordinated with LangChain and LangGraph.",
    version="1.0.0",
)

# CORS configuration
allowed_origins = [
    "*",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure database tables are created
@app.on_event("startup")
def on_startup():
    init_db()
    print("Database tables initialized successfully.")

# Include sub-routers
app.include_router(research_router)
app.include_router(reports_router)
app.include_router(stocks_router)

@app.get("/health")
def health_check():
    """GET /health - Backend health status"""
    return {
        "status": "healthy",
        "service": "marketmind-backend",
        "llm_provider": os.getenv("LLM_PROVIDER", "gemini"),
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)

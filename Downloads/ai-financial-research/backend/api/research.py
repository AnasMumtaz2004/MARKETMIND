import uuid
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import Research, ResearchReport
from ..graph.workflow import execute_research_workflow

router = APIRouter(prefix="/api/research", tags=["Research"])

# In-memory tracking for real-time progress while LangGraph runs in background
active_research_tasks: Dict[str, Dict[str, Any]] = {}

class ResearchRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=16, description="Stock ticker symbol (e.g. NVDA, AAPL)")

def run_workflow_background(research_id: str, symbol: str):
    try:
        active_research_tasks[research_id] = {
            "status": "running",
            "symbol": symbol,
            "agents": {
                "stock_agent": {"status": "running", "message": f"Querying Alpha Vantage for {symbol}...", "updated_at": datetime.utcnow().isoformat()},
                "news_agent": {"status": "running", "message": f"Searching DuckDuckGo for {symbol}...", "updated_at": datetime.utcnow().isoformat()},
                "analysis_agent": {"status": "pending", "message": "Waiting for data and news...", "updated_at": datetime.utcnow().isoformat()},
                "report_agent": {"status": "pending", "message": "Waiting for analysis...", "updated_at": datetime.utcnow().isoformat()},
            },
            "data": None,
        }

        result = execute_research_workflow(research_id, symbol)

        active_research_tasks[research_id]["status"] = result.get("overall_status", "completed")
        active_research_tasks[research_id]["agents"] = result.get("agent_statuses", {})
        active_research_tasks[research_id]["data"] = result

    except Exception as e:
        if research_id in active_research_tasks:
            active_research_tasks[research_id]["status"] = "failed"
            active_research_tasks[research_id]["message"] = str(e)

@router.post("")
def start_research(payload: ResearchRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    POST /api/research
    Accept stock ticker, initialize DB record, start LangGraph workflow in background.
    """
    symbol = payload.symbol.strip().upper()
    research_id = str(uuid.uuid4())[:8]

    # Create research record in SQLite DB
    research_entry = Research(
        id=research_id,
        stock_symbol=symbol,
        status="running",
        created_at=datetime.utcnow(),
    )
    db.add(research_entry)
    db.commit()

    # Initial task registry
    active_research_tasks[research_id] = {
        "status": "running",
        "symbol": symbol,
        "agents": {
            "stock_agent": {"status": "running", "message": f"Contacting Alpha Vantage for {symbol}...", "updated_at": datetime.utcnow().isoformat()},
            "news_agent": {"status": "running", "message": f"Initiating DuckDuckGo news intelligence for {symbol}...", "updated_at": datetime.utcnow().isoformat()},
            "analysis_agent": {"status": "pending", "message": "Awaiting market data feeds", "updated_at": datetime.utcnow().isoformat()},
            "report_agent": {"status": "pending", "message": "Awaiting quantitative analysis", "updated_at": datetime.utcnow().isoformat()},
        },
        "data": None,
    }

    # Execute in background task
    background_tasks.add_task(run_workflow_background, research_id, symbol)

    return {
        "research_id": research_id,
        "symbol": symbol,
        "status": "running",
        "message": f"LangGraph research workflow started for {symbol}.",
    }

@router.get("/{research_id}/status")
def get_research_status(research_id: str, db: Session = Depends(get_db)):
    """
    GET /api/research/{research_id}/status
    Return current agent statuses. Checks memory first, falls back to DB.
    """
    mem_task = active_research_tasks.get(research_id)
    if mem_task:
        return {
            "research_id": research_id,
            "status": mem_task.get("status", "running"),
            "agents": mem_task.get("agents", {}),
            "data_available": mem_task.get("data") is not None,
            "message": mem_task.get("message", ""),
        }

    # Fallback: look up DB (covers server restart scenario)
    research_entry = db.query(Research).filter(Research.id == research_id).first()
    if not research_entry:
        raise HTTPException(status_code=404, detail=f"Research '{research_id}' not found. It may belong to a previous server session.")

    is_completed = research_entry.status == "completed"
    is_failed = research_entry.status == "failed"
    agent_status_val = "completed" if is_completed else ("failed" if is_failed else research_entry.status)

    return {
        "research_id": research_entry.id,
        "status": research_entry.status,
        "data_available": is_completed,
        "agents": {
            "stock_agent": {"status": agent_status_val, "message": "Alpha Vantage processing complete" if is_completed else research_entry.status},
            "news_agent": {"status": agent_status_val, "message": "DuckDuckGo search complete" if is_completed else research_entry.status},
            "analysis_agent": {"status": agent_status_val, "message": "Financial analysis complete" if is_completed else research_entry.status},
            "report_agent": {"status": agent_status_val, "message": "Report generated" if is_completed else research_entry.status},
        },
    }

@router.get("/{research_id}")
def get_research_results(research_id: str, db: Session = Depends(get_db)):
    """
    GET /api/research/{research_id}
    Return research status and available results.
    """
    # First check active memory
    mem_task = active_research_tasks.get(research_id)
    if mem_task and mem_task.get("data"):
        data = mem_task["data"]
        return {
            "research_id": research_id,
            "stock_symbol": data.get("symbol"),
            "status": mem_task.get("status", "completed"),
            "agents": mem_task.get("agents", {}),
            "stock_data": data.get("stock_data", {}),
            "news_data": data.get("news_data", []),
            "company_overview": data.get("company_overview", {}),
            "deterministic_metrics": data.get("deterministic_metrics", {}),
            "financial_analysis": data.get("financial_analysis", {}),
            "final_report_data": data.get("final_report", {}),
            "final_report": data.get("final_report", {}).get("final_summary", ""),
        }

    # Return running status from memory even if data not yet ready
    if mem_task:
        return {
            "research_id": research_id,
            "stock_symbol": mem_task.get("symbol", ""),
            "status": mem_task.get("status", "running"),
            "agents": mem_task.get("agents", {}),
            "stock_data": {},
            "news_data": [],
            "company_overview": {},
            "deterministic_metrics": {},
            "financial_analysis": {},
            "final_report_data": {},
            "final_report": "",
        }

    # Fallback to DB
    research_entry = db.query(Research).filter(Research.id == research_id).first()
    if not research_entry:
        raise HTTPException(status_code=404, detail=f"Research '{research_id}' not found. It may belong to a previous server session.")

    report_entry = db.query(ResearchReport).filter(ResearchReport.research_id == research_id).first()
    if report_entry:
        return {
            "research_id": research_entry.id,
            "stock_symbol": research_entry.stock_symbol,
            "company_name": report_entry.company_name,
            "status": research_entry.status,
            "created_at": research_entry.created_at.isoformat() if research_entry.created_at else None,
            "executive_summary": report_entry.executive_summary,
            "stock_data": report_entry.stock_data or {},
            "news_data": report_entry.news_data or [],
            "financial_analysis": report_entry.financial_analysis or {},
            "final_report": report_entry.final_report or "",
            "final_report_data": {
                "symbol": research_entry.stock_symbol,
                "company_name": report_entry.company_name,
                "executive_summary": report_entry.executive_summary,
                "final_summary": report_entry.final_report,
                "created_at": report_entry.created_at.isoformat() if report_entry.created_at else None,
            },
        }

    # Research exists in DB but report not yet written (still running or failed)
    return {
        "research_id": research_entry.id,
        "stock_symbol": research_entry.stock_symbol,
        "status": research_entry.status,
        "agents": {},
        "stock_data": {},
        "news_data": [],
        "company_overview": {},
        "deterministic_metrics": {},
        "financial_analysis": {},
        "final_report_data": {},
        "final_report": "",
        "created_at": research_entry.created_at.isoformat() if research_entry.created_at else None,
    }

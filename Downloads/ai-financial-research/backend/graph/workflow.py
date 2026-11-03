from datetime import datetime
from typing import Dict, Any
from langgraph.graph import StateGraph, START, END
from .state import ResearchState
from ..agents.stock_agent import run_stock_agent
from ..agents.search_agent import run_search_agent
from ..agents.analysis_agent import run_analysis_agent
from ..agents.report_agent import run_report_agent
from ..database.connection import SessionLocal
from ..database.models import Research, ResearchReport

def build_research_graph():
    """
    Constructs the LangGraph state machine coordinating the 4 agents:
    1. Parallel execution: Stock Data Agent & News Research Agent
    2. Join point: Financial Analysis Agent
    3. Final synthesis: Report Generation Agent
    """
    workflow = StateGraph(ResearchState)

    # Add Nodes for all 4 agents
    workflow.add_node("stock_agent", run_stock_agent)
    workflow.add_node("news_agent", run_search_agent)
    workflow.add_node("analysis_agent", run_analysis_agent)
    workflow.add_node("report_agent", run_report_agent)

    # Parallel Start: Both Stock Data Agent & News Agent run from START
    workflow.add_edge(START, "stock_agent")
    workflow.add_edge(START, "news_agent")

    # Join both parallel branches into Financial Analysis Agent
    workflow.add_edge("stock_agent", "analysis_agent")
    workflow.add_edge("news_agent", "analysis_agent")

    # Pass analysis directly into Report Generation Agent
    workflow.add_edge("analysis_agent", "report_agent")

    # Complete workflow
    workflow.add_edge("report_agent", END)

    return workflow.compile()

# Singleton compiled graph instance
research_graph = build_research_graph()

def execute_research_workflow(research_id: str, symbol: str) -> Dict[str, Any]:
    """
    Executes the full LangGraph pipeline synchronously or asynchronously,
    and updates SQLite database records upon completion.
    """
    initial_state: ResearchState = {
        "research_id": research_id,
        "symbol": symbol.strip().upper(),
        "agent_statuses": {
            "stock_agent": {"status": "pending", "message": "Queued in LangGraph pipeline", "updated_at": datetime.utcnow().isoformat()},
            "news_agent": {"status": "pending", "message": "Queued in LangGraph pipeline", "updated_at": datetime.utcnow().isoformat()},
            "analysis_agent": {"status": "pending", "message": "Waiting for data & news agents", "updated_at": datetime.utcnow().isoformat()},
            "report_agent": {"status": "pending", "message": "Waiting for quantitative analysis", "updated_at": datetime.utcnow().isoformat()},
        },
        "stock_data": {},
        "company_overview": {},
        "news_data": [],
        "deterministic_metrics": {},
        "financial_analysis": {},
        "final_report": {},
        "overall_status": "running",
        "error": None,
    }

    db = SessionLocal()
    try:
        # Update research status in DB
        research_rec = db.query(Research).filter(Research.id == research_id).first()
        if research_rec:
            research_rec.status = "running"
            db.commit()

        # Invoke LangGraph
        final_state = research_graph.invoke(initial_state)

        # Save completed report in database
        report_data = final_state.get("final_report", {})
        company_name = (
            report_data.get("company_name")
            or final_state.get("company_overview", {}).get("name")
            or symbol
        )

        research_report = ResearchReport(
            research_id=research_id,
            company_name=company_name,
            stock_symbol=symbol,
            executive_summary=report_data.get("executive_summary", ""),
            stock_data=final_state.get("stock_data", {}),
            news_data=final_state.get("news_data", []),
            financial_analysis={
                "deterministic_metrics": final_state.get("deterministic_metrics", {}),
                "qualitative_analysis": final_state.get("financial_analysis", {}),
            },
            final_report=report_data.get("final_summary", ""),
            created_at=datetime.utcnow(),
        )

        db.add(research_report)

        if research_rec:
            research_rec.status = "completed"
            research_rec.completed_at = datetime.utcnow()
        db.commit()

        return final_state

    except Exception as e:
        db.rollback()
        print(f"Error during LangGraph workflow execution: {e}")
        research_rec = db.query(Research).filter(Research.id == research_id).first()
        if research_rec:
            research_rec.status = "failed"
            research_rec.completed_at = datetime.utcnow()
            db.commit()
        return {
            "research_id": research_id,
            "symbol": symbol,
            "overall_status": "failed",
            "error": str(e),
            "agent_statuses": {
                "stock_agent": {"status": "failed", "message": str(e), "updated_at": datetime.utcnow().isoformat()},
                "news_agent": {"status": "failed", "message": str(e), "updated_at": datetime.utcnow().isoformat()},
                "analysis_agent": {"status": "failed", "message": str(e), "updated_at": datetime.utcnow().isoformat()},
                "report_agent": {"status": "failed", "message": str(e), "updated_at": datetime.utcnow().isoformat()},
            }
        }
    finally:
        db.close()

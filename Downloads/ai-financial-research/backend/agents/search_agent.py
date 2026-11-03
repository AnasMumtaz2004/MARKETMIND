from datetime import datetime
from typing import Dict, Any
from ..tools.duckduckgo import search_company_news
from ..graph.state import ResearchState

def run_search_agent(state: ResearchState) -> Dict[str, Any]:
    """
    Agent 2: News Research Agent
    Searches DuckDuckGo for real-time company news and business updates.
    Deduplicates URLs and extracts structured records.
    """
    symbol = state.get("symbol", "").strip().upper()
    overview = state.get("company_overview", {})
    company_name = overview.get("name", "")
    statuses = dict(state.get("agent_statuses", {}))

    # Mark as running
    statuses["news_agent"] = {
        "status": "running",
        "message": f"Searching DuckDuckGo for {symbol} recent earnings & business news...",
        "updated_at": datetime.utcnow().isoformat(),
    }

    try:
        articles = search_company_news(symbol, company_name=company_name, max_results=8)

        count = len(articles)
        msg = f"Gathered {count} verified news and disclosure sources." if count > 0 else "DuckDuckGo returned no recent articles."

        news_status = {
            "news_agent": {
                "status": "completed",
                "message": msg,
                "updated_at": datetime.utcnow().isoformat(),
            }
        }

        return {
            "news_data": articles,
            "agent_statuses": news_status,
        }

    except Exception as e:
        news_status = {
            "news_agent": {
                "status": "failed",
                "message": f"News search agent failed: {str(e)}",
                "updated_at": datetime.utcnow().isoformat(),
            }
        }
        return {
            "news_data": [],
            "agent_statuses": news_status,
        }

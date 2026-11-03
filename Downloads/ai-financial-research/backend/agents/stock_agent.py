from datetime import datetime
from typing import Dict, Any
from ..tools.alphavantage import AlphaVantageClient
from ..graph.state import ResearchState

def run_stock_agent(state: ResearchState) -> Dict[str, Any]:
    """
    Agent 1: Stock Data Agent
    Retrieves daily time series and fundamental metrics from Alpha Vantage.
    Validates data and does not invent missing financial numbers.
    """
    symbol = state.get("symbol", "").strip().upper()
    statuses = dict(state.get("agent_statuses", {}))

    # Mark as running
    statuses["stock_agent"] = {
        "status": "running",
        "message": f"Querying Alpha Vantage for {symbol} quotes & fundamentals...",
        "updated_at": datetime.utcnow().isoformat(),
    }

    client = AlphaVantageClient()

    try:
        # Fetch overview
        overview = client.get_company_overview(symbol)

        # Fetch daily time series
        daily_series = client.get_daily_time_series(symbol)

        # Check for fatal errors
        has_overview_err = "error" in overview
        has_series_err = "error" in daily_series

        combined_stock_data = {
            "symbol": symbol,
            "name": overview.get("name", symbol),
            "exchange": overview.get("exchange", ""),
            "sector": overview.get("sector", ""),
            "industry": overview.get("industry", ""),
            "market_cap": overview.get("market_cap"),
            "pe_ratio": overview.get("pe_ratio"),
            "week_52_high": overview.get("week_52_high"),
            "week_52_low": overview.get("week_52_low"),
            "dividend_yield": overview.get("dividend_yield"),
            "latest_price": daily_series.get("latest_price"),
            "change": daily_series.get("change"),
            "change_percent": daily_series.get("change_percent"),
            "historical_prices": daily_series.get("historical_prices", []),
        }

        message = (
            f"Successfully retrieved stock data for {symbol}"
            + (f" ({overview.get('name', '')})" if overview.get("name") else "")
            + (" — overview data unavailable" if has_overview_err else "")
            + (" — price series unavailable" if has_series_err else "")
        )

        stock_status = {
            "stock_agent": {
                "status": "completed",
                "message": message,
                "updated_at": datetime.utcnow().isoformat(),
            }
        }

        return {
            "stock_data": combined_stock_data,
            "company_overview": overview,
            "agent_statuses": stock_status,
        }

    except Exception as e:
        stock_status = {
            "stock_agent": {
                "status": "failed",
                "message": f"Stock agent encountered an issue: {str(e)}",
                "updated_at": datetime.utcnow().isoformat(),
            }
        }
        return {
            "stock_data": {"symbol": symbol, "historical_prices": []},
            "company_overview": {},
            "agent_statuses": stock_status,
        }

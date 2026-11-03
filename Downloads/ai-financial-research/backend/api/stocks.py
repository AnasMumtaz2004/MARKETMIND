from fastapi import APIRouter, HTTPException
from ..tools.alphavantage import AlphaVantageClient

router = APIRouter(prefix="/api/stocks", tags=["Stocks"])

@router.get("/{symbol}")
def get_stock_data(symbol: str):
    """
    GET /api/stocks/{symbol}
    Return available stock overview and daily historical data.
    """
    sym = symbol.strip().upper()
    client = AlphaVantageClient()

    overview = client.get_company_overview(sym)
    daily = client.get_daily_time_series(sym)

    if "error" in overview and "error" in daily:
        # If both fail due to rate limit or key
        return {
            "symbol": sym,
            "overview": overview,
            "daily_series": daily,
            "message": "Direct stock queries may be constrained by Alpha Vantage rate limits.",
        }

    return {
        "symbol": sym,
        "name": overview.get("name", sym),
        "exchange": overview.get("exchange", ""),
        "sector": overview.get("sector", ""),
        "latest_price": daily.get("latest_price"),
        "change": daily.get("change"),
        "change_percent": daily.get("change_percent"),
        "overview": overview,
        "historical_prices": daily.get("historical_prices", []),
    }

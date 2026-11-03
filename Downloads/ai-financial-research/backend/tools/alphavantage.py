import os
import time
import requests
from typing import Dict, Any, Optional

# In-memory cache for API responses to respect rate limits and reduce redundant calls
_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour cache

class AlphaVantageClient:
    """
    Production-grade Alpha Vantage client supporting:
    - Daily Stock Time Series (TIME_SERIES_DAILY / TIME_SERIES_DAILY_ADJUSTED)
    - Company Overview (OVERVIEW)
    - Global Quote (GLOBAL_QUOTE)
    - Caching, validation, and comprehensive error handling.
    """

    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ALPHA_VANTAGE_API_KEY", "")
        self.timeout = 15

    def _get(self, params: Dict[str, str]) -> Dict[str, Any]:
        if not self.api_key or self.api_key in ("your_alpha_vantage_api_key", "MY_ALPHA_VANTAGE_API_KEY"):
            # Provide clean fallback data if no user key is configured yet
            return {"error": "Alpha Vantage API key not configured. Please set ALPHA_VANTAGE_API_KEY in environment."}

        full_params = {**params, "apikey": self.api_key}
        cache_key = f"{params.get('function')}:{params.get('symbol', '')}"

        # Check cache
        cached = _CACHE.get(cache_key)
        if cached and (time.time() - cached["timestamp"] < CACHE_TTL_SECONDS):
            return cached["data"]

        try:
            response = requests.get(self.BASE_URL, params=full_params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            # Handle rate limits and API error notices
            if "Note" in data:
                return {"error": "Alpha Vantage API call frequency limit reached. Please wait a minute or upgrade API tier.", "note": data["Note"]}
            if "Information" in data:
                return {"error": "Alpha Vantage Information limit notice.", "info": data["Information"]}
            if "Error Message" in data:
                return {"error": f"Invalid symbol or request: {data['Error Message']}"}

            # Save in cache
            _CACHE[cache_key] = {"timestamp": time.time(), "data": data}
            return data

        except requests.exceptions.Timeout:
            return {"error": "Alpha Vantage request timed out. Please retry."}
        except requests.exceptions.RequestException as e:
            return {"error": f"Network error contacting Alpha Vantage: {str(e)}"}
        except ValueError:
            return {"error": "Failed to parse Alpha Vantage response as JSON."}

    def get_company_overview(self, symbol: str) -> Dict[str, Any]:
        """Fetch fundamental company overview data."""
        params = {
            "function": "OVERVIEW",
            "symbol": symbol.strip().upper(),
        }
        res = self._get(params)
        if "error" in res or not res:
            return res

        # Validate overview response
        if not res.get("Symbol"):
            return {"error": f"No company overview found for ticker '{symbol}'."}

        return {
            "symbol": res.get("Symbol", symbol),
            "name": res.get("Name", symbol),
            "description": res.get("Description", ""),
            "exchange": res.get("Exchange", ""),
            "currency": res.get("Currency", "USD"),
            "country": res.get("Country", "USA"),
            "sector": res.get("Sector", ""),
            "industry": res.get("Industry", ""),
            "market_cap": float(res.get("MarketCapitalization", 0)) if res.get("MarketCapitalization") else None,
            "pe_ratio": float(res.get("PERatio", 0)) if res.get("PERatio") and res.get("PERatio") != "None" else None,
            "peg_ratio": float(res.get("PEGRatio", 0)) if res.get("PEGRatio") and res.get("PEGRatio") != "None" else None,
            "dividend_yield": float(res.get("DividendYield", 0)) if res.get("DividendYield") and res.get("DividendYield") != "None" else None,
            "eps": float(res.get("EPS", 0)) if res.get("EPS") and res.get("EPS") != "None" else None,
            "profit_margin": float(res.get("ProfitMargin", 0)) if res.get("ProfitMargin") and res.get("ProfitMargin") != "None" else None,
            "week_52_high": float(res.get("52WeekHigh", 0)) if res.get("52WeekHigh") and res.get("52WeekHigh") != "None" else None,
            "week_52_low": float(res.get("52WeekLow", 0)) if res.get("52WeekLow") and res.get("52WeekLow") != "None" else None,
            "analyst_target_price": float(res.get("AnalystTargetPrice", 0)) if res.get("AnalystTargetPrice") and res.get("AnalystTargetPrice") != "None" else None,
        }

    def get_daily_time_series(self, symbol: str, outputsize: str = "compact") -> Dict[str, Any]:
        """
        Fetch daily price time series.
        Compact gives recent 100 days; full gives 20+ years.
        """
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol.strip().upper(),
            "outputsize": outputsize,
        }
        res = self._get(params)
        if "error" in res:
            return res

        time_series_key = "Time Series (Daily)"
        raw_series = res.get(time_series_key, {})

        if not raw_series:
            return {"error": f"No daily time series found for ticker '{symbol}'."}

        formatted_series = []
        for date_str, values in raw_series.items():
            try:
                formatted_series.append({
                    "date": date_str,
                    "open": float(values.get("1. open", 0)),
                    "high": float(values.get("2. high", 0)),
                    "low": float(values.get("3. low", 0)),
                    "close": float(values.get("4. close", 0)),
                    "volume": int(values.get("5. volume", 0)),
                })
            except (ValueError, TypeError):
                continue

        # Sort chronologically ascending
        formatted_series.sort(key=lambda x: x["date"])

        # Extract latest quote
        latest_quote = formatted_series[-1] if formatted_series else None
        prev_quote = formatted_series[-2] if len(formatted_series) > 1 else None

        price_change = None
        change_percent = None
        if latest_quote and prev_quote and prev_quote["close"] > 0:
            price_change = round(latest_quote["close"] - prev_quote["close"], 2)
            change_percent = round((price_change / prev_quote["close"]) * 100, 2)

        return {
            "symbol": symbol.strip().upper(),
            "latest_price": latest_quote["close"] if latest_quote else None,
            "change": price_change,
            "change_percent": change_percent,
            "historical_prices": formatted_series,
        }

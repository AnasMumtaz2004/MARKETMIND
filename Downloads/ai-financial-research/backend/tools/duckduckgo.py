import os
from typing import List, Dict, Any

def search_company_news(symbol: str, company_name: str = "", max_results: int = 8) -> List[Dict[str, Any]]:
    """
    Search DuckDuckGo for company financial news and business developments.
    Uses DDGS (duckduckgo_search / ddgs) and handles deduplication and timeouts.
    """
    query = f"{symbol} {company_name} stock earnings financial news business".strip()

    results: List[Dict[str, Any]] = []
    seen_urls = set()

    try:
        # Prefer current ddgs package, fallback to duckduckgo_search
        try:
            from ddgs import DDGS
        except ImportError:
            from duckduckgo_search import DDGS

        with DDGS() as ddgs:
            # First try news search
            try:
                news_gen = ddgs.news(keywords=f"{symbol} stock news", max_results=max_results)
                for item in news_gen:
                    url = item.get("url") or item.get("href")
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        results.append({
                            "title": item.get("title", "").strip(),
                            "body": item.get("body", item.get("snippet", "")).strip(),
                            "url": url,
                            "date": item.get("date", ""),
                            "source": item.get("source", ""),
                        })
            except Exception as e:
                # If news search is rate limited or empty, fallback to regular text search
                pass

            # If fewer than 4 results, complement with text search
            if len(results) < 4:
                try:
                    text_gen = ddgs.text(keywords=f"{symbol} stock market analysis earnings", max_results=max_results)
                    for item in text_gen:
                        url = item.get("href") or item.get("url")
                        if url and url not in seen_urls:
                            seen_urls.add(url)
                            results.append({
                                "title": item.get("title", "").strip(),
                                "body": item.get("body", item.get("snippet", "")).strip(),
                                "url": url,
                                "date": item.get("date", ""),
                                "source": item.get("source", ""),
                            })
                except Exception:
                    pass

    except Exception as exc:
        print(f"DuckDuckGo search error for {symbol}: {exc}")

    return results[:max_results]

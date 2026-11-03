from typing import TypedDict, List, Dict, Any, Optional, Annotated

def merge_statuses(left: Optional[Dict[str, Any]], right: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    merged = dict(left or {})
    if right:
        merged.update(right)
    return merged

class AgentExecutionStatus(TypedDict, total=False):
    status: str       # 'pending', 'running', 'completed', 'failed'
    message: str
    updated_at: str

class ResearchState(TypedDict, total=False):
    # Input
    research_id: str
    symbol: str

    # Agent individual execution tracking with reducer for parallel node updates
    agent_statuses: Annotated[Dict[str, Any], merge_statuses]

    # Agent 1: Stock Data Agent outputs
    stock_data: Dict[str, Any]
    company_overview: Dict[str, Any]

    # Agent 2: News Research Agent outputs
    news_data: List[Dict[str, Any]]

    # Agent 3: Financial Analysis Agent outputs
    deterministic_metrics: Dict[str, Any]
    financial_analysis: Dict[str, Any]

    # Agent 4: Report Generation Agent outputs
    final_report: Dict[str, Any]
    limitations: str

    # Overall pipeline execution
    overall_status: str  # 'pending', 'running', 'completed', 'failed'
    error: Optional[str]

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database.connection import get_db
from ..database.models import ResearchReport, Research

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("")
def list_reports(limit: int = 50, db: Session = Depends(get_db)):
    """
    GET /api/reports
    Return previously generated reports from database.
    """
    reports = db.query(ResearchReport).order_by(desc(ResearchReport.created_at)).limit(limit).all()
    return [r.to_dict() for r in reports]

@router.get("/{report_id}")
def get_report(report_id: str, db: Session = Depends(get_db)):
    """
    GET /api/reports/{report_id}
    Return one complete report by ID or by research_id.
    """
    # Check by numeric ID or research_id
    report = None
    if report_id.isdigit():
        report = db.query(ResearchReport).filter(ResearchReport.id == int(report_id)).first()

    if not report:
        report = db.query(ResearchReport).filter(ResearchReport.research_id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")

    return report.to_dict()

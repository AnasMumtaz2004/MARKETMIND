from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Research(Base):
    __tablename__ = "research"

    id = Column(String(64), primary_key=True, index=True)
    stock_symbol = Column(String(16), index=True, nullable=False)
    status = Column(String(32), default="pending", nullable=False)  # pending, running, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationship to ResearchReport
    report = relationship("ResearchReport", back_populates="research", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "stock_symbol": self.stock_symbol,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    research_id = Column(String(64), ForeignKey("research.id"), unique=True, nullable=False, index=True)
    company_name = Column(String(256), nullable=False)
    stock_symbol = Column(String(16), nullable=False, index=True)
    executive_summary = Column(Text, nullable=True)
    stock_data = Column(JSON, nullable=True)
    news_data = Column(JSON, nullable=True)
    financial_analysis = Column(JSON, nullable=True)
    final_report = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    research = relationship("Research", back_populates="report")

    def to_dict(self):
        return {
            "id": self.id,
            "research_id": self.research_id,
            "company_name": self.company_name,
            "stock_symbol": self.stock_symbol,
            "executive_summary": self.executive_summary,
            "stock_data": self.stock_data,
            "news_data": self.news_data,
            "financial_analysis": self.financial_analysis,
            "final_report": self.final_report,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

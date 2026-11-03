import React from 'react';
import {
  FileText,
  Building2,
  TrendingUp,
  Calculator,
  Newspaper,
  Compass,
  AlertTriangle,
  Sparkles,
  Award,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function ReportSection({ report, onBackToDashboard }) {
  if (!report) return null;

  // Sections definition
  const sections = [
    {
      id: 'executive_summary',
      num: '01',
      title: 'Executive Summary',
      icon: Award,
      content: report.executive_summary || report.sections?.executive_summary,
      isAiInterpretation: true,
    },
    {
      id: 'company_overview',
      num: '02',
      title: 'Company Overview',
      icon: Building2,
      content: report.company_overview || report.sections?.company_overview,
      isAiInterpretation: false,
    },
    {
      id: 'stock_performance',
      num: '03',
      title: 'Stock Performance',
      icon: TrendingUp,
      content: report.stock_performance || report.sections?.stock_performance,
      isAiInterpretation: false,
    },
    {
      id: 'financial_analysis',
      num: '04',
      title: 'Financial Analysis',
      icon: Calculator,
      content: report.financial_analysis_text || report.sections?.financial_analysis,
      isAiInterpretation: true,
    },
    {
      id: 'recent_news_analysis',
      num: '05',
      title: 'Recent News Analysis',
      icon: Newspaper,
      content: report.recent_news_analysis || report.sections?.recent_news_analysis,
      isAiInterpretation: true,
    },
    {
      id: 'market_sentiment',
      num: '06',
      title: 'Market Sentiment',
      icon: Compass,
      content: report.market_sentiment || report.sections?.market_sentiment,
      isAiInterpretation: true,
    },
    {
      id: 'potential_risks',
      num: '07',
      title: 'Potential Risks',
      icon: AlertTriangle,
      content: report.potential_risks || report.sections?.potential_risks,
      isAiInterpretation: true,
    },
    {
      id: 'opportunities',
      num: '08',
      title: 'Opportunities',
      icon: Sparkles,
      content: report.opportunities || report.sections?.opportunities,
      isAiInterpretation: true,
    },
    {
      id: 'final_summary',
      num: '09',
      title: 'Final Research Summary',
      icon: FileText,
      content: report.final_summary || report.final_report || report.sections?.final_summary,
      isAiInterpretation: true,
    },
  ];

  const renderContent = (content) => {
    if (!content) {
      return (
        <p className="text-xs font-['Open_Sans'] text-[#D1D5D5] italic">
          Data or analytical synthesis pending or not available for this segment.
        </p>
      );
    }

    if (Array.isArray(content)) {
      return (
        <ul className="space-y-2 text-sm font-['Open_Sans'] text-[#FFFFFF]">
          {content.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#14B8A6] font-['Roboto_Mono'] mt-1">•</span>
              <span className="leading-relaxed">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Split paragraphs
    const paragraphs = typeof content === 'string' ? content.split('\n\n') : [JSON.stringify(content)];
    return (
      <div className="space-y-3 text-sm sm:text-base font-['Open_Sans'] text-[#FFFFFF] leading-relaxed">
        {paragraphs.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="bg-[#111616] border border-[#191F1F] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-['Roboto_Mono'] bg-[#080B0B] border border-[#14B8A6] text-[#14B8A6]">
              COMPREHENSIVE RESEARCH REPORT
            </span>
            <span className="text-xs font-['Roboto_Mono'] text-[#D1D5D5]">
              {report.stock_symbol || report.symbol}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-['Archivo_Black'] text-[#FFFFFF]">
            {report.company_name || report.stock_symbol || 'Company'} Intelligence Dossier
          </h2>
          <p className="text-xs sm:text-sm font-['Open_Sans'] text-[#D1D5D5] mt-1">
            Generated via LangGraph Multi-Agent Pipeline •{' '}
            {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Real-time analysis'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-5 py-2.5 rounded-lg bg-[#080B0B] border border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6] hover:text-[#080B0B] font-['Poppins'] font-semibold text-sm transition-all cursor-pointer text-center"
          >
            Return to Dashboard
          </button>
        </div>
      </div>

      {/* Distinction Banner: Factual vs AI Interpretation */}
      <div className="bg-[#080B0B] border border-[#14B8A6] p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#14B8A6] shrink-0 mt-0.5" />
        <div className="text-xs font-['Open_Sans'] text-[#D1D5D5]">
          <span className="text-[#FFFFFF] font-semibold">Analytical Integrity Notice: </span>
          This report clearly differentiates between deterministic factual data (Alpha Vantage SEC filings & time series) and multi-agent synthesis (LangGraph reasoning). AI analytical interpretations are explicitly tagged.
        </div>
      </div>

      {/* 9 Structured Sections */}
      <div className="space-y-6">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.id}
              className="bg-[#111616] border border-[#191F1F] rounded-xl p-6 sm:p-7 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#191F1F]">
                <div className="flex items-center gap-3">
                  <span className="font-['Roboto_Mono'] text-sm text-[#14B8A6] font-bold">
                    {sec.num}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#080B0B] border border-[#191F1F] flex items-center justify-center text-[#14B8A6]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-['Archivo_Black'] text-base sm:text-lg text-[#FFFFFF]">
                    {sec.title}
                  </h3>
                </div>

                {/* Attribution Tag */}
                <div className="self-start sm:self-auto">
                  <span
                    className={`text-[10px] font-['Roboto_Mono'] px-2 py-0.5 rounded border ${
                      sec.isAiInterpretation
                        ? 'bg-[#080B0B] border-[#14B8A6] text-[#14B8A6]'
                        : 'bg-[#080B0B] border-[#191F1F] text-[#D1D5D5]'
                    }`}
                  >
                    {sec.isAiInterpretation ? 'AI AGENT SYNTHESIS' : 'DETERMINISTIC MARKET DATA'}
                  </span>
                </div>
              </div>

              {/* Section Content */}
              <div className="pl-1 sm:pl-3">{renderContent(sec.content)}</div>
            </div>
          );
        })}
      </div>

      {/* Sources & Citations if provided */}
      {report.sources && report.sources.length > 0 && (
        <div className="bg-[#080B0B] border border-[#191F1F] rounded-xl p-6">
          <h4 className="font-['Archivo_Black'] text-sm text-[#FFFFFF] mb-3 uppercase tracking-wider">
            Verified Sources & References
          </h4>
          <ul className="space-y-2">
            {report.sources.map((src, i) => (
              <li key={i} className="text-xs font-['Roboto_Mono'] flex items-center gap-2">
                <span className="text-[#14B8A6]">[{i + 1}]</span>
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D1D5D5] hover:text-[#FFFFFF] underline truncate flex items-center gap-1"
                  >
                    <span>{src.title || src.url}</span>
                    <ExternalLink className="w-3 h-3 text-[#14B8A6]" />
                  </a>
                ) : (
                  <span className="text-[#D1D5D5]">{src.title || src}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Return Button */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-8 py-3 rounded-lg bg-[#14B8A6] text-[#080B0B] font-['Poppins'] font-bold hover:bg-[#0F766E] transition-all cursor-pointer shadow-xl inline-flex items-center gap-2"
        >
          <span>Return to Research Dashboard</span>
        </button>
      </div>
    </div>
  );
}

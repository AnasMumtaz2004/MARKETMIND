import React from 'react';
import { CheckCircle2, Clock, Loader2, AlertCircle, TrendingUp, Newspaper, Calculator, FileText } from 'lucide-react';

const AGENT_CONFIGS = [
  {
    id: 'stock_agent',
    name: 'Stock Data Agent',
    icon: TrendingUp,
    description: 'Retrieves Alpha Vantage daily time series, fundamentals, and calculates core metrics.',
  },
  {
    id: 'news_agent',
    name: 'News Research Agent',
    icon: Newspaper,
    description: 'Searches DuckDuckGo for recent company news, earnings developments, and market signals.',
  },
  {
    id: 'analysis_agent',
    name: 'Financial Analysis Agent',
    icon: Calculator,
    description: 'Calculates financial volatility, trends, sentiment, and algorithmic risk indicators.',
  },
  {
    id: 'report_agent',
    name: 'Report Generation Agent',
    icon: FileText,
    description: 'Synthesizes intelligence into structured executive reports with citations and insights.',
  },
];

export default function AgentProgress({ agents = {}, overallStatus = 'pending', errorMessage = '' }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080B0B] border border-[#14B8A6] text-[#14B8A6] text-xs font-['Roboto_Mono']">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080B0B] border border-[#14B8A6] text-[#FFFFFF] text-xs font-['Roboto_Mono'] animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#14B8A6]" />
            RUNNING
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080B0B] border border-[#FFFFFF] text-[#FFFFFF] text-xs font-['Roboto_Mono']">
            <AlertCircle className="w-3.5 h-3.5 text-[#14B8A6]" />
            FAILED
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080B0B] border border-[#191F1F] text-[#D1D5D5] text-xs font-['Roboto_Mono']">
            <Clock className="w-3.5 h-3.5" />
            PENDING
          </span>
        );
    }
  };

  // Count progress
  const completedCount = AGENT_CONFIGS.filter(
    (cfg) => agents[cfg.id]?.status === 'completed'
  ).length;
  const progressPercent = Math.round((completedCount / AGENT_CONFIGS.length) * 100);

  return (
    <div className="bg-[#111616] border border-[#191F1F] rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#191F1F]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-['Archivo_Black'] text-lg text-[#FFFFFF]">
              MULTI-AGENT WORKFLOW STATUS
            </h3>
            {overallStatus === 'running' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-['Roboto_Mono'] bg-[#14B8A6] text-[#080B0B] font-bold">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs font-['Open_Sans'] text-[#D1D5D5] mt-1">
            Real-time LangGraph multi-agent execution pipeline
          </p>
        </div>

        {/* Overall Progress Bar */}
        <div className="flex flex-col items-end gap-1.5 min-w-[160px]">
          <div className="flex items-center justify-between w-full text-xs font-['Roboto_Mono']">
            <span className="text-[#D1D5D5]">Progress</span>
            <span className="text-[#14B8A6] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#080B0B] rounded-full overflow-hidden border border-[#191F1F]">
            <div
              className="h-full bg-[#14B8A6] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-[#080B0B] border border-[#14B8A6] rounded-lg text-xs font-['Open_Sans'] text-[#FFFFFF] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#14B8A6] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of 4 Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {AGENT_CONFIGS.map((agent) => {
          const state = agents[agent.id] || { status: 'pending', message: 'Waiting for pipeline turn...' };
          const Icon = agent.icon;
          const isRunning = state.status === 'running';
          const isCompleted = state.status === 'completed';

          return (
            <div
              key={agent.id}
              className={`p-4 rounded-lg bg-[#080B0B] border transition-all ${
                isRunning
                  ? 'border-[#14B8A6] shadow-lg shadow-[#14B8A6]/10'
                  : isCompleted
                  ? 'border-[#0F766E]'
                  : 'border-[#191F1F]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-md border ${
                      isRunning || isCompleted
                        ? 'border-[#14B8A6] text-[#14B8A6] bg-[#111616]'
                        : 'border-[#191F1F] text-[#D1D5D5] bg-[#111616]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-['Poppins'] font-semibold text-[#FFFFFF]">
                      {agent.name}
                    </h4>
                    <p className="text-[11px] font-['Open_Sans'] text-[#D1D5D5] line-clamp-1">
                      {agent.description}
                    </p>
                  </div>
                </div>
                {getStatusBadge(state.status)}
              </div>

              {/* Status Message */}
              <div className="mt-3 pt-2 border-t border-[#191F1F] flex items-center justify-between text-xs font-['Roboto_Mono']">
                <span className="text-[#D1D5D5] text-[11px] truncate max-w-[280px]">
                  {state.message || (isRunning ? 'Processing data...' : isCompleted ? 'Completed successfully' : 'Pending')}
                </span>
                {state.updated_at && (
                  <span className="text-[10px] text-[#D1D5D5] shrink-0">
                    {new Date(state.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

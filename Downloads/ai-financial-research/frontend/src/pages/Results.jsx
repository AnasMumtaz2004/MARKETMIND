import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AgentProgress from '../components/AgentProgress';
import StockChart from '../components/StockChart';
import NewsCard from '../components/NewsCard';
import ReportSection from '../components/ReportSection';
import apiService from '../services/api';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  Globe2,
  Calendar,
  Layers,
  AlertCircle,
  Loader2,
  Share2,
  CheckCircle,
} from 'lucide-react';

export default function Results() {
  const { id: researchId } = useParams();
  const navigate = useNavigate();

  const [researchData, setResearchData] = useState(null);
  const [agentStatus, setAgentStatus] = useState({
    status: 'pending',
    agents: {},
    message: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const pollIntervalRef = useRef(null);

  // Poll for agent status and results
  useEffect(() => {
    if (!researchId) {
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;

    const pollStatus = async () => {
      try {
        // Fetch current agent statuses
        const statusRes = await apiService.getResearchStatus(researchId);
        if (!isSubscribed) return;

        setAgentStatus({
          status: statusRes.status || 'running',
          agents: statusRes.agents || {},
          message: statusRes.message || '',
        });

        // If completed or has partial data, also fetch full research data
        if (statusRes.status === 'completed' || statusRes.data_available) {
          const fullRes = await apiService.getResearch(researchId);
          if (isSubscribed) {
            setResearchData(fullRes);
            setIsLoading(false);
          }
          // Stop polling once completed
          if (statusRes.status === 'completed') {
            clearInterval(pollIntervalRef.current);
          }
        } else if (statusRes.status === 'failed') {
          setError(statusRes.error || statusRes.message || 'Workflow execution encountered an error.');
          setIsLoading(false);
          clearInterval(pollIntervalRef.current);
        }
      } catch (err) {
        console.warn('Status poll warning:', err);
        // Try fallback to getResearch in case status endpoint is combined
        try {
          const fallbackRes = await apiService.getResearch(researchId);
          if (isSubscribed) {
            setResearchData(fallbackRes);
            if (fallbackRes.agents) {
              setAgentStatus({
                status: fallbackRes.status || 'completed',
                agents: fallbackRes.agents,
                message: fallbackRes.message || '',
              });
            }
            if (fallbackRes.status === 'completed' || fallbackRes.final_report) {
              clearInterval(pollIntervalRef.current);
            }
            setIsLoading(false);
          }
        } catch (innerErr) {
          if (isSubscribed) {
            setError('Unable to retrieve research dossier. Please check server status.');
            setIsLoading(false);
          }
        }
      }
    };

    // Immediate first call
    pollStatus();

    // Start polling every 1800ms
    pollIntervalRef.current = setInterval(pollStatus, 1800);

    return () => {
      isSubscribed = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [researchId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!researchId) {
    return (
      <div className="min-h-screen bg-[#080B0B] text-[#FFFFFF] flex flex-col font-['Poppins']">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-[#14B8A6] mb-4" />
          <h2 className="text-2xl font-['Archivo_Black']">No Research ID Specified</h2>
          <p className="text-sm font-['Open_Sans'] text-[#D1D5D5] mt-2 mb-6">
            Please enter a stock ticker from the Dashboard to launch a multi-agent analysis.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-lg bg-[#14B8A6] text-[#080B0B] font-bold text-sm cursor-pointer hover:bg-[#0F766E] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Extract company and financial details without inventing missing numbers
  const stockInfo = researchData?.stock_data || researchData?.company_overview || {};
  const symbol = researchData?.stock_symbol || stockInfo.symbol || researchData?.symbol || researchId.toUpperCase();
  const companyName = researchData?.company_name || stockInfo.name || stockInfo.company_name || symbol;

  const currentPrice = stockInfo.latest_price ?? stockInfo.price ?? stockInfo.current_price;
  const changePercent = stockInfo.change_percent ?? stockInfo.change_percentage;
  const priceChange = stockInfo.change ?? stockInfo.price_change;
  const marketCap = stockInfo.market_cap || stockInfo.market_capitalization;
  const peRatio = stockInfo.pe_ratio || stockInfo.pe;
  const week52High = stockInfo.week_52_high || stockInfo['52_week_high'];
  const week52Low = stockInfo.week_52_low || stockInfo['52_week_low'];
  const exchange = stockInfo.exchange || stockInfo.asset_type;
  const sector = stockInfo.sector;

  // Historical data for Recharts
  const chartData = researchData?.stock_data?.historical_prices || researchData?.historical_prices || [];

  // DuckDuckGo News articles
  const newsArticles = researchData?.news_data || researchData?.news || [];

  // Report payload
  const reportPayload = researchData?.final_report_data || researchData || null;

  return (
    <div className="min-h-screen bg-[#080B0B] text-[#FFFFFF] flex flex-col font-['Poppins']">
      {/* Navigation */}
      <Navbar lastResearchId={researchId} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#191F1F]">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-['Roboto_Mono'] text-[#14B8A6] hover:text-[#FFFFFF] transition-colors cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-['Roboto_Mono'] text-[#D1D5D5]">
              ID: <span className="text-[#FFFFFF]">{researchId}</span>
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111616] border border-[#191F1F] hover:border-[#14B8A6] text-xs font-['Roboto_Mono'] text-[#FFFFFF] transition-colors cursor-pointer"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-[#14B8A6]" /> : <Share2 className="w-3.5 h-3.5 text-[#14B8A6]" />}
              <span>{copied ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Company Overview */}
        <section className="bg-[#111616] border border-[#191F1F] rounded-xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#191F1F]">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded bg-[#080B0B] border border-[#14B8A6] text-[#14B8A6] font-['Roboto_Mono'] text-base font-bold">
                  {symbol}
                </span>
                {exchange && (
                  <span className="text-xs font-['Roboto_Mono'] text-[#D1D5D5] bg-[#080B0B] px-2 py-0.5 rounded border border-[#191F1F]">
                    {exchange}
                  </span>
                )}
                {sector && (
                  <span className="text-xs font-['Open_Sans'] text-[#D1D5D5] bg-[#080B0B] px-2 py-0.5 rounded border border-[#191F1F]">
                    {sector}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-['Archivo_Black'] text-[#FFFFFF]">
                {companyName}
              </h1>
            </div>

            {/* Price & Daily Change */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 bg-[#080B0B] p-4 rounded-xl border border-[#191F1F]">
              <div>
                <span className="text-[11px] font-['Roboto_Mono'] text-[#D1D5D5] uppercase tracking-wider block">
                  Latest Price
                </span>
                <span className="text-2xl sm:text-3xl font-['Roboto_Mono'] font-bold text-[#FFFFFF]">
                  {currentPrice !== undefined && currentPrice !== null
                    ? `$${Number(currentPrice).toFixed(2)}`
                    : 'Awaiting Quote'}
                </span>
              </div>

              {(changePercent !== undefined || priceChange !== undefined) && (
                <div className="sm:pl-4 sm:border-l border-[#191F1F]">
                  <span className="text-[11px] font-['Roboto_Mono'] text-[#D1D5D5] uppercase tracking-wider block">
                    Daily Change
                  </span>
                  <div className="flex items-center gap-1 font-['Roboto_Mono'] font-semibold text-base text-[#14B8A6]">
                    <span>
                      {priceChange !== undefined ? `${Number(priceChange) >= 0 ? '+' : ''}${Number(priceChange).toFixed(2)}` : ''}
                      {changePercent !== undefined ? ` (${Number(changePercent) >= 0 ? '+' : ''}${Number(changePercent).toFixed(2)}%)` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Market Information Grid (strictly factual, only shown if returned) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-2">
            <div>
              <span className="text-[11px] font-['Roboto_Mono'] text-[#D1D5D5]">Market Cap</span>
              <p className="font-['Roboto_Mono'] font-semibold text-sm text-[#FFFFFF] mt-1">
                {marketCap ? (typeof marketCap === 'number' ? `$${(marketCap / 1e9).toFixed(2)}B` : marketCap) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-['Roboto_Mono'] text-[#D1D5D5]">P/E Ratio</span>
              <p className="font-['Roboto_Mono'] font-semibold text-sm text-[#FFFFFF] mt-1">
                {peRatio ? Number(peRatio).toFixed(2) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-['Roboto_Mono'] text-[#D1D5D5]">52-Week High</span>
              <p className="font-['Roboto_Mono'] font-semibold text-sm text-[#FFFFFF] mt-1">
                {week52High ? `$${Number(week52High).toFixed(2)}` : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-['Roboto_Mono'] text-[#D1D5D5]">52-Week Low</span>
              <p className="font-['Roboto_Mono'] font-semibold text-sm text-[#FFFFFF] mt-1">
                {week52Low ? `$${Number(week52Low).toFixed(2)}` : 'N/A'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: AI Agent Execution (Real-time LangGraph status) */}
        <section>
          <AgentProgress
            agents={agentStatus.agents}
            overallStatus={agentStatus.status}
            errorMessage={error}
          />
        </section>

        {/* SECTION 2: Stock Chart (Recharts) */}
        <section>
          <StockChart
            data={chartData}
            symbol={symbol}
            currentPrice={currentPrice}
            changePercent={changePercent}
          />
        </section>

        {/* SECTION 4: Latest News (DuckDuckGo Search Results) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#191F1F]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Archivo_Black'] text-lg text-[#FFFFFF]">
                  LATEST MARKET INTELLIGENCE & NEWS
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-['Roboto_Mono'] bg-[#111616] border border-[#14B8A6] text-[#14B8A6]">
                  DuckDuckGo
                </span>
              </div>
              <p className="text-xs font-['Open_Sans'] text-[#D1D5D5] mt-1">
                Real-time unmanipulated news articles and external disclosures
              </p>
            </div>
            <span className="text-xs font-['Roboto_Mono'] text-[#D1D5D5]">
              {newsArticles.length} Sources Found
            </span>
          </div>

          {newsArticles.length === 0 ? (
            <div className="bg-[#111616] border border-[#191F1F] rounded-xl p-8 text-center">
              <p className="text-xs font-['Roboto_Mono'] text-[#D1D5D5]">
                {agentStatus.status === 'running'
                  ? 'DuckDuckGo news agent currently gathering real-time web articles...'
                  : 'No external news articles available for this ticker.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsArticles.map((article, index) => (
                <NewsCard key={article.url || article.href || index} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 5: AI Research Report (9 structured sections) */}
        <section className="pt-4">
          {reportPayload?.final_report || reportPayload?.executive_summary || reportPayload?.sections ? (
            <ReportSection
              report={reportPayload}
              onBackToDashboard={() => navigate('/')}
            />
          ) : (
            <div className="bg-[#111616] border border-[#191F1F] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#14B8A6]" />
              <h3 className="font-['Archivo_Black'] text-base text-[#FFFFFF]">
                Generating 9-Point Financial Intelligence Dossier
              </h3>
              <p className="text-xs font-['Open_Sans'] text-[#D1D5D5] max-w-md">
                The Financial Analysis Agent and Report Generation Agent are actively computing
                metrics and synthesizing multi-agent findings.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#191F1F] bg-[#080B0B] py-6 text-center text-xs font-['Open_Sans'] text-[#D1D5D5] mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="font-['Roboto_Mono'] text-[#FFFFFF]">
            MARKETMIND • AI FINANCIAL RESEARCH
          </span>
         
        </div>
      </footer>
    </div>
  );
}

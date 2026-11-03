import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import apiService from '../services/api';
import {
  FileText,
  Calendar,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Fetch previously completed reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const data = await apiService.getReports();
      setReports(Array.isArray(data) ? data : data.reports || []);
    } catch (err) {
      console.warn('Could not fetch historical reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleSearchSubmit = async (symbol) => {
    try {
      setIsSubmitting(true);
      setSearchError('');
      const response = await apiService.startResearch(symbol);
      const researchId = response.research_id || response.id;
      if (researchId) {
        navigate(`/results/${researchId}`);
      } else {
        throw new Error('No research identifier returned by backend');
      }
    } catch (err) {
      console.error('Failed to initiate research:', err);
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to start multi-agent research pipeline. Please verify backend connection.';
      setSearchError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B0B] text-[#FFFFFF] flex flex-col font-['Poppins']">
      {/* Navigation */}
      <Navbar lastResearchId={reports[0]?.research_id || reports[0]?.id} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-16">
        {/* Main Hero Section */}
        <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111616] border border-[#14B8A6] text-[#14B8A6] text-xs font-['Roboto_Mono']">
            <Cpu className="w-3.5 h-3.5" />
            <span>MARKETMIND • MULTI-AGENT INVESTMENT INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-['Archivo_Black'] text-[#FFFFFF] tracking-tight leading-tight">
            AI-Powered Financial Intelligence
          </h1>

          <p className="text-sm sm:text-base font-['Open_Sans'] text-[#D1D5D5] leading-relaxed max-w-2xl">
            


          </p>

          {/* Search Component */}
          <div className="w-full mt-2">
            <SearchBar onSearch={handleSearchSubmit} isLoading={isSubmitting} />

            {searchError && (
              <div className="mt-4 p-3 bg-[#111616] border border-[#14B8A6] rounded-xl text-xs font-['Open_Sans'] text-[#FFFFFF] max-w-2xl mx-auto">
                <span className="font-semibold text-[#14B8A6]">Notice: </span>
                {searchError}
              </div>
            )}
          </div>

          {/* Core Agent Features Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-6 text-left">
            <div className="bg-[#111616] border border-[#191F1F] p-3.5 rounded-lg">
              <span className="text-[10px] font-['Roboto_Mono'] text-[#14B8A6]">AGENT 01</span>
              <p className="text-xs font-semibold text-[#FFFFFF] mt-1">Stock Data</p>
              <p className="text-[11px] font-['Open_Sans'] text-[#D1D5D5]">Alpha Vantage</p>
            </div>
            <div className="bg-[#111616] border border-[#191F1F] p-3.5 rounded-lg">
              <span className="text-[10px] font-['Roboto_Mono'] text-[#14B8A6]">AGENT 02</span>
              <p className="text-xs font-semibold text-[#FFFFFF] mt-1">News Research</p>
              <p className="text-[11px] font-['Open_Sans'] text-[#D1D5D5]">DuckDuckGo Engine</p>
            </div>
            <div className="bg-[#111616] border border-[#191F1F] p-3.5 rounded-lg">
              <span className="text-[10px] font-['Roboto_Mono'] text-[#14B8A6]">AGENT 03</span>
              <p className="text-xs font-semibold text-[#FFFFFF] mt-1">Financial Analysis</p>
              <p className="text-[11px] font-['Open_Sans'] text-[#D1D5D5]">Python Math & Trends</p>
            </div>
            <div className="bg-[#111616] border border-[#191F1F] p-3.5 rounded-lg">
              <span className="text-[10px] font-['Roboto_Mono'] text-[#14B8A6]">AGENT 04</span>
              <p className="text-xs font-semibold text-[#FFFFFF] mt-1">Report Synthesis</p>
              <p className="text-[11px] font-['Open_Sans'] text-[#D1D5D5]">LangGraph Dossier</p>
            </div>
          </div>
        </section>

        {/* Research Activity Section */}
        <section className="w-full">
          <div className="flex items-center justify-between pb-4 border-b border-[#191F1F] mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-['Archivo_Black'] text-[#FFFFFF]">
                RESEARCH ACTIVITY
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-['Roboto_Mono'] bg-[#111616] border border-[#191F1F] text-[#D1D5D5]">
                {reports.length} Reports
              </span>
            </div>
            <p className="text-xs font-['Open_Sans'] text-[#D1D5D5] hidden sm:block">
              Historical multi-agent research dossiers persisted in SQLite
            </p>
          </div>

          {isLoadingReports ? (
            <div className="bg-[#111616] border border-[#191F1F] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#14B8A6]" />
              <p className="text-xs font-['Roboto_Mono'] text-[#D1D5D5]">
                Loading research dossier archive...
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-[#111616] border border-[#191F1F] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <FileText className="w-10 h-10 text-[#14B8A6]" />
              <h3 className="font-['Archivo_Black'] text-base text-[#FFFFFF]">
                No Research Reports Yet
              </h3>
              <p className="text-xs font-['Open_Sans'] text-[#D1D5D5] max-w-md">
                Enter a stock ticker above (such as NVDA, AAPL, or MSFT) to trigger the LangGraph
                pipeline and generate your first AI intelligence report.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reports.map((item) => {
                const reportId = item.id || item.research_id;
                const company = item.company_name || item.stock_symbol || 'Unknown Company';
                const symbol = item.stock_symbol || item.symbol || '---';
                const date = item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : 'Recent';
                const summary =
                  item.executive_summary ||
                  item.summary ||
                  'Comprehensive financial research analysis completed by multi-agent LangGraph workflow.';

                return (
                  <div
                    key={reportId}
                    className="bg-[#111616] border border-[#191F1F] hover:border-[#14B8A6] rounded-xl p-5 flex flex-col justify-between transition-all group shadow-lg"
                  >
                    <div>
                      {/* Ticker & Date Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-['Roboto_Mono'] font-bold text-base text-[#14B8A6] bg-[#080B0B] px-2.5 py-1 rounded border border-[#191F1F] group-hover:border-[#14B8A6] transition-colors">
                          {symbol}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-['Roboto_Mono'] text-[#D1D5D5]">
                          <Calendar className="w-3 h-3 text-[#14B8A6]" />
                          {date}
                        </span>
                      </div>

                      {/* Company Name */}
                      <h3 className="font-['Poppins'] font-bold text-base text-[#FFFFFF] group-hover:text-[#14B8A6] transition-colors line-clamp-1 mb-2">
                        {company}
                      </h3>

                      {/* Short Summary */}
                      <p className="font-['Open_Sans'] text-xs text-[#D1D5D5] line-clamp-3 leading-relaxed">
                        {summary}
                      </p>
                    </div>

                    {/* View Report Button */}
                    <div className="mt-5 pt-3 border-t border-[#191F1F] flex items-center justify-between">
                      <span className="text-[10px] font-['Roboto_Mono'] text-[#D1D5D5]">
                        DOSSIER #{reportId}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/results/${reportId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#080B0B] border border-[#14B8A6] text-xs font-['Poppins'] font-medium text-[#14B8A6] hover:bg-[#14B8A6] hover:text-[#080B0B] transition-colors cursor-pointer"
                      >
                        <span>View Report</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#191F1F] bg-[#080B0B] py-6 text-center text-xs font-['Open_Sans'] text-[#D1D5D5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="font-['Roboto_Mono'] text-[#FFFFFF]">
            MARKETMIND • AI FINANCIAL RESEARCH
          </span>
          
        </div>
      </footer>
    </div>
  );
}

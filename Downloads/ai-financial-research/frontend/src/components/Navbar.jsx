import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, LayoutDashboard, LineChart } from 'lucide-react';

export default function Navbar({ lastResearchId }) {
  const location = useLocation();

  const isDashboard = location.pathname === '/';
  const isResults = location.pathname.startsWith('/results') || location.pathname.startsWith('/research');

  return (
    <header className="sticky top-0 z-50 bg-[#080B0B] border-b border-[#191F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-md bg-[#111616] border border-[#14B8A6] flex items-center justify-center text-[#14B8A6] group-hover:bg-[#14B8A6] group-hover:text-[#080B0B] transition-colors">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-['Archivo_Black'] text-base tracking-wider text-[#FFFFFF]">
              MarketMind
            </span>
            <span className="text-[10px] tracking-widest text-[#14B8A6] font-['Roboto_Mono']">
              AI FINANCIAL RESEARCH
            </span>
          </div>
        </Link>

        {/* Navigation links - Strictly limited to Dashboard and Research Results */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-['Poppins'] font-medium transition-all ${
              isDashboard
                ? 'bg-[#111616] text-[#14B8A6] border-b-2 border-[#14B8A6]'
                : 'text-[#D1D5D5] hover:text-[#FFFFFF] hover:bg-[#111616]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to={lastResearchId ? `/results/${lastResearchId}` : '/results'}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-['Poppins'] font-medium transition-all ${
              isResults
                ? 'bg-[#111616] text-[#14B8A6] border-b-2 border-[#14B8A6]'
                : 'text-[#D1D5D5] hover:text-[#FFFFFF] hover:bg-[#111616]'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Research Results</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

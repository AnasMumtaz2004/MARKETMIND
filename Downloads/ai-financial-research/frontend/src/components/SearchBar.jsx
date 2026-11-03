import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export default function SearchBar({ onSearch, isLoading = false }) {
  const [ticker, setTicker] = useState('');
  const [validationError, setValidationError] = useState('');

  const popularTickers = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN'];

  const validateInput = (value) => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) {
      return 'Please enter a stock ticker symbol.';
    }
    if (!/^[A-Z0-9.\-]{1,8}$/.test(trimmed)) {
      return 'Please enter a valid stock ticker (1-8 alphanumeric characters).';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateInput(ticker);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    onSearch(ticker.trim().toUpperCase());
  };

  const handleQuickSelect = (symbol) => {
    setTicker(symbol);
    setValidationError('');
    onSearch(symbol);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-[#111616] p-2 rounded-xl border border-[#191F1F] focus-within:border-[#14B8A6] transition-all">
          <div className="flex items-center flex-1 px-3 gap-3">
            <Search className="w-5 h-5 text-[#14B8A6] shrink-0" />
            <input
              type="text"
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value.toUpperCase());
                if (validationError) setValidationError('');
              }}
              placeholder="Enter stock ticker (e.g. NVDA, AAPL, MSFT)"
              disabled={isLoading}
              className="w-full bg-transparent text-[#FFFFFF] placeholder-[#D1D5D5] font-['Roboto_Mono'] text-base sm:text-lg focus:outline-none uppercase"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !ticker.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#14B8A6] text-[#080B0B] font-['Poppins'] font-semibold hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initiating...</span>
              </>
            ) : (
              <>
                <span>Research</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="flex items-center gap-2 mt-2 px-2 text-xs font-['Open_Sans'] text-[#FFFFFF] bg-[#111616] border border-[#191F1F] p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 text-[#14B8A6] shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </form>

      {/* Quick Select Tickers */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-['Open_Sans']">
        <span className="text-[#D1D5D5]">Popular symbols:</span>
        {popularTickers.map((symbol) => (
          <button
            key={symbol}
            type="button"
            onClick={() => handleQuickSelect(symbol)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded bg-[#111616] border border-[#191F1F] hover:border-[#14B8A6] text-[#FFFFFF] font-['Roboto_Mono'] transition-colors cursor-pointer"
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}

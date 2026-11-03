import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function StockChart({ data = [], symbol = '', currentPrice, changePercent }) {
  const [timeRange, setTimeRange] = useState('ALL');

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Ensure sorted chronologically
    const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (timeRange === 'ALL') return sorted;

    const countMap = {
      '1M': 22,
      '3M': 65,
      '6M': 130,
      '1Y': 252,
    };

    const count = countMap[timeRange] || sorted.length;
    return sorted.slice(-count);
  }, [data, timeRange]);

  const minPrice = useMemo(() => {
    if (!filteredData.length) return 0;
    const prices = filteredData.map((d) => d.close || d.price || 0);
    return Math.floor(Math.min(...prices) * 0.98);
  }, [filteredData]);

  const maxPrice = useMemo(() => {
    if (!filteredData.length) return 0;
    const prices = filteredData.map((d) => d.close || d.price || 0);
    return Math.ceil(Math.max(...prices) * 1.02);
  }, [filteredData]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111616] border border-[#191F1F] rounded-xl p-8 text-center">
        <p className="text-sm font-['Roboto_Mono'] text-[#D1D5D5]">
          No historical price series returned for {symbol || 'ticker'}.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-[#080B0B] border border-[#14B8A6] p-3 rounded-lg shadow-2xl font-['Roboto_Mono'] text-xs">
          <div className="flex items-center gap-1.5 text-[#D1D5D5] mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>{label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#FFFFFF] font-bold text-sm">
            <DollarSign className="w-4 h-4 text-[#14B8A6]" />
            <span>${Number(point.close ?? point.price ?? 0).toFixed(2)}</span>
          </div>
          {point.volume && (
            <div className="text-[11px] text-[#D1D5D5] mt-1">
              Vol: {Number(point.volume).toLocaleString()}
            </div>
          )}
          {point.high && point.low && (
            <div className="text-[10px] text-[#D1D5D5] mt-1 pt-1 border-t border-[#191F1F]">
              H: ${Number(point.high).toFixed(2)} | L: ${Number(point.low).toFixed(2)}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111616] border border-[#191F1F] rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-['Archivo_Black'] text-lg text-[#FFFFFF]">
              HISTORICAL PRICE TREND
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-['Roboto_Mono'] bg-[#080B0B] border border-[#14B8A6] text-[#14B8A6]">
              {symbol}
            </span>
          </div>
          <p className="text-xs font-['Open_Sans'] text-[#D1D5D5] mt-1">
            Daily historical close prices sourced from Alpha Vantage
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-[#080B0B] p-1 rounded-lg border border-[#191F1F] self-start sm:self-auto">
          {['1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-xs font-['Roboto_Mono'] transition-colors cursor-pointer ${
                timeRange === range
                  ? 'bg-[#14B8A6] text-[#080B0B] font-bold'
                  : 'text-[#D1D5D5] hover:text-[#FFFFFF]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceTealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#191F1F" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#D1D5D5"
              tick={{ fill: '#D1D5D5', fontSize: 11, fontFamily: 'Roboto Mono' }}
              tickLine={{ stroke: '#191F1F' }}
              axisLine={{ stroke: '#191F1F' }}
              minTickGap={30}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              stroke="#D1D5D5"
              tick={{ fill: '#D1D5D5', fontSize: 11, fontFamily: 'Roboto Mono' }}
              tickLine={{ stroke: '#191F1F' }}
              axisLine={{ stroke: '#191F1F' }}
              tickFormatter={(val) => `$${val}`}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#14B8A6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceTealGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-[#191F1F] flex flex-wrap items-center justify-between text-xs font-['Roboto_Mono'] text-[#D1D5D5]">
        <span>Range: {filteredData.length} Trading Days Recorded</span>
        {filteredData.length > 0 && (
          <span>
            {filteredData[0]?.date} → {filteredData[filteredData.length - 1]?.date}
          </span>
        )}
      </div>
    </div>
  );
}

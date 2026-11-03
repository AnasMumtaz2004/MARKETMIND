import React from 'react';
import { ExternalLink, Calendar, Globe, Newspaper } from 'lucide-react';

export default function NewsCard({ article }) {
  if (!article) return null;

  const { title, body, snippet, url, href, date, source } = article;
  const description = body || snippet || '';
  const linkUrl = url || href || '#';

  // Format domain from url
  let domain = source || '';
  if (!domain && linkUrl && linkUrl.startsWith('http')) {
    try {
      domain = new URL(linkUrl).hostname.replace('www.', '');
    } catch {
      domain = 'web';
    }
  }

  return (
    <div className="bg-[#080B0B] border border-[#191F1F] hover:border-[#14B8A6] rounded-xl p-5 flex flex-col justify-between transition-all group shadow-md">
      <div>
        {/* Source and Date Header */}
        <div className="flex items-center justify-between text-xs font-['Roboto_Mono'] text-[#D1D5D5] mb-2.5">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111616] border border-[#191F1F] text-[#14B8A6] text-[11px]">
            <Globe className="w-3 h-3" />
            {domain}
          </span>
          {date && (
            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-['Poppins'] font-semibold text-sm sm:text-base text-[#FFFFFF] group-hover:text-[#14B8A6] transition-colors line-clamp-2 mb-2">
          {title}
        </h4>

        {/* Snippet / Description */}
        <p className="font-['Open_Sans'] text-xs sm:text-sm text-[#D1D5D5] line-clamp-3 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer with External Link */}
      <div className="mt-4 pt-3 border-t border-[#191F1F] flex items-center justify-between">
        <span className="text-[10px] font-['Roboto_Mono'] text-[#D1D5D5] uppercase tracking-wider">
          DuckDuckGo Intel
        </span>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-['Roboto_Mono'] text-[#14B8A6] hover:text-[#FFFFFF] transition-colors"
        >
          <span>Read Source</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

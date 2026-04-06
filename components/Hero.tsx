import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const Hero: React.FC<HeroProps> = ({ onSearch, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };

  const suggestions = [
    "Travel grants for students",
    "Signal Processing Society funding",
    "Women in Engineering scholarships",
    "Humanitarian project funding",
    "Young Professionals meetups"
  ];

  return (
    <div className="bg-[#00629B] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Abstract Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-800 text-blue-100 border border-blue-700">
            <Sparkles className="w-3 h-3 mr-2" />
            Powered by Gemini 3 Flash
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          IEEE Funding Scout
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover grants, scholarships, and funding opportunities across all IEEE Societies, Councils, and Affinity Groups instantly.
        </p>

        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-[#00629B] transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-full text-gray-900 bg-white border-0 shadow-lg ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-white sm:text-lg transition-all"
              placeholder="What kind of funding are you looking for?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 top-2 bottom-2 bg-[#00629B] hover:bg-blue-700 text-white px-6 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-blue-200">
          <span>Try searching for:</span>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setInputValue(s);
                onSearch(s);
              }}
              className="underline hover:text-white decoration-blue-400 underline-offset-4 transition-colors text-left"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8 text-sm text-blue-200/80">
          Looking for more? <a href="https://students.ieee.org/student-opportunities/" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-blue-100 decoration-blue-400/50 underline-offset-4 transition-colors">Visit the IEEE Student Opportunities portal &rarr;</a>
        </div>
      </div>
    </div>
  );
};

export default Hero;

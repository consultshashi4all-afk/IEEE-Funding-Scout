import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import Hero from './components/Hero';
import FundingCard from './components/FundingCard';
import StatsDashboard from './components/StatsDashboard';
import Footer from './components/Footer';
import ImportantLinks from './components/ImportantLinks';
import Planner from './components/Planner';
import DeadlineList from './components/DeadlineList';
import IndiaOpportunities from './components/IndiaOpportunities';
import PetitionFiling from './components/PetitionFiling';
import { ProposalModal } from './components/ProposalModal';
import { FundingCall, SearchState } from './types';
import { searchFundingCalls } from './services/geminiService';
import { Filter, AlertCircle, Loader2, Search, Link as LinkIcon, Calendar, CalendarDays, MapPin, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'links' | 'planner' | 'deadlines' | 'india' | 'petitions'>('search');
  const [state, setState] = useState<SearchState>({
    query: '',
    isLoading: false,
    results: [],
    error: null,
    searchPerformed: false
  });

  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<FundingCall | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setActiveTab('search'); // Ensure we are on the search tab
    setState(prev => ({ ...prev, isLoading: true, error: null, query, searchPerformed: true }));
    
    try {
      const results = await searchFundingCalls(query);
      setState(prev => ({ ...prev, isLoading: false, results }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to fetch funding calls. Please verify your API Key and try again." 
      }));
    }
  }, []);

  const handleDraftProposal = (call: FundingCall) => {
    setSelectedCall(call);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCall(null);
  };

  const filteredResults = state.results.filter(call => {
    if (filterCategory === 'All') return true;
    return call.category === filterCategory;
  });

  const categories = ['All', 'Research', 'Travel', 'Scholarship', 'Award', 'Event', 'Other'];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Hero onSearch={handleSearch} isLoading={state.isLoading} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'search'
                  ? 'bg-[#00629B] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Search className="w-4 h-4 mr-2" />
              Funding Search
            </button>
            <button
              onClick={() => setActiveTab('deadlines')}
              className={`flex items-center px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'deadlines'
                  ? 'bg-[#00629B] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Deadlines
            </button>
            <button
              onClick={() => setActiveTab('india')}
              className={`flex items-center px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'india'
                  ? 'bg-[#00629B] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              India
            </button>
            <button
              onClick={() => setActiveTab('petitions')}
              className={`flex items-center px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'petitions'
                  ? 'bg-[#00629B] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Petitions
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'planner'
                  ? 'bg-[#00629B] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Planner
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'links'
                  ? 'bg-[#00629B] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Important Links
            </button>
          </div>
        </div>

        {activeTab === 'planner' ? (
          <Planner />
        ) : activeTab === 'links' ? (
          <ImportantLinks />
        ) : activeTab === 'deadlines' ? (
          <DeadlineList />
        ) : activeTab === 'india' ? (
          <IndiaOpportunities />
        ) : activeTab === 'petitions' ? (
          <PetitionFiling />
        ) : (
          <>
            {/* Loading State */}
            {state.isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-pulse">
                <Loader2 className="w-12 h-12 mb-4 animate-spin text-[#00629B]" />
                <p className="text-lg">Scouring IEEE websites for funding opportunities...</p>
                <p className="text-sm opacity-70">This typically takes 5-10 seconds.</p>
              </div>
            )}

            {/* Error State */}
            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 flex items-start text-red-700">
                <AlertCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Error</h3>
                  <p>{state.error}</p>
                </div>
              </div>
            )}

            {/* Results Area */}
            {!state.isLoading && state.searchPerformed && !state.error && (
              <div className="space-y-8">
                
                {/* Stats */}
                <StatsDashboard data={state.results} />

                {/* Filter Bar */}
                {state.results.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm sticky top-4 z-20">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <span className="font-semibold text-gray-700 mr-2">{state.results.length}</span>
                      <span className="text-gray-500">Opportunities found</span>
                    </div>
                    
                    <div className="flex items-center overflow-x-auto max-w-full pb-2 sm:pb-0 hide-scrollbar">
                      <Filter className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="flex space-x-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                              filterCategory === cat
                                ? 'bg-[#00629B] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid */}
                {filteredResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResults.map(call => (
                      <FundingCard 
                        key={call.id} 
                        call={call} 
                        onDraftProposal={handleDraftProposal}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No results found for this category.</p>
                    <button 
                      onClick={() => setFilterCategory('All')}
                      className="mt-4 text-[#00629B] font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State / Welcome */}
            {!state.searchPerformed && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#00629B] mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to explore?</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Enter a search term above (e.g., "Student Travel Grants") to find current funding calls from across the IEEE ecosystem.
                </p>
              </div>
            )}
          </>
        )}

      </main>
      
      <Footer />
      
      {/* Proposal Modal */}
      <ProposalModal 
        isOpen={isModalOpen} 
        call={selectedCall} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

// Simple Icon for empty state
function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}

export default App;
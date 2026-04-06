import React, { useEffect, useState } from 'react';
import { searchFundingCalls } from '../services/geminiService';
import { FundingCall } from '../types';
import FundingCard from './FundingCard';
import { Loader2, AlertCircle, MapPin } from 'lucide-react';
import { ProposalModal } from './ProposalModal';

const IndiaOpportunities: React.FC = () => {
  const [results, setResults] = useState<FundingCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<FundingCall | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const data = await searchFundingCalls("IEEE funding grants awards scholarships eligible for Indian citizens students researchers in India");
        setResults(data);
      } catch (err) {
        setError("Failed to fetch opportunities. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const handleDraftProposal = (call: FundingCall) => {
    setSelectedCall(call);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-4">
          <MapPin className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Opportunities for India</h2>
        <p className="text-gray-500 mt-2">Curated list of IEEE grants and awards eligible for Indian applicants.</p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-10 h-10 mb-4 animate-spin text-[#00629B]" />
          <p>Finding opportunities for you...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start text-red-700">
          <AlertCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && results.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No specific opportunities found at this moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(call => (
          <FundingCard 
            key={call.id} 
            call={call} 
            onDraftProposal={handleDraftProposal}
          />
        ))}
      </div>

      <ProposalModal 
        isOpen={isModalOpen} 
        call={selectedCall} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default IndiaOpportunities;

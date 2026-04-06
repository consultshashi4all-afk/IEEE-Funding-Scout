import React, { useEffect, useState } from 'react';
import { searchFundingCalls } from '../services/geminiService';
import { FundingCall } from '../types';
import { Loader2, AlertCircle, CalendarDays, ChevronRight } from 'lucide-react';
import { ProposalModal } from './ProposalModal';

const DeadlineList: React.FC = () => {
  const [groupedCalls, setGroupedCalls] = useState<Record<string, FundingCall[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<FundingCall | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const data = await searchFundingCalls("Open and Active IEEE funding grants awards scholarships deadlines for 2025 2026 sorted by month");
        
        const now = new Date();
        // Reset time part for accurate date comparison
        now.setHours(0, 0, 0, 0);

        // Group by month
        const grouped: Record<string, FundingCall[]> = {};
        
        data.forEach(call => {
          let monthKey = "Upcoming";
          let sortDate = new Date(8640000000000000); // Max date for "Upcoming/Open"

          // Try to parse month from deadline
          const date = new Date(call.deadline);
          
          if (!isNaN(date.getTime())) {
            // It's a valid date
            if (date < now) {
              return; // Skip past deadlines
            }
            monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            sortDate = date;
          } else {
            // Fallback: try to extract month name from string
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const foundMonth = months.find(m => call.deadline.includes(m));
            
            if (foundMonth) {
              // Append year if found, otherwise assume current or next year based on month
              const yearMatch = call.deadline.match(/202[4-6]/);
              let year = now.getFullYear();
              if (yearMatch) {
                year = parseInt(yearMatch[0]);
              } else {
                // If month is earlier than current month, assume next year
                if (months.indexOf(foundMonth) < now.getMonth()) {
                   year += 1;
                }
              }
              
              monthKey = `${foundMonth} ${year}`;
              // Create a date object for sorting
              sortDate = new Date(`${foundMonth} 1, ${year}`);
              
              if (sortDate < now && sortDate.getMonth() !== now.getMonth()) {
                 return; // Skip past months
              }
            } else if (call.deadline.toLowerCase().includes('open') || call.deadline.toLowerCase().includes('rolling')) {
               monthKey = "Rolling / Open";
            }
          }

          if (!grouped[monthKey]) {
            grouped[monthKey] = [];
          }
          grouped[monthKey].push(call);
        });

        // Sort the grouped calls by date
        const sortedGrouped: Record<string, FundingCall[]> = {};
        
        // Helper to get a date from a month string key
        const getDateFromKey = (key: string) => {
            if (key === "Rolling / Open" || key === "Upcoming") return new Date(8640000000000000);
            return new Date(key);
        };

        Object.keys(grouped)
            .sort((a, b) => getDateFromKey(a).getTime() - getDateFromKey(b).getTime())
            .forEach(key => {
                sortedGrouped[key] = grouped[key];
            });

        setGroupedCalls(sortedGrouped);
      } catch (err) {
        setError("Failed to fetch deadlines. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeadlines();
  }, []);

  const handleDraftProposal = (call: FundingCall) => {
    setSelectedCall(call);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
          <CalendarDays className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Monthly Deadlines</h2>
        <p className="text-gray-500 mt-2">Track upcoming opportunities by month.</p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-10 h-10 mb-4 animate-spin text-[#00629B]" />
          <p>Gathering deadlines...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start text-red-700">
          <AlertCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-8">
          {Object.keys(groupedCalls).length === 0 ? (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
               <p className="text-gray-500">No deadlines found.</p>
             </div>
          ) : (
            Object.entries(groupedCalls).map(([month, calls]) => (
              <div key={month} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-bold text-gray-800 flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2 text-[#00629B]" />
                  {month}
                </div>
                <div className="divide-y divide-gray-100">
                  {calls.map(call => (
                    <div key={call.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            call.category === 'Research' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            call.category === 'Travel' ? 'bg-green-100 text-green-700 border-green-200' :
                            call.category === 'Award' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>
                            {call.category}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">{call.organization}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{call.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{call.description}</p>
                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-4">
                          <span className="font-medium text-red-600">Deadline: {call.deadline}</span>
                          <span>Amount: {call.amount}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                         <button
                           onClick={() => handleDraftProposal(call)}
                           className="text-sm font-medium text-[#00629B] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                         >
                           Draft Proposal
                         </button>
                         <a
                           href={call.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="p-2 text-gray-400 hover:text-[#00629B] transition-colors"
                         >
                           <ChevronRight className="w-5 h-5" />
                         </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ProposalModal 
        isOpen={isModalOpen} 
        call={selectedCall} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default DeadlineList;

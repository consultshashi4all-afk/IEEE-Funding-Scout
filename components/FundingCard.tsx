import React from 'react';
import { Calendar, DollarSign, ExternalLink, Users, FileText } from 'lucide-react';
import { FundingCall } from '../types';

interface FundingCardProps {
  call: FundingCall;
  onDraftProposal: (call: FundingCall) => void;
}

const FundingCard: React.FC<FundingCardProps> = ({ call, onDraftProposal }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Research': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Travel': return 'bg-green-100 text-green-700 border-green-200';
      case 'Scholarship': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Award': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Event': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(call.category)}`}>
            {call.category}
          </span>
          <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">
            {call.organization}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#00629B] transition-colors line-clamp-2">
          {call.title}
        </h3>

        <p className="text-gray-600 text-sm mb-6 line-clamp-3">
          {call.description}
        </p>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-semibold text-gray-900">{call.amount}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Deadline: <span className="font-medium text-gray-900">{call.deadline}</span></span>
          </div>
          <div className="flex items-start">
            <Users className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
            <span className="line-clamp-1">{call.eligibility}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center gap-2">
        <button
          onClick={() => onDraftProposal(call)}
          className="flex-1 inline-flex items-center justify-center text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-3 py-1.5 transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4 mr-2 text-[#00629B]" />
          Draft Proposal
        </button>
        <a
          href={call.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-semibold text-[#00629B] hover:text-blue-800 transition-colors px-2"
        >
          View <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default FundingCard;

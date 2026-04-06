import React, { useEffect, useState } from 'react';
import { searchPetitions } from '../services/geminiService';
import { PetitionInfo } from '../types';
import { Loader2, AlertCircle, FileText, ExternalLink, Users, PenTool } from 'lucide-react';

const PetitionFiling: React.FC = () => {
  const [results, setResults] = useState<PetitionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchPetitions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let query = "IEEE petition forms for new chapters affinity groups and nominations";
        
        if (selectedCategory === 'Societies') {
          query = "IEEE Societies petition forms for new chapters and nominations";
        } else if (selectedCategory === 'Councils') {
          query = "IEEE Councils petition forms for new chapters and nominations";
        } else if (selectedCategory === 'Affinity Groups') {
          query = "IEEE Affinity Groups petition forms (WIE, YP, LMAG) for new chapters and nominations";
        }

        const data = await searchPetitions(query, selectedCategory);
        setResults(data);
      } catch (err) {
        setError("Failed to fetch petition information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetitions();
  }, [selectedCategory]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'New Unit': return <Users className="w-5 h-5" />;
      case 'Nomination': return <PenTool className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'New Unit': return 'bg-green-100 text-green-700 border-green-200';
      case 'Nomination': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Petition Filing</h2>
        <p className="text-gray-500 mt-2">Find official forms and guidelines for IEEE petitions.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative inline-block w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:bg-white focus:border-indigo-500 text-gray-700 font-medium shadow-sm"
          >
            <option value="All">All Categories</option>
            <option value="Societies">IEEE Societies</option>
            <option value="Councils">IEEE Councils</option>
            <option value="Affinity Groups">Affinity Groups</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-10 h-10 mb-4 animate-spin text-[#00629B]" />
          <p>Searching for petition information...</p>
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
          <p className="text-gray-500">No petition information found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 ${getColor(item.type)}`}>
                {getIcon(item.type)}
                {item.type}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm font-medium text-gray-500 mb-3">{item.organization}</p>
            <p className="text-gray-600 text-sm mb-6 flex-grow">{item.description}</p>
            
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
            >
              View Petition Details
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetitionFiling;

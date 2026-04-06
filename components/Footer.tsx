import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-white text-lg font-bold mb-1">IEEE Funding Scout</h2>
            <p className="text-sm">Helping members advance technology for humanity.</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="https://students.ieee.org/student-opportunities/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Student Opportunities</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Generated for Demo Purposes. Information sourced via Gemini API.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

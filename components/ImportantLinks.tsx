import React from 'react';
import { ExternalLink, BookOpen, Globe, Award, Users, Zap } from 'lucide-react';

const links = [
  {
    category: "Student Resources",
    items: [
      { name: "IEEE Student Opportunities", url: "https://students.ieee.org/student-opportunities/", icon: Users, description: "Central hub for student competitions, scholarships, and awards." },
      { name: "IEEE Students", url: "https://students.ieee.org/", icon: BookOpen, description: "News, resources, and benefits for IEEE student members." },
      { name: "IEEE Potentials Magazine", url: "https://magazine.ieee.org/", icon: Zap, description: "The magazine dedicated to undergraduate and graduate students." },
      { name: "IEEE Brand Experience", url: "https://brand-experience.ieee.org/", icon: Globe, description: "Official guidelines, logos, and templates for IEEE branding." }
    ]
  },
  {
    category: "Grants & Foundation",
    items: [
      { name: "IEEE Foundation", url: "https://www.ieeefoundation.org/", icon: Globe, description: "Philanthropic arm of IEEE supporting education and humanitarian efforts." },
      { name: "IEEE Humanitarian Technologies", url: "https://hac.ieee.org/", icon: Users, description: "Funding for projects that use technology to address local community challenges." }
    ]
  },
  {
    category: "Research & Publications",
    items: [
      { name: "IEEE Xplore", url: "https://ieeexplore.ieee.org/", icon: BookOpen, description: "Digital library for IEEE journals, conference proceedings, and standards." },
      { name: "IEEE Spectrum", url: "https://spectrum.ieee.org/", icon: Globe, description: "Flagship magazine and website for engineering news and analysis." },
      { name: "IEEE Sitemap", url: "https://www.ieee.org/sitemap.html", icon: Globe, description: "Comprehensive map of all IEEE.org sections and resources." }
    ]
  },
  {
    category: "Awards & Recognition",
    items: [
      { name: "IEEE Awards", url: "https://www.ieee.org/about/awards/index.html", icon: Award, description: "Prestigious awards recognizing exceptional achievements in technology." }
    ]
  }
];

const ImportantLinks: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Important IEEE Resources</h2>
        <p className="text-gray-500 mt-2">Curated links to essential tools, funding sources, and communities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">{section.category}</h3>
            </div>
            <div className="p-2">
              {section.items.map((item, itemIdx) => (
                <a 
                  key={itemIdx} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start p-4 hover:bg-blue-50 rounded-lg transition-colors group"
                >
                  <div className="bg-blue-100 text-[#00629B] p-2 rounded-lg mr-4 group-hover:bg-[#00629B] group-hover:text-white transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 group-hover:text-[#00629B] transition-colors">{item.name}</h4>
                      <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImportantLinks;

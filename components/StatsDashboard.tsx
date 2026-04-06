import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FundingCall } from '../types';

interface StatsDashboardProps {
  data: FundingCall[];
}

const COLORS = ['#00629B', '#00B5E2', '#78BE20', '#FFC20E', '#E87722', '#8A2432'];

const StatsDashboard: React.FC<StatsDashboardProps> = ({ data }) => {
  if (data.length === 0) return null;

  // Process data for category pie chart
  const categoryCount = data.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categoryCount).map(key => ({
    name: key,
    value: categoryCount[key]
  }));

  // Process data for organization bar chart (Top 5)
  const orgCount = data.reduce((acc, curr) => {
    // Simplify org name for chart
    const simpleName = curr.organization.replace('IEEE ', '').split(' ')[0]; 
    acc[simpleName] = (acc[simpleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(orgCount)
    .map(key => ({ name: key, count: orgCount[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Funding Categories</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Top Sources</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#00629B" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;

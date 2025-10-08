'use client'

import { useState } from 'react';
import { Users, Newspaper, FileCheck, ChevronRight, BarChart3, Settings, Bell, Search, Menu } from 'lucide-react';

export default function NewsAnalyticsDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  
  // Sample data
  const stats = {
    totalUsers: 24689,
    newsletterOwners: 1452,
    kycRequests: 387,
    newUsersToday: 143,
    activeSubscriptions: 18724,
    dailyReaders: 8903
  };
  
  // Sample table data
  const recentKycRequests = [
    { id: 'KYC-7829', user: 'James Wilson', email: 'james.w@example.com', status: 'pending', date: '2025-05-14' },
    { id: 'KYC-7828', user: 'Sarah Chen', email: 'schen@example.com', status: 'approved', date: '2025-05-13' },
    { id: 'KYC-7827', user: 'Raj Patel', email: 'raj.patel@example.com', status: 'pending', date: '2025-05-13' },
    { id: 'KYC-7826', user: 'Emma Thompson', email: 'emma.t@example.com', status: 'rejected', date: '2025-05-12' },
    { id: 'KYC-7825', user: 'Miguel Santos', email: 'msantos@example.com', status: 'approved', date: '2025-05-12' },
  ];
  
  const renderTable = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent KYC Requests</h2>
          <button className="text-gold-600 hover:underline flex items-center">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Request ID</th>
                <th className="py-2 px-4 text-left">User</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentKycRequests.map((request) => (
                <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{request.id}</td>
                  <td className="py-3 px-4">{request.user}</td>
                  <td className="py-3 px-4">{request.email}</td>
                  <td className="py-3 px-4">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{request.date}</td>
                  <td className="py-3 px-4">
                    <button className="text-gold-600 hover:underline">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Analytics Card component 
  const StatCard = ({ title, value, icon, change, onClick }: { title: string; value: number; icon: React.ComponentType<{ size?: number; className?: string }>; change?: number; onClick: () => void }) => {
    const Icon = icon;
    return (
      <div 
        className="bg-white rounded-lg shadow-md p-4 relative overflow-hidden cursor-pointer transition hover:shadow-lg"
        onClick={onClick}
      >
        <div className="absolute right-0 top-0 p-4 opacity-10">
          <Icon size={30} className="text-gold-700" />
        </div>
        <h3 className="text-gray-500 font-medium mb-2">{title}</h3>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          {change && (
            <span className="ml-2 text-xs font-medium text-green-600">+{change}%</span>
          )}
        </div>
        <div className="mt-4 flex items-center text-gold-600 text-sm font-medium">
          View Details
          <ChevronRight size={16} className="ml-1" />
        </div>
      </div>
    );
  };
  
  // Main rendering
  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Sidebar and Content */}
      <div className="flex pt-16">
        
        {/* Main Content */}
        <main className=" flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600">Overview of platform performance and metrics</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={Users} 
              change={5.2}
              onClick={() => setActiveView('users')}
            />
            <StatCard 
              title="Newsletter Owners" 
              value={stats.newsletterOwners} 
              icon={Newspaper} 
              change={2.8}
              onClick={() => setActiveView('newsletters')}
            />
            <StatCard 
              title="KYC Requests" 
              value={stats.kycRequests} 
              icon={FileCheck} 
              change={8.4}
              onClick={() => setActiveView('kyc')}
            />
          </div>
          
          {/* Table Section */}
          {renderTable()}
        </main>
      </div>
    </div>
  );
}
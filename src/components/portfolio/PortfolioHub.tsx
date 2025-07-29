import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { PortfolioCard } from './PortfolioCard';
import { CreatePortfolioModal } from './CreatePortfolioModal';

export interface Portfolio {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  creatorId: string;
  creatorName: string;
  creatorRole: 'member' | 'admin' | 'founder';
  expiresAt: Timestamp;
  createdAt: Timestamp;
  status: 'active' | 'expired' | 'pending';
  tags?: string[];
  likes: number;
  views: number;
}

interface PortfolioHubProps {
  user: User;
  userRole: UserRole;
}

export const PortfolioHub: React.FC<PortfolioHubProps> = ({ user, userRole }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'trending'>('active');

  useEffect(() => {
    const q = query(
      collection(db, 'portfolios'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const allPortfolios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Portfolio[];

      const activePortfolios = allPortfolios
        .filter(portfolio => {
          const expiryTime = portfolio.expiresAt.toDate().getTime();
          return expiryTime > now;
        })
        .sort((a, b) => {
          const aTime = a.createdAt.toDate().getTime();
          const bTime = b.createdAt.toDate().getTime();
          return bTime - aTime;
        });
      
      setPortfolios(activePortfolios);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getFilteredPortfolios = () => {
    switch (filter) {
      case 'trending':
        return portfolios.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
      case 'active':
      default:
        return portfolios;
    }
  };

  const getRemainingTime = (expiresAt: Timestamp) => {
    const now = Date.now();
    const expiry = expiresAt.toDate().getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getFilterStats = () => {
    const trending = portfolios.filter(p => (p.likes + p.views) > 5).length;
    return { active: portfolios.length, trending };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950" style={{ backgroundColor: '#0A0A0B' }}>
        <div className="pt-14 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getFilterStats();

  return (
    <div className="min-h-screen bg-gray-950" style={{ backgroundColor: '#0A0A0B' }}>
      <div className="pt-14 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio Hub</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Discover exceptional creative work from our community
                </p>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-1 mb-8 bg-white/5 rounded-lg p-1 w-fit border border-white/8">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md flex items-center space-x-2 ${
                filter === 'active'
                  ? 'bg-white/12 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/6'
              }`}
            >
              <span>Recent</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-mono">{stats.active}</span>
            </button>
            
            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md flex items-center space-x-2 ${
                filter === 'trending'
                  ? 'bg-white/12 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/6'
              }`}
            >
              <span>Trending</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-mono">{stats.trending}</span>
            </button>
          </div>

          {/* Portfolio Grid */}
          {portfolios.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-lg flex items-center justify-center mb-4 border border-white/8">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No portfolios available</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Be the first to share your creative work with the community.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Create First Portfolio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
              {getFilteredPortfolios().map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  remainingTime={getRemainingTime(portfolio.expiresAt)}
                  currentUser={user}
                  currentUserRole={userRole}
                />
              ))}
            </div>
          )}

          <CreatePortfolioModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            user={user}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  );
};

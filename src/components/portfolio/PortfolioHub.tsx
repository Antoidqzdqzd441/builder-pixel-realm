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
    // Simplified query to avoid index requirements - no orderBy to prevent index issues
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

      // Filter expired portfolios and sort by creation date on the client side
      const activePortfolios = allPortfolios
        .filter(portfolio => {
          const expiryTime = portfolio.expiresAt.toDate().getTime();
          return expiryTime > now;
        })
        .sort((a, b) => {
          // Sort by creation date (newest first)
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
    
    if (diff <= 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getFilterStats = () => {
    const trending = portfolios.filter(p => (p.likes + p.views) > 5).length;
    return { active: portfolios.length, trending };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full" />
            <div className="absolute inset-2 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </motion.div>
        </div>
      </div>
    );
  }

  const stats = getFilterStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Creative Hub</h1>
          <p className="text-gray-400">
            Discover exceptional creations from our talented community
          </p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          {/* Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                filter === 'active'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Active</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{stats.active}</span>
            </button>

            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                filter === 'trending'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Trending</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{stats.trending}</span>
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Portfolio</span>
          </button>
        </div>

        {/* Portfolio Grid */}
        {portfolios.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-white mb-2">No active portfolios</h3>
            <p className="text-gray-400 mb-6">
              Be the first to share your creativity with our community!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              Create First Portfolio
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {getFilteredPortfolios().map((portfolio, index) => (
                <motion.div
                  key={portfolio.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  layout
                >
                  <PortfolioCard
                    portfolio={portfolio}
                    remainingTime={getRemainingTime(portfolio.expiresAt)}
                    currentUser={user}
                    currentUserRole={userRole}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Create Portfolio Modal */}
        <CreatePortfolioModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          user={user}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

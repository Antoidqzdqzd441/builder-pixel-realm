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
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
              Hub Créatif
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-2xl -z-10" />
          </div>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Découvrez les créations exceptionnelles de notre communauté d'artistes talentueux
          </p>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col lg:flex-row items-center justify-between mb-10 space-y-6 lg:space-y-0"
        >
          {/* Filters */}
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
            <button
              onClick={() => setFilter('active')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                filter === 'active'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-emerald-400">🔥</span>
              <span>Actifs</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{stats.active}</span>
            </button>
            
            <button
              onClick={() => setFilter('trending')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                filter === 'trending'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-yellow-400">⭐</span>
              <span>Tendances</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{stats.trending}</span>
            </button>
          </div>

          {/* Create Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 border border-white/20"
          >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-lg">Publier mon Portfolio</span>
          </motion.button>
        </motion.div>

        {/* Portfolio Grid */}
        {portfolios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-8xl mb-8"
            >
              🎨
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-4">Aucun portfolio actif</h3>
            <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
              Soyez le premier à partager votre créativité avec notre communauté !
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-2xl shadow-purple-500/25"
            >
              🚀 Créer mon Premier Portfolio
            </motion.button>
          </motion.div>
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

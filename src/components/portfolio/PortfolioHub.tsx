import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
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
    // Simplified query to avoid index requirements
    const q = query(
      collection(db, 'portfolios'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const allPortfolios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Portfolio[];

      // Filter expired portfolios on the client side
      const activePortfolios = allPortfolios.filter(portfolio => {
        const expiryTime = portfolio.expiresAt.toDate().getTime();
        return expiryTime > now;
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Hub Créatif</h1>
            <p className="text-gray-300">
              Découvrez les portfolios temporaires de notre communauté créative
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Publier mon Portfolio</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'active'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Actifs ({portfolios.length})
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'trending'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Tendances
          </button>
        </div>
      </motion.div>

      {/* Portfolio Grid */}
      {portfolios.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun portfolio actif</h3>
          <p className="text-gray-400 mb-6">
            Soyez le premier à partager votre créativité avec la communauté !
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Publier mon Premier Portfolio
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {getFilteredPortfolios().map((portfolio, index) => (
              <motion.div
                key={portfolio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
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
  );
};

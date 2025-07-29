import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../../hooks/useAuth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PortfolioData {
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

interface PortfolioManagementProps {
  userRole: UserRole;
}

export const PortfolioManagement: React.FC<PortfolioManagementProps> = ({ userRole }) => {
  const [portfolios, setPortfolios] = useState<PortfolioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const portfoliosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioData[];
      
      setPortfolios(portfoliosData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPortfolios = portfolios.filter(portfolio => {
    if (filter === 'all') return true;
    return portfolio.status === filter;
  });

  const handleUpdateStatus = async (portfolioId: string, status: 'active' | 'expired' | 'pending') => {
    try {
      await updateDoc(doc(db, 'portfolios', portfolioId), { status });
    } catch (error) {
      console.error('Error updating portfolio status:', error);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce portfolio ?')) {
      try {
        await deleteDoc(doc(db, 'portfolios', portfolioId));
      } catch (error) {
        console.error('Error deleting portfolio:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'expired':
        return 'text-red-400 bg-red-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
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
      return `${hours}h ${minutes}m restantes`;
    }
    return `${minutes}m restantes`;
  };

  const formatDate = (timestamp: Timestamp) => {
    try {
      const date = timestamp.toDate();
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: fr 
      });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Tous ({portfolios.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Actifs ({portfolios.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'expired'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Expirés ({portfolios.filter(p => p.status === 'expired').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            En attente ({portfolios.filter(p => p.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Portfolios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPortfolios.map((portfolio, index) => (
            <motion.div
              key={portfolio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20"
            >
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={portfolio.imageUrl}
                  alt={portfolio.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(portfolio.status)}`}>
                    {portfolio.status === 'active' && '🟢 Actif'}
                    {portfolio.status === 'expired' && '🔴 Expiré'}
                    {portfolio.status === 'pending' && '🟡 En attente'}
                  </div>
                </div>

                {/* Timer */}
                {portfolio.status === 'active' && (
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-white text-xs font-medium">
                      {getRemainingTime(portfolio.expiresAt)}
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                  {portfolio.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {portfolio.description}
                </p>

                {/* Creator Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {portfolio.creatorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300">{portfolio.creatorName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                    <span>❤️ {portfolio.likes}</span>
                    <span>👁️ {portfolio.views}</span>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-400 mb-4">
                  Créé {formatDate(portfolio.createdAt)}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedPortfolio(portfolio);
                      setShowDetailsModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                  >
                    Détails
                  </button>

                  <div className="flex items-center space-x-2">
                    {portfolio.status !== 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(portfolio.id, 'active')}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                      >
                        Activer
                      </button>
                    )}
                    
                    {portfolio.status === 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(portfolio.id, 'expired')}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                      >
                        Expirer
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeletePortfolio(portfolio.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPortfolios.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Aucun portfolio {filter !== 'all' ? filter : ''}
          </h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? 'Aucun portfolio n\'a été publié pour le moment.'
              : `Aucun portfolio avec le statut "${filter}" trouvé.`
            }
          </p>
        </div>
      )}

      {/* Portfolio Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedPortfolio && (
          <PortfolioDetailsModal
            portfolio={selectedPortfolio}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedPortfolio(null);
            }}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeletePortfolio}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface PortfolioDetailsModalProps {
  portfolio: PortfolioData;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'active' | 'expired' | 'pending') => void;
  onDelete: (id: string) => void;
}

const PortfolioDetailsModal: React.FC<PortfolioDetailsModalProps> = ({
  portfolio,
  onClose,
  onUpdateStatus,
  onDelete
}) => {
  const formatDate = (timestamp: Timestamp) => {
    try {
      return timestamp.toDate().toLocaleString('fr-FR');
    } catch (error) {
      return 'Date inconnue';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Détails du Portfolio</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Image */}
            <img
              src={portfolio.imageUrl}
              alt={portfolio.title}
              className="w-full h-64 object-cover rounded-lg"
            />

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Titre</label>
                <div className="text-white">{portfolio.title}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Créateur</label>
                <div className="text-white">{portfolio.creatorName}</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <div className="text-white bg-white/5 rounded-lg p-3">{portfolio.description}</div>
            </div>

            {/* Tags */}
            {portfolio.tags && portfolio.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {portfolio.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{portfolio.likes}</div>
                <div className="text-sm text-gray-400">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{portfolio.views}</div>
                <div className="text-sm text-gray-400">Vues</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{formatDate(portfolio.createdAt)}</div>
                <div className="text-sm text-gray-400">Créé le</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{formatDate(portfolio.expiresAt)}</div>
                <div className="text-sm text-gray-400">Expire le</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    onUpdateStatus(portfolio.id, 'active');
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Activer
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus(portfolio.id, 'expired');
                    onClose();
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Expirer
                </button>
              </div>
              
              <button
                onClick={() => {
                  onDelete(portfolio.id);
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

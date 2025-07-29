import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';
import { Portfolio } from './PortfolioHub';
import { PortfolioModal } from './PortfolioModal';

interface PortfolioCardProps {
  portfolio: Portfolio;
  remainingTime: string;
  currentUser: User;
  currentUserRole: UserRole;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  remainingTime,
  currentUser,
  currentUserRole
}) => {
  const [showModal, setShowModal] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'founder':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'admin':
        return 'text-blue-400 bg-blue-400/20';
      default:
        return 'text-green-400 bg-green-400/20';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'founder':
        return '👑';
      case 'admin':
        return '🔵';
      default:
        return '🟢';
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={portfolio.imageUrl}
            alt={portfolio.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          
          {/* Timer Overlay */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <div className="text-white text-sm font-medium">{remainingTime}</div>
          </div>

          {/* Creator Role Badge */}
          <div className="absolute top-3 left-3">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${getRoleColor(portfolio.creatorRole)}`}>
              <span className="text-xs">{getRoleIcon(portfolio.creatorRole)}</span>
              <span className="text-xs font-medium capitalize">{portfolio.creatorRole}</span>
            </div>
          </div>
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {portfolio.creatorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300">{portfolio.creatorName}</span>
            </div>
          </div>

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {portfolio.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {portfolio.tags.length > 3 && (
                <span className="text-gray-400 text-xs px-2 py-1">
                  +{portfolio.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>{portfolio.likes}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{portfolio.views}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Portfolio Modal */}
      <PortfolioModal
        portfolio={portfolio}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentUser={currentUser}
        currentUserRole={currentUserRole}
      />
    </>
  );
};

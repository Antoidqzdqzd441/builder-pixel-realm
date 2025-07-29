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
  const [imageLoaded, setImageLoaded] = useState(false);

  const getRoleStyles = (role: string) => {
    switch (role) {
      case 'founder':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          gradient: 'from-amber-400 to-amber-500'
        };
      case 'admin':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          text: 'text-blue-400',
          gradient: 'from-blue-400 to-blue-500'
        };
      default:
        return {
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          text: 'text-slate-400',
          gradient: 'from-slate-400 to-slate-500'
        };
    }
  };

  const roleStyles = getRoleStyles(portfolio.creatorRole);

  return (
    <>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-white/8 cursor-pointer hover:bg-white/8 hover:border-white/12 transition-all duration-200"
        onClick={() => setShowModal(true)}
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-white/5">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
          
          <img
            src={portfolio.imageUrl}
            alt={portfolio.title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-105`}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Timer */}
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded px-2 py-1 border border-white/12">
            <span className="text-white text-xs font-mono">{remainingTime}</span>
          </div>

          {/* Role badge */}
          <div className="absolute top-3 left-3">
            <div className={`${roleStyles.bg} ${roleStyles.border} border rounded px-2 py-1 backdrop-blur-sm`}>
              <span className={`text-xs font-medium ${roleStyles.text} capitalize`}>
                {portfolio.creatorRole}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold mb-2 line-clamp-1">
            {portfolio.title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">
            {portfolio.description}
          </p>

          {/* Creator */}
          <div className="flex items-center space-x-2 mb-3">
            <div className={`w-7 h-7 bg-gradient-to-r ${roleStyles.gradient} rounded flex items-center justify-center text-white text-sm font-medium`}>
              {portfolio.creatorName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-medium truncate">
                {portfolio.creatorName}
              </div>
            </div>
          </div>

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {portfolio.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="bg-white/8 text-gray-300 text-xs px-2 py-1 rounded border border-white/12"
                >
                  {tag}
                </span>
              ))}
              {portfolio.tags.length > 2 && (
                <span className="text-gray-500 text-xs px-2 py-1">
                  +{portfolio.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="font-mono">{portfolio.likes}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-mono">{portfolio.views}</span>
              </div>
            </div>

            <button
              className="bg-white/8 hover:bg-white/12 text-white text-xs font-medium px-3 py-1 rounded border border-white/12 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              View
            </button>
          </div>
        </div>
      </motion.div>

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

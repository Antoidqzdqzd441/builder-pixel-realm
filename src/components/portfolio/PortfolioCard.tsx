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

  const getRoleDesign = (role: string) => {
    switch (role) {
      case 'founder':
        return {
          gradient: 'from-yellow-400 to-amber-500',
          textColor: 'text-yellow-200',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-400/20',
          title: 'Founder',
          dotColor: 'bg-yellow-400'
        };
      case 'admin':
        return {
          gradient: 'from-blue-400 to-indigo-500',
          textColor: 'text-blue-200',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-400/20',
          title: 'Admin',
          dotColor: 'bg-blue-400'
        };
      default:
        return {
          gradient: 'from-slate-400 to-slate-500',
          textColor: 'text-slate-200',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-400/20',
          title: 'Member',
          dotColor: 'bg-slate-400'
        };
    }
  };

  const roleDesign = getRoleDesign(portfolio.creatorRole);

  const formatTimeRemaining = (timeStr: string) => {
    if (timeStr === 'Expiré') return 'Expired';
    return timeStr;
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group relative bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300"
        onClick={() => setShowModal(true)}
      >
        {/* Image Container */}
        <div className="relative h-40 overflow-hidden">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 animate-pulse" />
          )}
          
          <img
            src={portfolio.imageUrl}
            alt={portfolio.title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Image Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Timer Badge */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1">
            <div className="text-white text-xs font-medium">
              {formatTimeRemaining(remainingTime)}
            </div>
          </div>

          {/* Role Badge */}
          <div className="absolute top-2 left-2">
            <div className={`${roleDesign.bgColor} ${roleDesign.borderColor} border backdrop-blur-sm rounded-md px-2 py-1`}>
              <div className={`flex items-center space-x-1 ${roleDesign.textColor}`}>
                <div className={`w-2 h-2 ${roleDesign.dotColor} rounded-full`}></div>
                <span className="text-xs font-medium">{roleDesign.title}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative">
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors duration-300">
            {portfolio.title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
            {portfolio.description}
          </p>

          {/* Creator Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${roleDesign.gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {portfolio.creatorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{portfolio.creatorName}</div>
              <div className={`text-xs ${roleDesign.textColor} flex items-center space-x-1`}>
                <span>{roleDesign.icon}</span>
                <span className="font-medium">{roleDesign.title}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {portfolio.tags.slice(0, 3).map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30 font-medium"
                >
                  #{tag}
                </motion.span>
              ))}
              {portfolio.tags.length > 3 && (
                <span className="text-gray-400 text-xs px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  +{portfolio.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-1 text-rose-400 hover:text-rose-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">{portfolio.likes}</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm font-semibold">{portfolio.views}</span>
              </motion.div>
            </div>

            {/* View Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              Découvrir
            </motion.button>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-300 pointer-events-none" />
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

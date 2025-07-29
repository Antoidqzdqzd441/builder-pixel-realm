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
        <div className="p-4 relative">
          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
            {portfolio.title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {portfolio.description}
          </p>

          {/* Creator Info */}
          <div className="flex items-center space-x-2 mb-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${roleDesign.gradient} rounded-lg flex items-center justify-center text-white font-medium text-sm`}>
              {portfolio.creatorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-medium text-sm">{portfolio.creatorName}</div>
              <div className={`text-xs ${roleDesign.textColor}`}>
                {roleDesign.title}
              </div>
            </div>
          </div>

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {portfolio.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="bg-white/10 text-gray-300 text-xs px-2 py-1 rounded border border-white/20"
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
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>{portfolio.likes}</span>
              </div>

              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{portfolio.views}</span>
              </div>
            </div>

            {/* View Button */}
            <button
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1 rounded border border-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              View
            </button>
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

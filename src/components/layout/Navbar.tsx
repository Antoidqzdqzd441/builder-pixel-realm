import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';

interface NavbarProps {
  user: User;
  userRole: UserRole;
  currentView: 'hub' | 'admin' | 'profile' | 'shop';
  onViewChange: (view: 'hub' | 'admin' | 'profile' | 'shop') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userRole,
  currentView,
  onViewChange,
  onLogout
}) => {
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

  const roleDesign = getRoleDesign(userRole.role);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Empty space for balance */}
          <div className="w-48"></div>

          {/* Centered Navigation */}
          <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => onViewChange('hub')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'hub'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Hub
            </button>

            <button
              onClick={() => onViewChange('shop')}
              className={`relative px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'shop'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Shop
              {userRole.credits === 0 && userRole.points >= 5 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {(userRole.role === 'admin' || userRole.role === 'founder') && (
              <button
                onClick={() => onViewChange('admin')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'admin'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Admin
              </button>
            )}

            <button
              onClick={() => onViewChange('profile')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'profile'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Profile
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2 w-48 justify-end">
            {/* Credits and Points Display */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-blue-400">{userRole.points}p</span>
              <span className="text-green-400">{userRole.credits}c</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-white">{userRole.displayName}</span>
                  <div className={`${roleDesign.bgColor} ${roleDesign.borderColor} border rounded px-1 py-0.5`}>
                    <div className={`flex items-center space-x-1 ${roleDesign.textColor}`}>
                      <div className={`w-1 h-1 ${roleDesign.dotColor} rounded-full`}></div>
                      <span className="text-xs">{roleDesign.title}</span>
                    </div>
                  </div>
                </div>
              </div>

              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-6 h-6 rounded border border-white/20"
                />
              )}

              <button
                onClick={onLogout}
                className="w-6 h-6 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded flex items-center justify-center text-red-400 hover:text-red-300 transition-colors text-xs"
                title="Logout"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

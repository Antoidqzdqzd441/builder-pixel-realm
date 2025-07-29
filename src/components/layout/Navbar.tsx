import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';

interface NavbarProps {
  user: User;
  userRole: UserRole;
  currentView: 'hub' | 'admin' | 'profile';
  onViewChange: (view: 'hub' | 'admin' | 'profile') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userRole,
  currentView,
  onViewChange,
  onLogout
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'founder':
        return 'text-yellow-400';
      case 'admin':
        return 'text-blue-400';
      default:
        return 'text-green-400';
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
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">PortfolioHub</h1>
            <div className="text-sm text-gray-300">
              Plateforme créative communautaire
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onViewChange('hub')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'hub'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Hub Créatif
            </button>

            {(userRole.role === 'admin' || userRole.role === 'founder') && (
              <button
                onClick={() => onViewChange('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Admin Panel
              </button>
            )}

            <button
              onClick={() => onViewChange('profile')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'profile'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Mon Profil
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {/* Credits and Points */}
            <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-3 py-2">
              <div className="text-center">
                <div className="text-xs text-gray-400">Points</div>
                <div className="text-sm font-bold text-white">{userRole.points}</div>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Crédits</div>
                <div className="text-sm font-bold text-white">{userRole.credits}</div>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-white">{userRole.displayName}</span>
                  <span className="text-sm">{getRoleIcon(userRole.role)}</span>
                </div>
                <div className={`text-xs ${getRoleColor(userRole.role)} capitalize`}>
                  {userRole.role}
                </div>
              </div>

              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                />
              )}

              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-white transition-colors p-2"
                title="Déconnexion"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

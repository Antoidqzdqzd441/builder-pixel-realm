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
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-2xl border-b border-white/10"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-4"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">P</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 -z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                PortfolioHub
              </h1>
              <p className="text-xs text-gray-400 font-medium">Créativité sans limites</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange('hub')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                currentView === 'hub'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-purple-400">🏠</span>
              <span>Hub</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange('shop')}
              className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                currentView === 'shop'
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-yellow-400">🛒</span>
              <span>Boutique</span>
              {userRole.credits === 0 && userRole.points >= 5 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
                />
              )}
            </motion.button>

            {(userRole.role === 'admin' || userRole.role === 'founder') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange('admin')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  currentView === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-blue-400">⚙️</span>
                <span>Admin</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange('profile')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                currentView === 'profile'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-green-400">👤</span>
              <span>Profil</span>
            </motion.button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {/* Credits and Points Display */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-center"
              >
                <div className="text-xs text-blue-400 font-medium mb-1">Points</div>
                <div className="text-lg font-bold text-white flex items-center space-x-1">
                  <span>🪙</span>
                  <span>{userRole.points}</span>
                </div>
              </motion.div>
              
              <div className="w-px h-8 bg-white/20"></div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-center"
              >
                <div className="text-xs text-green-400 font-medium mb-1">Crédits</div>
                <div className="text-lg font-bold text-white flex items-center space-x-1">
                  <span>💎</span>
                  <span>{userRole.credits}</span>
                </div>
              </motion.div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-semibold text-white">{userRole.displayName}</span>
                  <div className={`${roleDesign.bgColor} ${roleDesign.borderColor} border rounded-lg px-2 py-1`}>
                    <div className={`flex items-center space-x-1 ${roleDesign.textColor}`}>
                      <span className="text-xs">{roleDesign.icon}</span>
                      <span className="text-xs font-bold">{roleDesign.title}</span>
                    </div>
                  </div>
                </div>
              </div>

              {user.photoURL && (
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={user.photoURL}
                  alt="Profile"
                  className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-lg"
                />
              )}

              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 transition-all duration-300"
                title="Déconnexion"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

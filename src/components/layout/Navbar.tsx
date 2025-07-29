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
  const getRoleStyles = (role: string) => {
    switch (role) {
      case 'founder':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          dot: 'bg-amber-400'
        };
      case 'admin':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20', 
          text: 'text-blue-400',
          dot: 'bg-blue-400'
        };
      default:
        return {
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          text: 'text-slate-400', 
          dot: 'bg-slate-400'
        };
    }
  };

  const roleStyles = getRoleStyles(userRole.role);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(10, 10, 11, 0.8)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Left spacer */}
          <div className="w-48"></div>
          
          {/* Centered Navigation */}
          <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1 border border-white/8">
            {[
              { key: 'hub', label: 'Hub' },
              { key: 'shop', label: 'Shop' },
              ...(userRole.role === 'admin' || userRole.role === 'founder' ? [{ key: 'admin', label: 'Admin' }] : []),
              { key: 'profile', label: 'Profile' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onViewChange(key as any)}
                className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-md ${
                  currentView === key
                    ? 'bg-white/12 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/6'
                }`}
              >
                {label}
                {key === 'shop' && userRole.credits === 0 && userRole.points >= 5 && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right: User Info */}
          <div className="flex items-center space-x-3 w-48 justify-end">
            
            {/* Points & Credits */}
            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400">{userRole.points}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                <span className="text-emerald-400">{userRole.credits}</span>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-white font-medium">
                    {userRole.displayName}
                  </span>
                  <div className={`${roleStyles.bg} ${roleStyles.border} border rounded px-1.5 py-0.5`}>
                    <div className={`flex items-center space-x-1 ${roleStyles.text}`}>
                      <div className={`w-1 h-1 ${roleStyles.dot} rounded-full`}></div>
                      <span className="text-xs font-medium capitalize">{userRole.role}</span>
                    </div>
                  </div>
                </div>
              </div>

              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-6 h-6 rounded border border-white/12"
                />
              )}

              <button
                onClick={onLogout}
                className="w-6 h-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                title="Sign out"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

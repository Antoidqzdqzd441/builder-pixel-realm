import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { PortfolioHub } from './portfolio/PortfolioHub';
import { Navbar } from './layout/Navbar';
import { AdminPanel } from './admin/AdminPanel';
import { Shop } from './shop/Shop';

export const Dashboard: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  const [currentView, setCurrentView] = React.useState<'hub' | 'admin' | 'profile'>('hub');

  if (!user || !userRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar 
        user={user}
        userRole={userRole}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={logout}
      />
      
      <main className="pt-20">
        {currentView === 'hub' && <PortfolioHub user={user} userRole={userRole} />}
        {currentView === 'admin' && (userRole.role === 'admin' || userRole.role === 'founder') && (
          <AdminPanel user={user} userRole={userRole} />
        )}
        {currentView === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-8"
          >
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Mon Profil</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-white">{userRole.displayName}</h3>
                    <p className="text-gray-300">{user.email}</p>
                  </div>
                </div>
                
                {userRole.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <p className="text-white bg-white/5 rounded-lg p-3">{userRole.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{userRole.points}</div>
                    <div className="text-sm text-gray-300">Points</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{userRole.credits}</div>
                    <div className="text-sm text-gray-300">Crédits</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white capitalize">{userRole.role}</div>
                    <div className="text-sm text-gray-300">Rôle</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

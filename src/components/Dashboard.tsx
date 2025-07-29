import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { PortfolioHub } from './portfolio/PortfolioHub';
import { Navbar } from './layout/Navbar';
import { AdminPanel } from './admin/AdminPanel';
import { Shop } from './shop/Shop';

export const Dashboard: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  const [currentView, setCurrentView] = React.useState<'hub' | 'admin' | 'profile' | 'shop'>('hub');

  if (!user || !userRole) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0B' }}>
      <Navbar
        user={user}
        userRole={userRole}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={logout}
      />

      <main>
        {currentView === 'hub' && <PortfolioHub user={user} userRole={userRole} />}
        {currentView === 'shop' && (
          <div className="container mx-auto px-4 py-8">
            <Shop user={user} userRole={userRole} />
          </div>
        )}
        {currentView === 'admin' && (userRole.role === 'admin' || userRole.role === 'founder') && (
          <AdminPanel user={user} userRole={userRole} />
        )}
        {currentView === 'profile' && (
          <div className="pt-14 px-6">
            <div className="max-w-2xl mx-auto py-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/8">
                <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Profile</h2>
              
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
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400 font-mono">{userRole.points}</div>
                    <div className="text-sm text-gray-400">Points</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400 font-mono">{userRole.credits}</div>
                    <div className="text-sm text-gray-400">Credits</div>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-400 capitalize">{userRole.role}</div>
                    <div className="text-sm text-gray-400">Role</div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

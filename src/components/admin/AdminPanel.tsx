import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserManagement } from './UserManagement';
import { PortfolioManagement } from './PortfolioManagement';
import { PointsManagement } from './PointsManagement';
import { MaintenanceMode } from './MaintenanceMode';

interface AdminPanelProps {
  user: User;
  userRole: UserRole;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, userRole }) => {
  const [activeTab, setActiveTab] = useState<'utilisateurs' | 'portfolios' | 'maintenance' | 'points'>('utilisateurs');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPortfolios: 0,
    activePortfolios: 0,
    pendingComments: 0
  });

  // Admin credentials
  const ADMIN_EMAIL = 'firefoxytb80@gmail.com';
  const ADMIN_PASSWORD = 'Admin12';

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      const [usersSnap, portfoliosSnap, activeSnap, commentsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'portfolios')),
        getDocs(query(collection(db, 'portfolios'), where('status', '==', 'active'))),
        getDocs(query(collection(db, 'comments'), where('status', '==', 'pending')))
      ]);

      setStats({
        totalUsers: usersSnap.size,
        totalPortfolios: portfoliosSnap.size,
        activePortfolios: activeSnap.size,
        pendingComments: commentsSnap.size
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authForm.email === ADMIN_EMAIL && authForm.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Identifiants invalides');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" style={{ backgroundColor: '#0A0A0B' }}>
        <div className="w-full max-w-md px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-lg p-8 border border-white/8 backdrop-blur-sm"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-lg flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Accès Administrateur</h2>
              <p className="text-gray-400 text-sm">
                Authentification administrative requise
              </p>
            </div>

            {/* Current user info */}
            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium text-sm">{userRole.displayName}</div>
                  <div className="text-gray-400 text-xs">{userRole.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 text-sm font-mono">{userRole.points}p</div>
                  <div className="text-emerald-400 text-sm font-mono">{userRole.credits}c</div>
                </div>
              </div>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                <p className="text-red-400 text-sm">{authError}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Administrateur
                </label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/12 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de Passe Administrateur
                </label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/12 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-md transition-colors"
              >
                S'Authentifier
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Accès restreint • Privilèges administrateur requis
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'utilisateurs', label: 'Utilisateurs', icon: 'users' },
    { id: 'portfolios', label: 'Portfolios', icon: 'briefcase' },
    { id: 'points', label: 'Gestion Points', icon: 'gift' },
    ...(userRole.role === 'founder' ? [{ id: 'maintenance', label: 'Maintenance', icon: 'settings' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-950" style={{ backgroundColor: '#0A0A0B' }}>
      <div className="pt-14 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Panneau d'Administration</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {userRole.role === 'founder' ? 'Accès Fondateur' : 'Accès Administrateur'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Connecté en tant que:</span>
                <span className="text-white font-medium">{ADMIN_EMAIL}</span>
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="ml-4 text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Utilisateurs Total', value: stats.totalUsers, color: 'blue' },
              { label: 'Portfolios Actifs', value: stats.activePortfolios, color: 'emerald' },
              { label: 'Portfolios Total', value: stats.totalPortfolios, color: 'indigo' },
              { label: 'Commentaires en Attente', value: stats.pendingComments, color: 'amber' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 rounded-lg p-6 border border-white/8 hover:bg-white/8 transition-colors cursor-pointer"
              >
                <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
                <div className={`text-2xl font-bold text-${stat.color}-400 font-mono`}>{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mb-8 w-fit border border-white/8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                  activeTab === tab.id
                    ? 'bg-white/12 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/6'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            {activeTab === 'utilisateurs' && <UserManagement userRole={userRole} />}
            {activeTab === 'portfolios' && <PortfolioManagement userRole={userRole} />}
            {activeTab === 'points' && <PointsManagement userRole={userRole} />}
            {activeTab === 'maintenance' && userRole.role === 'founder' && (
              <MaintenanceMode userRole={userRole} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

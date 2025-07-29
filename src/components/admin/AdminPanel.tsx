import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserManagement } from './UserManagement';
import { PortfolioManagement } from './PortfolioManagement';
import { MaintenanceMode } from './MaintenanceMode';
import { AdminLogin } from './AdminLogin';

interface AdminPanelProps {
  user: User;
  userRole: UserRole;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, userRole }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'portfolios' | 'maintenance'>('users');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalPortfolios: 0,
    activePortfolios: 0,
    pendingComments: 0
  });

  useEffect(() => {
    // Load admin stats
    const loadStats = async () => {
      try {
        // Count users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Count portfolios
        const portfoliosSnapshot = await getDocs(collection(db, 'portfolios'));
        const totalPortfolios = portfoliosSnapshot.size;

        // Count active portfolios
        const activePortfoliosSnapshot = await getDocs(
          query(collection(db, 'portfolios'), where('status', '==', 'active'))
        );
        const activePortfolios = activePortfoliosSnapshot.size;

        // Count pending comments
        const pendingCommentsSnapshot = await getDocs(
          query(collection(db, 'comments'), where('status', '==', 'pending'))
        );
        const pendingComments = pendingCommentsSnapshot.size;

        setAdminStats({
          totalUsers,
          totalPortfolios,
          activePortfolios,
          pendingComments
        });
      } catch (error) {
        console.error('Error loading admin stats:', error);
      }
    };

    if (isAdminAuthenticated) {
      loadStats();
    }
  }, [isAdminAuthenticated]);

  if (!isAdminAuthenticated) {
    return (
      <AdminLogin 
        onAuthenticated={() => setIsAdminAuthenticated(true)}
        userRole={userRole}
      />
    );
  }

  const tabs = [
    { id: 'users', label: 'Gestion Utilisateurs', icon: '👥' },
    { id: 'portfolios', label: 'Gestion Portfolios', icon: '🎨' },
    ...(userRole.role === 'founder' ? [{ id: 'maintenance', label: 'Mode Maintenance', icon: '⚙️' }] : [])
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Panel d'Administration
            </h1>
            <p className="text-gray-300">
              {userRole.role === 'founder' ? 'Accès Fondateur' : 'Accès Administrateur'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-center">
                <div className="text-sm text-gray-400">Session Admin</div>
                <div className="text-white font-medium">{userRole.displayName}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Utilisateurs</h3>
                <p className="text-2xl font-bold text-blue-400">{adminStats.totalUsers}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Portfolios Actifs</h3>
                <p className="text-2xl font-bold text-green-400">{adminStats.activePortfolios}</p>
              </div>
              <div className="text-3xl">🎨</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Total Portfolios</h3>
                <p className="text-2xl font-bold text-purple-400">{adminStats.totalPortfolios}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Commentaires Pendants</h3>
                <p className="text-2xl font-bold text-orange-400">{adminStats.pendingComments}</p>
              </div>
              <div className="text-3xl">💬</div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 rounded-lg p-1 flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'users' && (
            <UserManagement userRole={userRole} />
          )}
          
          {activeTab === 'portfolios' && (
            <PortfolioManagement userRole={userRole} />
          )}
          
          {activeTab === 'maintenance' && userRole.role === 'founder' && (
            <MaintenanceMode userRole={userRole} />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

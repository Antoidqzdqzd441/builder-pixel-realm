import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../../hooks/useAuth';
import { collection, getDocs, doc, updateDoc, increment, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface User {
  id: string;
  displayName: string;
  email: string;
  role: string;
  points: number;
  credits: number;
  createdAt: any;
  lastActive: any;
}

interface PointsManagementProps {
  userRole: UserRole;
}

export const PointsManagement: React.FC<PointsManagementProps> = ({ userRole }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkPoints, setBulkPoints] = useState(0);
  const [bulkCredits, setBulkCredits] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low-points' | 'high-points'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Trier par points décroissants
      usersData.sort((a, b) => (b.points || 0) - (a.points || 0));
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const givePointsToUser = async (userId: string, points: number, credits: number = 0) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        points: increment(points),
        ...(credits > 0 && { credits: increment(credits) })
      });
      
      // Recharger les utilisateurs
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de l\'attribution des points:', error);
    }
  };

  const givePointsToBulk = async () => {
    if (selectedUsers.length === 0 || (bulkPoints === 0 && bulkCredits === 0)) return;
    
    setProcessing(true);
    try {
      const promises = selectedUsers.map(userId =>
        updateDoc(doc(db, 'users', userId), {
          ...(bulkPoints !== 0 && { points: increment(bulkPoints) }),
          ...(bulkCredits !== 0 && { credits: increment(bulkCredits) })
        })
      );
      
      await Promise.all(promises);
      setSelectedUsers([]);
      setBulkPoints(0);
      setBulkCredits(0);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de l\'attribution en lot:', error);
    } finally {
      setProcessing(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const filteredUsers = getFilteredUsers();
    setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
                           (filter === 'low-points' && (user.points || 0) < 10) ||
                           (filter === 'high-points' && (user.points || 0) >= 50);
      
      return matchesSearch && matchesFilter;
    });
  };

  const quickActions = [
    { label: 'Bonus Quotidien (+10p)', points: 10, credits: 0, color: 'blue' },
    { label: 'Récompense Hebdo (+25p)', points: 25, credits: 0, color: 'green' },
    { label: 'Super Bonus (+50p + 2c)', points: 50, credits: 2, color: 'purple' },
    { label: 'Événement Spécial (+100p + 5c)', points: 100, credits: 5, color: 'yellow' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs Sélectionnés', value: selectedUsers.length, color: 'indigo' },
          { label: 'Points Moyens', value: Math.round(users.reduce((acc, u) => acc + (u.points || 0), 0) / users.length), color: 'blue' },
          { label: 'Crédits Totaux', value: users.reduce((acc, u) => acc + (u.credits || 0), 0), color: 'emerald' },
          { label: 'Utilisateurs Actifs', value: users.filter(u => (u.points || 0) > 0).length, color: 'purple' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 rounded-lg p-4 border border-white/8"
          >
            <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
            <div className={`text-xl font-bold text-${stat.color}-400 font-mono`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-lg p-6 border border-white/8"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                setBulkPoints(action.points);
                setBulkCredits(action.credits);
              }}
              className={`p-3 rounded-lg border transition-all duration-200 text-left hover:scale-105 ${
                action.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' :
                action.color === 'green' ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20' :
                action.color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20' :
                'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20'
              }`}
            >
              <div className="text-white font-medium text-sm">{action.label}</div>
              <div className="text-gray-300 text-xs mt-1">
                {action.points}p {action.credits > 0 && `+ ${action.credits}c`}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/12 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white/5 border border-white/12 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les utilisateurs</option>
            <option value="low-points">Peu de points (&lt;10)</option>
            <option value="high-points">Beaucoup de points (≥50)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={selectAllUsers}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Tout Sélectionner
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            Désélectionner
          </button>
        </div>
      </div>

      {/* Attribution en lot */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-6"
        >
          <h3 className="text-indigo-300 font-semibold mb-4">
            Attribution en Lot ({selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''})
          </h3>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Points</label>
              <input
                type="number"
                value={bulkPoints}
                onChange={(e) => setBulkPoints(parseInt(e.target.value) || 0)}
                className="px-3 py-2 bg-white/5 border border-white/12 rounded-lg text-white w-24"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Crédits</label>
              <input
                type="number"
                value={bulkCredits}
                onChange={(e) => setBulkCredits(parseInt(e.target.value) || 0)}
                className="px-3 py-2 bg-white/5 border border-white/12 rounded-lg text-white w-24"
                placeholder="0"
              />
            </div>
            
            <button
              onClick={givePointsToBulk}
              disabled={processing || (bulkPoints === 0 && bulkCredits === 0)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {processing ? 'Attribution...' : 'Attribuer'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Liste des utilisateurs */}
      <div className="bg-white/5 rounded-lg border border-white/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8">
          <h3 className="text-lg font-semibold text-white">
            Utilisateurs ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="divide-y divide-white/8">
          {filteredUsers.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`px-6 py-4 hover:bg-white/5 transition-colors ${
                selectedUsers.includes(user.id) ? 'bg-indigo-500/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-4 h-4 text-indigo-600 bg-white/5 border-white/20 rounded focus:ring-indigo-500"
                  />
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{user.displayName || 'Utilisateur'}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'founder' ? 'bg-purple-500/20 text-purple-300' :
                        user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {user.role === 'founder' ? 'Fondateur' : 
                         user.role === 'admin' ? 'Admin' : 'Membre'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-blue-400 font-mono text-lg">{user.points || 0}</div>
                    <div className="text-gray-400 text-xs">Points</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-emerald-400 font-mono text-lg">{user.credits || 0}</div>
                    <div className="text-gray-400 text-xs">Crédits</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => givePointsToUser(user.id, 10)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      +10p
                    </button>
                    <button
                      onClick={() => givePointsToUser(user.id, 0, 1)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
                    >
                      +1c
                    </button>
                    <button
                      onClick={() => givePointsToUser(user.id, -10)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    >
                      -10p
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

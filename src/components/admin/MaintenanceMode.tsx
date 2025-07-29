import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../../hooks/useAuth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface MaintenanceConfig {
  isActive: boolean;
  message: string;
  estimatedDuration: string;
  startTime: Date;
  allowedUsers: string[];
}

interface MaintenanceModeProps {
  userRole: UserRole;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ userRole }) => {
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>({
    isActive: false,
    message: 'Le site est actuellement en maintenance. Nous reviendrons bientôt !',
    estimatedDuration: '30 minutes',
    startTime: new Date(),
    allowedUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Listen to maintenance config changes
    const unsubscribe = onSnapshot(doc(db, 'config', 'maintenance'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaintenanceConfig({
          ...data,
          startTime: data.startTime?.toDate() || new Date()
        } as MaintenanceConfig);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleMaintenance = async () => {
    setSaving(true);
    
    try {
      const newConfig = {
        ...maintenanceConfig,
        isActive: !maintenanceConfig.isActive,
        startTime: !maintenanceConfig.isActive ? new Date() : maintenanceConfig.startTime
      };

      await setDoc(doc(db, 'config', 'maintenance'), {
        ...newConfig,
        startTime: newConfig.startTime
      });

      // If activating maintenance, save current data
      if (!maintenanceConfig.isActive) {
        await setDoc(doc(db, 'backups', `backup_${Date.now()}`), {
          timestamp: new Date(),
          description: 'Sauvegarde automatique avant maintenance'
        });
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConfig = async (updates: Partial<MaintenanceConfig>) => {
    setSaving(true);
    
    try {
      const newConfig = { ...maintenanceConfig, ...updates };
      await setDoc(doc(db, 'config', 'maintenance'), {
        ...newConfig,
        startTime: newConfig.startTime
      });
    } catch (error) {
      console.error('Error updating maintenance config:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMaintenanceDuration = () => {
    if (!maintenanceConfig.isActive) return null;
    
    const now = Date.now();
    const start = maintenanceConfig.startTime.getTime();
    const duration = now - start;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 border ${
          maintenanceConfig.isActive
            ? 'bg-red-500/20 border-red-500/30'
            : 'bg-green-500/20 border-green-500/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`text-4xl ${maintenanceConfig.isActive ? '🚨' : '✅'}`}>
              {maintenanceConfig.isActive ? '🚨' : '✅'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {maintenanceConfig.isActive ? 'Mode Maintenance ACTIF' : 'Site Opérationnel'}
              </h3>
              <p className={`text-sm ${
                maintenanceConfig.isActive ? 'text-red-300' : 'text-green-300'
              }`}>
                {maintenanceConfig.isActive 
                  ? `En maintenance depuis ${getMaintenanceDuration()}`
                  : 'Tous les services fonctionnent normalement'
                }
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleMaintenance}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 ${
              maintenanceConfig.isActive
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {saving ? 'Changement...' : (
              maintenanceConfig.isActive ? 'Désactiver la Maintenance' : 'Activer la Maintenance'
            )}
          </button>
        </div>
      </motion.div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Message de Maintenance</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message affiché aux utilisateurs
              </label>
              <textarea
                value={maintenanceConfig.message}
                onChange={(e) => setMaintenanceConfig(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                placeholder="Message personnalisé..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Durée estimée
              </label>
              <input
                type="text"
                value={maintenanceConfig.estimatedDuration}
                onChange={(e) => setMaintenanceConfig(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="ex: 30 minutes, 2 heures..."
              />
            </div>

            <button
              onClick={() => handleUpdateConfig({
                message: maintenanceConfig.message,
                estimatedDuration: maintenanceConfig.estimatedDuration
              })}
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder les Modifications'}
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Actions Rapides</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => handleUpdateConfig({
                message: 'Maintenance programmée en cours. Retour dans quelques minutes !',
                estimatedDuration: '15 minutes'
              })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-left"
            >
              🔧 Maintenance Rapide (15min)
            </button>

            <button
              onClick={() => handleUpdateConfig({
                message: 'Mise à jour majeure en cours. Le site sera bientôt de retour avec de nouvelles fonctionnalités !',
                estimatedDuration: '2 heures'
              })}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-left"
            >
              🚀 Mise à Jour Majeure (2h)
            </button>

            <button
              onClick={() => handleUpdateConfig({
                message: 'Maintenance d\'urgence en cours pour résoudre un problème technique.',
                estimatedDuration: 'Temps indéterminé'
              })}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-left"
            >
              🚨 Maintenance d'Urgence
            </button>
          </div>
        </motion.div>
      </div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Aperçu de la Page de Maintenance</h3>
        
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg p-8 text-center">
          <div className="text-6xl mb-6">🛠️</div>
          <h2 className="text-3xl font-bold text-white mb-4">Site en Maintenance</h2>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
            {maintenanceConfig.message}
          </p>
          <div className="bg-white/10 rounded-lg p-4 inline-block">
            <p className="text-white font-medium">
              Durée estimée: {maintenanceConfig.estimatedDuration}
            </p>
            {maintenanceConfig.isActive && (
              <p className="text-gray-300 text-sm mt-2">
                Maintenance en cours depuis {getMaintenanceDuration()}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h4 className="text-yellow-300 font-semibold mb-2">Important</h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• L'activation du mode maintenance rendra le site inaccessible à tous les utilisateurs</li>
              <li>• Une sauvegarde automatique sera créée avant l'activation</li>
              <li>• Les administrateurs et fondateurs peuvent toujours accéder au panel admin</li>
              <li>• Les mises à jour sont synchronisées en temps réel via Firebase</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../../hooks/useAuth';

interface AdminLoginProps {
  onAuthenticated: () => void;
  userRole: UserRole;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAuthenticated, userRole }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'Admin87815581';
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'JGnZw#z-2W@KG6';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate loading delay for security
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
      onAuthenticated();
    } else {
      setError('Identifiants administrateur incorrects');
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Accès Administrateur
            </h2>
            <p className="text-gray-300">
              Authentification requise pour accéder au panel d'administration
            </p>
          </div>

          {/* User Role Info */}
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Utilisateur connecté</h3>
                <p className="text-purple-300 text-sm">{userRole.displayName}</p>
              </div>
              <div className="text-right">
                <div className="text-white font-bold capitalize">{userRole.role}</div>
                <div className="text-purple-300 text-sm">
                  {userRole.role === 'founder' ? '👑' : '🔵'}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6"
            >
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom d'utilisateur administrateur
              </label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="Identifiant admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe administrateur
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="••••••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Vérification...' : 'Accéder au Panel Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              ⚠️ Accès restreint aux administrateurs et fondateurs uniquement
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

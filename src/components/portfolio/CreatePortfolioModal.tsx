import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';
import { collection, addDoc, updateDoc, doc, increment, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  userRole: UserRole;
}

export const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({
  isOpen,
  onClose,
  user,
  userRole
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    tags: '',
    duration: 1 // hours
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRole.credits < formData.duration) {
      setError(`Vous n'avez pas assez de crédits. Il vous faut ${formData.duration} crédit(s) mais vous n'en avez que ${userRole.credits}.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate expiration time
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (formData.duration * 60 * 60 * 1000));

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create portfolio
      await addDoc(collection(db, 'portfolios'), {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        creatorId: user.uid,
        creatorName: userRole.displayName,
        creatorRole: userRole.role,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: Timestamp.now(),
        status: 'active',
        tags: tags,
        likes: 0,
        views: 0
      });

      // Deduct credits from user
      await updateDoc(doc(db, 'users', user.uid), {
        credits: increment(-formData.duration)
      });

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        tags: '',
        duration: 1
      });
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Publier mon Portfolio</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Credits Info */}
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Vos crédits disponibles</h3>
                  <p className="text-purple-300 text-sm">
                    1 crédit = 1 heure de visibilité sur le hub
                  </p>
                </div>
                <div className="text-2xl font-bold text-white">
                  {userRole.credits} 💎
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre du portfolio *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Mon incroyable projet..."
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                  placeholder="Décrivez votre projet, les techniques utilisées, votre inspiration..."
                  required
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {formData.description.length}/500 caractères
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de l'image *
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="https://example.com/mon-image.jpg"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Utilisez un service comme Imgur, Unsplash, ou votre propre hébergement
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (facultatif)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="design, illustration, photographie (séparés par des virgules)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Durée de visibilité *
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  required
                >
                  <option value={1}>1 heure (1 crédit)</option>
                  <option value={2}>2 heures (2 crédits)</option>
                  <option value={4}>4 heures (4 crédits)</option>
                  <option value={8}>8 heures (8 crédits)</option>
                  <option value={12}>12 heures (12 crédits)</option>
                  <option value={24}>24 heures (24 crédits)</option>
                </select>
              </div>

              {/* Preview */}
              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Aperçu
                  </label>
                  <div className="bg-white/5 rounded-lg p-4">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+introuvable';
                      }}
                    />
                    <h3 className="text-white font-medium mb-1">{formData.title || 'Titre du portfolio'}</h3>
                    <p className="text-gray-300 text-sm">
                      {formData.description || 'Description du portfolio...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  disabled={loading || userRole.credits < formData.duration}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                >
                  {loading ? 'Publication...' : `Publier (${formData.duration} crédit${formData.duration > 1 ? 's' : ''})`}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

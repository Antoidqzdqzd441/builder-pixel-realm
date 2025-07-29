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
      setError(`Insufficient credits. Need ${formData.duration} credit(s) but you only have ${userRole.credits}.`);
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
          className="bg-white/10 backdrop-blur-md rounded-lg max-w-md w-full p-6 border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Create Portfolio</h2>
            <button
              onClick={onClose}
              className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Credits Info */}
          <div className={`border rounded-md p-3 mb-4 ${
            userRole.credits === 0 
              ? 'bg-red-500/20 border-red-500/30' 
              : 'bg-blue-500/10 border-blue-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">
                  {userRole.credits === 0 ? 'No credits available' : 'Available credits'}
                </div>
                <div className={`text-xs ${
                  userRole.credits === 0 ? 'text-red-300' : 'text-blue-300'
                }`}>
                  {userRole.credits === 0 
                    ? 'Buy credits in shop to publish!' 
                    : '1 credit = 1 hour visibility'
                  }
                </div>
              </div>
              <div className="text-xl font-bold text-white">
                {userRole.credits}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-md p-2 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 text-sm"
                placeholder="Portfolio title..."
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 resize-none text-sm"
                placeholder="Describe your project..."
                required
                maxLength={300}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {formData.description.length}/300
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 text-sm"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 text-sm"
                  placeholder="design, art"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Duration *
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                  required
                >
                  <option value={1}>1h (1 credit)</option>
                  <option value={2}>2h (2 credits)</option>
                  <option value={4}>4h (4 credits)</option>
                  <option value={8}>8h (8 credits)</option>
                  <option value={12}>12h (12 credits)</option>
                  <option value={24}>24h (24 credits)</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || userRole.credits < formData.duration}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors text-sm"
              >
                {loading ? 'Publishing...' : `Publish (${formData.duration} credit${formData.duration > 1 ? 's' : ''})`}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

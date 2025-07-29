import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';
import { Portfolio } from './PortfolioHub';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { CommentsList } from './CommentsList';
import { useCommentModeration } from '../../hooks/useCommentModeration';
import { pointsSystem } from '../../services/pointsSystem';

interface Comment {
  id: string;
  portfolioId: string;
  authorId: string;
  authorName: string;
  authorRole: 'member' | 'admin' | 'founder';
  content: string;
  createdAt: any;
  status: 'approved' | 'pending' | 'rejected';
}

interface PortfolioModalProps {
  portfolio: Portfolio;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentUserRole: UserRole;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  portfolio,
  isOpen,
  onClose,
  currentUser,
  currentUserRole
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [commentSubmissionStatus, setCommentSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { submitComment } = useCommentModeration();

  useEffect(() => {
    if (isOpen && !hasViewed) {
      // Increment view count
      updateDoc(doc(db, 'portfolios', portfolio.id), {
        views: increment(1)
      });

      // Award points to portfolio creator for view (occasionally)
      if (portfolio.creatorId !== currentUser.uid) {
        pointsSystem.awardViewPoints(portfolio.creatorId);
      }

      setHasViewed(true);
    }
  }, [isOpen, hasViewed, portfolio.id, portfolio.creatorId, currentUser.uid]);

  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'comments'),
      where('portfolioId', '==', portfolio.id),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [isOpen, portfolio.id]);

  const handleLike = async () => {
    if (isLiked) return;
    
    try {
      await updateDoc(doc(db, 'portfolios', portfolio.id), {
        likes: increment(1)
      });
      setIsLiked(true);
    } catch (error) {
      console.error('Error liking portfolio:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    setCommentSubmissionStatus('idle');
    
    try {
      const result = await submitComment(
        portfolio.id,
        currentUser.uid,
        currentUserRole.displayName,
        currentUserRole.role,
        newComment.trim()
      );
      
      if (result.success) {
        setNewComment('');
        setCommentSubmissionStatus('success');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setCommentSubmissionStatus('idle');
        }, 3000);
      } else {
        setCommentSubmissionStatus('error');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setCommentSubmissionStatus('error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'founder':
        return 'text-yellow-400';
      case 'admin':
        return 'text-blue-400';
      default:
        return 'text-green-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'founder':
        return '👑';
      case 'admin':
        return '🔵';
      default:
        return '🟢';
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
          className="bg-white/10 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Image Section */}
            <div className="relative">
              <img
                src={portfolio.imageUrl}
                alt={portfolio.title}
                className="w-full h-64 lg:h-full object-cover"
              />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Section */}
            <div className="flex flex-col h-64 lg:h-full">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white mb-2">{portfolio.title}</h2>
                <p className="text-gray-300 mb-4">{portfolio.description}</p>
                
                {/* Creator Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {portfolio.creatorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{portfolio.creatorName}</span>
                        <span className="text-sm">{getRoleIcon(portfolio.creatorRole)}</span>
                      </div>
                      <span className={`text-sm ${getRoleColor(portfolio.creatorRole)} capitalize`}>
                        {portfolio.creatorRole}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleLike}
                      disabled={isLiked}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                        isLiked
                          ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                          : 'bg-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-400'
                      }`}
                    >
                      <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span>{portfolio.likes}</span>
                    </button>
                    
                    <div className="flex items-center space-x-1 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{portfolio.views}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {portfolio.tags && portfolio.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {portfolio.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Commentaires ({comments.length})
                  </h3>
                  
                  {/* Comment Status Messages */}
                  <AnimatePresence>
                    {commentSubmissionStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">✅</span>
                          <p className="text-green-200 text-sm">
                            Commentaire envoyé ! Il sera visible après modération par notre IA.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    
                    {commentSubmissionStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-red-400">❌</span>
                          <p className="text-red-200 text-sm">
                            Erreur lors de l'envoi du commentaire. Veuillez réessayer.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Add Comment Form */}
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Partagez votre avis sur ce portfolio... (modéré par IA)"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                      rows={3}
                      maxLength={500}
                      disabled={submittingComment}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {newComment.length}/500 caractères
                        </span>
                        <span className="text-xs text-purple-300">🤖 Modération IA</span>
                      </div>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || submittingComment}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        {submittingComment ? 'Envoi...' : 'Commenter'}
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    💡 Les commentaires sont automatiquement modérés par notre IA pour maintenir un environnement respectueux.
                  </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto">
                  <CommentsList comments={comments} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

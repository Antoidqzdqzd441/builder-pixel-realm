import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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

interface CommentsListProps {
  comments: Comment[];
}

export const CommentsList: React.FC<CommentsListProps> = ({ comments }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'founder':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'admin':
        return 'text-blue-400 bg-blue-400/20';
      default:
        return 'text-green-400 bg-green-400/20';
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'À l\'instant';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: fr 
      });
    } catch (error) {
      return 'À l\'instant';
    }
  };

  if (comments.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">💬</div>
        <p className="text-gray-400">Aucun commentaire pour le moment</p>
        <p className="text-sm text-gray-500 mt-2">
          Soyez le premier à partager votre avis !
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {comments.map((comment, index) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {comment.authorName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-white">{comment.authorName}</span>
                
                {/* Role Badge */}
                <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${getRoleColor(comment.authorRole)}`}>
                  <span>{getRoleIcon(comment.authorRole)}</span>
                  <span className="capitalize">{comment.authorRole}</span>
                </div>
                
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {/* Comment Content */}
              <p className="text-gray-300 text-sm leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

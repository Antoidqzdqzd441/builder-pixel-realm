import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { aiModeration } from '../services/aiModeration';
import { pointsSystem } from '../services/pointsSystem';

export interface Comment {
  id: string;
  portfolioId: string;
  authorId: string;
  authorName: string;
  authorRole: 'member' | 'admin' | 'founder';
  content: string;
  createdAt: any;
  status: 'approved' | 'pending' | 'rejected';
  moderationReason?: string;
  moderationConfidence?: number;
}

export const useCommentModeration = () => {
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to pending comments for manual review
    const q = query(
      collection(db, 'comments'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      
      setPendingComments(comments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const submitComment = async (
    portfolioId: string,
    authorId: string,
    authorName: string,
    authorRole: 'member' | 'admin' | 'founder',
    content: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, add comment as pending
      const commentRef = await addDoc(collection(db, 'comments'), {
        portfolioId,
        authorId,
        authorName,
        authorRole,
        content,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      // Then moderate with AI in background
      moderateCommentAsync(commentRef.id, content);

      return { success: true };
    } catch (error) {
      console.error('Error submitting comment:', error);
      return { success: false, error: 'Erreur lors de l\'envoi du commentaire' };
    }
  };

  const moderateCommentAsync = async (commentId: string, content: string) => {
    try {
      // Get AI moderation result
      const moderationResult = await aiModeration.moderateComment(content);
      
      // Update comment status based on AI decision
      await updateDoc(doc(db, 'comments', commentId), {
        status: moderationResult.isApproved ? 'approved' : 'rejected',
        moderationReason: moderationResult.reason || null,
        moderationConfidence: moderationResult.confidence,
        moderatedAt: serverTimestamp()
      });

      // Award points if comment is approved
      if (moderationResult.isApproved) {
        // Get comment data to find author
        const commentDoc = await getDoc(doc(db, 'comments', commentId));
        if (commentDoc.exists()) {
          const commentData = commentDoc.data();
          await pointsSystem.awardCommentPoints(commentData.authorId);
        }
      }

    } catch (error) {
      console.error('Error in AI moderation:', error);
      
      // If AI moderation fails, leave as pending for manual review
      await updateDoc(doc(db, 'comments', commentId), {
        status: 'pending',
        moderationReason: 'Erreur de modération automatique - révision manuelle requise',
        moderatedAt: serverTimestamp()
      });
    }
  };

  const manuallyApproveComment = async (commentId: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        status: 'approved',
        moderationReason: 'Approuvé manuellement par un administrateur',
        moderatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error approving comment:', error);
      return false;
    }
  };

  const manuallyRejectComment = async (commentId: string, reason: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        status: 'rejected',
        moderationReason: reason,
        moderatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error rejecting comment:', error);
      return false;
    }
  };

  return {
    pendingComments,
    loading,
    submitComment,
    manuallyApproveComment,
    manuallyRejectComment
  };
};

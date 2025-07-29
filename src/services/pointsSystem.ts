import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export interface PointsReward {
  action: 'like_received' | 'comment_posted' | 'portfolio_viewed' | 'signup_bonus';
  points: number;
  description: string;
}

const POINTS_CONFIG: Record<string, PointsReward> = {
  like_received: {
    action: 'like_received',
    points: 1,
    description: 'Like reçu sur votre portfolio'
  },
  comment_posted: {
    action: 'comment_posted',
    points: 2,
    description: 'Commentaire publié'
  },
  portfolio_viewed: {
    action: 'portfolio_viewed',
    points: 0.1,
    description: 'Vue sur votre portfolio'
  },
  signup_bonus: {
    action: 'signup_bonus',
    points: 25,
    description: 'Bonus d\'inscription'
  }
};

export class PointsSystem {
  private static instance: PointsSystem;

  private constructor() {}

  public static getInstance(): PointsSystem {
    if (!PointsSystem.instance) {
      PointsSystem.instance = new PointsSystem();
    }
    return PointsSystem.instance;
  }

  async awardPoints(userId: string, action: keyof typeof POINTS_CONFIG): Promise<void> {
    try {
      const reward = POINTS_CONFIG[action];
      if (!reward) {
        console.warn(`Unknown action: ${action}`);
        return;
      }

      await updateDoc(doc(db, 'users', userId), {
        points: increment(reward.points)
      });

      // Optionally log the transaction
      console.log(`Awarded ${reward.points} points to ${userId} for ${action}`);
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }

  async awardLikePoints(portfolioCreatorId: string): Promise<void> {
    await this.awardPoints(portfolioCreatorId, 'like_received');
  }

  async awardCommentPoints(commentAuthorId: string): Promise<void> {
    await this.awardPoints(commentAuthorId, 'comment_posted');
  }

  async awardViewPoints(portfolioCreatorId: string): Promise<void> {
    // Only award view points occasionally to prevent spam
    if (Math.random() < 0.1) { // 10% chance
      await this.awardPoints(portfolioCreatorId, 'portfolio_viewed');
    }
  }

  getPointsConfig(): Record<string, PointsReward> {
    return POINTS_CONFIG;
  }
}

export const pointsSystem = PointsSystem.getInstance();

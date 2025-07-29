import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserRole } from '../../hooks/useAuth';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface ShopProps {
  user: User;
  userRole: UserRole;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  pointsCost: number;
  popular?: boolean;
  bonus?: number;
  description: string;
  gradient: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 1,
    pointsCost: 5,
    description: '1 hour visibility',
    gradient: 'from-slate-400 to-slate-600'
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 5,
    pointsCost: 20,
    bonus: 1,
    description: '5 hours + 1 bonus',
    gradient: 'from-blue-400 to-blue-600',
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 12,
    pointsCost: 40,
    bonus: 3,
    description: '12 hours + 3 bonus',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    credits: 25,
    pointsCost: 75,
    bonus: 10,
    description: '25 hours + 10 bonus',
    gradient: 'from-yellow-400 to-orange-500'
  }
];

export const Shop: React.FC<ShopProps> = ({ user, userRole }) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [lastPurchase, setLastPurchase] = useState<CreditPackage | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    if (userRole.points < pkg.pointsCost) {
      alert(`Not enough points! You need ${pkg.pointsCost} points.`);
      return;
    }

    setPurchasing(pkg.id);

    try {
      const totalCredits = pkg.credits + (pkg.bonus || 0);
      
      // Update user points and credits
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(-pkg.pointsCost),
        credits: increment(totalCredits)
      });

      setLastPurchase(pkg);
      
      // Hide success message after 3 seconds
      setTimeout(() => setLastPurchase(null), 3000);

    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('Purchase error. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Credit Shop</h1>
        <p className="text-gray-400">
          Convert your points to credits for portfolio publishing
        </p>
      </div>

      {/* Current Balance */}
      <div className="flex items-center justify-center space-x-8 bg-white/5 rounded-lg p-4 max-w-sm mx-auto border border-white/10">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">{userRole.points}</div>
          <div className="text-sm text-gray-400">Points</div>
        </div>
        <div className="text-gray-400">→</div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">{userRole.credits}</div>
          <div className="text-sm text-gray-400">Credits</div>
        </div>
      </div>

      {/* Success Message */}
      {lastPurchase && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center max-w-md mx-auto"
        >
          <h3 className="text-lg font-semibold text-green-300 mb-1">Purchase Successful!</h3>
          <p className="text-green-200 text-sm">
            You received {lastPurchase.credits + (lastPurchase.bonus || 0)} credits!
          </p>
        </motion.div>
      )}

      {/* Credit Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {creditPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white/5 backdrop-blur-sm rounded-lg p-4 border transition-all duration-300 hover:bg-white/10 ${
              pkg.popular 
                ? 'border-blue-500/50 bg-blue-500/10' 
                : 'border-white/10'
            }`}
          >
            {/* Popular Badge */}
            {pkg.popular && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  POPULAR
                </div>
              </div>
            )}

            {/* Package Content */}
            <div className="text-center">
              {/* Icon */}
              <div className={`w-12 h-12 bg-gradient-to-r ${pkg.gradient} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <div className="w-6 h-6 bg-white/20 rounded"></div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{pkg.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
              
              {/* Credits Display */}
              <div className="mb-3">
                <div className="text-xl font-bold text-green-400 mb-1">
                  {pkg.credits} {pkg.bonus && `+${pkg.bonus}`} credits
                </div>
                {pkg.bonus && (
                  <div className="text-xs text-green-300">
                    {pkg.bonus} bonus credits!
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="text-lg font-bold text-blue-400 mb-1">
                  {pkg.pointsCost} points
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round((pkg.pointsCost / (pkg.credits + (pkg.bonus || 0))) * 10) / 10} pts/credit
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handlePurchase(pkg)}
                disabled={purchasing === pkg.id || userRole.points < pkg.pointsCost}
                className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                  userRole.points < pkg.pointsCost
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : pkg.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                } ${purchasing === pkg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {purchasing === pkg.id ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Purchasing...</span>
                  </div>
                ) : userRole.points < pkg.pointsCost ? (
                  'Insufficient Points'
                ) : (
                  'Purchase'
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How to Earn Points */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-white mb-3 text-center">How to Earn Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-3 bg-white/5 rounded p-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
            </div>
            <div>
              <div className="text-white font-medium">Sign Up</div>
              <div className="text-gray-400">25 free points</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 rounded p-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
            </div>
            <div>
              <div className="text-white font-medium">Likes Received</div>
              <div className="text-gray-400">1 point per like</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 rounded p-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
            </div>
            <div>
              <div className="text-white font-medium">Comments</div>
              <div className="text-gray-400">2 points per comment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

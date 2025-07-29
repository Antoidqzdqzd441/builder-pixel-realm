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
  value: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 1,
    pointsCost: 5,
    description: '1 hour visibility',
    value: 'Perfect for testing'
  },
  {
    id: 'growth',
    name: 'Growth',
    credits: 5,
    pointsCost: 20,
    bonus: 1,
    description: '6 hours total',
    value: 'Most popular choice',
    popular: true
  },
  {
    id: 'scale', 
    name: 'Scale',
    credits: 12,
    pointsCost: 40,
    bonus: 3,
    description: '15 hours total',
    value: 'Best value package'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 25,
    pointsCost: 75,
    bonus: 10,
    description: '35 hours total',
    value: 'Maximum exposure'
  }
];

export const Shop: React.FC<ShopProps> = ({ user, userRole }) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [lastPurchase, setLastPurchase] = useState<CreditPackage | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    if (userRole.points < pkg.pointsCost) {
      alert(`Insufficient points. Required: ${pkg.pointsCost}, Available: ${userRole.points}`);
      return;
    }

    setPurchasing(pkg.id);

    try {
      const totalCredits = pkg.credits + (pkg.bonus || 0);
      
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(-pkg.pointsCost),
        credits: increment(totalCredits)
      });

      setLastPurchase(pkg);
      setTimeout(() => setLastPurchase(null), 3000);

    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950" style={{ backgroundColor: '#0A0A0B' }}>
      <div className="pt-14 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="py-8 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Credit Store</h1>
            <p className="text-gray-400">
              Convert points to credits for portfolio visibility
            </p>
          </div>

          {/* Balance */}
          <div className="bg-white/5 rounded-lg p-6 mb-8 border border-white/8">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 font-mono">{userRole.points}</div>
                <div className="text-sm text-gray-400 font-medium">Points Available</div>
              </div>
              <div className="w-px h-12 bg-white/12"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 font-mono">{userRole.credits}</div>
                <div className="text-sm text-gray-400 font-medium">Credits Owned</div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {lastPurchase && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-8 text-center"
            >
              <div className="text-emerald-400 font-medium">
                Purchase successful! Received {lastPurchase.credits + (lastPurchase.bonus || 0)} credits.
              </div>
            </motion.div>
          )}

          {/* Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {creditPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white/5 rounded-lg p-6 border transition-all duration-200 hover:bg-white/8 ${
                  pkg.popular 
                    ? 'border-indigo-500/30 bg-indigo-500/5' 
                    : 'border-white/8 hover:border-white/12'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded">
                      POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-white/8 rounded-lg flex items-center justify-center mx-auto mb-4 border border-white/12">
                    <div className="w-6 h-6 bg-white/20 rounded"></div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-1">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{pkg.value}</p>
                  
                  {/* Credits */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">
                      {pkg.credits}
                      {pkg.bonus && <span className="text-emerald-300">+{pkg.bonus}</span>}
                    </div>
                    <div className="text-xs text-gray-400">{pkg.description}</div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-xl font-bold text-blue-400 mb-1">
                      {pkg.pointsCost}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {(pkg.pointsCost / (pkg.credits + (pkg.bonus || 0))).toFixed(1)} pts/credit
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing === pkg.id || userRole.points < pkg.pointsCost}
                    className={`w-full py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${
                      userRole.points < pkg.pointsCost
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/8'
                        : pkg.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-white/8 hover:bg-white/12 text-white border border-white/12'
                    } ${purchasing === pkg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {purchasing === pkg.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
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

          {/* How to earn */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/8">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Earn Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Sign Up Bonus', desc: '25 points', color: 'emerald' },
                { title: 'Receive Likes', desc: '1 point each', color: 'rose' },
                { title: 'Post Comments', desc: '2 points each', color: 'blue' }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 bg-white/5 rounded-lg p-4 border border-white/8">
                  <div className={`w-10 h-10 bg-${item.color}-500/10 rounded-lg flex items-center justify-center border border-${item.color}-500/20`}>
                    <div className={`w-4 h-4 bg-${item.color}-400 rounded`}></div>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{item.title}</div>
                    <div className="text-gray-400 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

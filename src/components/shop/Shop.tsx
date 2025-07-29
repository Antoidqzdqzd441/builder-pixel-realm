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
  icon: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'basic',
    name: 'Pack Basique',
    credits: 1,
    pointsCost: 5,
    description: '1 heure de visibilité',
    icon: '⚡'
  },
  {
    id: 'standard',
    name: 'Pack Standard',
    credits: 5,
    pointsCost: 20,
    bonus: 1,
    description: '5 heures + 1 bonus',
    icon: '🚀',
    popular: true
  },
  {
    id: 'premium',
    name: 'Pack Premium',
    credits: 12,
    pointsCost: 40,
    bonus: 3,
    description: '12 heures + 3 bonus',
    icon: '💎'
  },
  {
    id: 'ultimate',
    name: 'Pack Ultimate',
    credits: 25,
    pointsCost: 75,
    bonus: 10,
    description: '25 heures + 10 bonus',
    icon: '👑'
  }
];

export const Shop: React.FC<ShopProps> = ({ user, userRole }) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [lastPurchase, setLastPurchase] = useState<CreditPackage | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    if (userRole.points < pkg.pointsCost) {
      alert(`Vous n'avez pas assez de points ! Il vous faut ${pkg.pointsCost} points.`);
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
      alert('Erreur lors de l\'achat. Veuillez réessayer.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">🛒 Boutique de Crédits</h1>
        <p className="text-gray-300 mb-6">
          Convertissez vos points en crédits pour publier vos portfolios
        </p>
        
        {/* Current Balance */}
        <div className="flex items-center justify-center space-x-6 bg-white/10 rounded-xl p-4 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{userRole.points}</div>
            <div className="text-sm text-gray-400">Points</div>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{userRole.credits}</div>
            <div className="text-sm text-gray-400">Crédits</div>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      {lastPurchase && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center max-w-md mx-auto"
        >
          <div className="text-2xl mb-2">🎉</div>
          <h3 className="text-lg font-semibold text-green-300 mb-1">Achat réussi !</h3>
          <p className="text-green-200 text-sm">
            Vous avez reçu {lastPurchase.credits + (lastPurchase.bonus || 0)} crédits !
          </p>
        </motion.div>
      )}

      {/* Credit Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {creditPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
              pkg.popular 
                ? 'border-purple-500/50 bg-purple-500/10' 
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            {/* Popular Badge */}
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAIRE
                </div>
              </div>
            )}

            {/* Package Content */}
            <div className="text-center">
              <div className="text-4xl mb-3">{pkg.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{pkg.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{pkg.description}</p>
              
              {/* Credits Display */}
              <div className="mb-4">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {pkg.credits} {pkg.bonus && `+${pkg.bonus}`} crédits
                </div>
                {pkg.bonus && (
                  <div className="text-xs text-green-300">
                    {pkg.bonus} crédits bonus !
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="text-xl font-bold text-blue-400 mb-1">
                  {pkg.pointsCost} points
                </div>
                <div className="text-xs text-gray-400">
                  {Math.round((pkg.pointsCost / (pkg.credits + (pkg.bonus || 0))) * 10) / 10} pts/crédit
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handlePurchase(pkg)}
                disabled={purchasing === pkg.id || userRole.points < pkg.pointsCost}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  userRole.points < pkg.pointsCost
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : pkg.popular
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } ${purchasing === pkg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {purchasing === pkg.id ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Achat...</span>
                  </div>
                ) : userRole.points < pkg.pointsCost ? (
                  'Points insuffisants'
                ) : (
                  'Acheter'
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How to Earn Points */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 rounded-xl p-6 border border-white/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Comment gagner des points ?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎁</span>
            <div>
              <div className="text-white font-medium">Inscription</div>
              <div className="text-gray-400">25 points gratuits</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">❤️</span>
            <div>
              <div className="text-white font-medium">Likes reçus</div>
              <div className="text-gray-400">1 point par like</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">💬</span>
            <div>
              <div className="text-white font-medium">Commentaires</div>
              <div className="text-gray-400">2 points par commentaire</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

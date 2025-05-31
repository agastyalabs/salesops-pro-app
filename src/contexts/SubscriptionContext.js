import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['Basic CRM', '100 Contacts', 'Email Support'],
    limits: {
      contacts: 100,
      storage: 500, // MB
      users: 1,
    },
  },
  PRO: {
    name: 'Pro',
    price: 49,
    features: ['Advanced CRM', 'Unlimited Contacts', 'Priority Support', 'API Access'],
    limits: {
      contacts: -1, // unlimited
      storage: 5000,
      users: 5,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 199,
    features: ['Custom Solutions', 'Dedicated Support', 'Custom Integrations'],
    limits: {
      contacts: -1,
      storage: -1,
      users: -1,
    },
  },
};

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  async function updateSubscription(planId) {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const newSubscription = {
      plan: planId,
      status: 'active',
      updatedAt: new Date(),
    };

    await updateDoc(userRef, {
      subscription: newSubscription,
    });

    setSubscription(newSubscription);
  }

  async function checkSubscriptionLimits(type, amount = 1) {
    if (!subscription) return false;
    
    const plan = PLANS[subscription.plan.toUpperCase()];
    if (!plan) return false;

    const limit = plan.limits[type];
    if (limit === -1) return true; // unlimited

    // Get current usage from Firestore
    const usageRef = doc(db, 'usage', currentUser.uid);
    const usageSnap = await getDoc(usageRef);
    const currentUsage = usageSnap.exists() ? usageSnap.data()[type] || 0 : 0;

    return (currentUsage + amount) <= limit;
  }

  useEffect(() => {
    async function loadSubscription() {
      if (!currentUser) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setSubscription(userSnap.data().subscription);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [currentUser]);

  const value = {
    subscription,
    updateSubscription,
    checkSubscriptionLimits,
    plans: PLANS,
    loading,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {!loading && children}
    </SubscriptionContext.Provider>
  );
}

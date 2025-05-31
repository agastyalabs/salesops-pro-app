import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  async function createUserProfile(data) {
    const userRef = doc(db, 'users', currentUser.uid);
    const defaultData = {
      email: currentUser.email,
      createdAt: new Date(),
      role: 'user',
      subscription: {
        plan: 'free',
        status: 'active',
        trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      },
      settings: {
        notifications: {
          email: true,
          push: true,
        },
        theme: 'light',
      },
      ...data,
    };
    await setDoc(userRef, defaultData);
    return defaultData;
  }

  async function updateUserProfile(data) {
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date(),
    });
    setUserProfile(prev => ({ ...prev, ...data }));
  }

  useEffect(() => {
    async function loadUserProfile() {
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          const newProfile = await createUserProfile({});
          setUserProfile(newProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [currentUser]);

  const value = {
    userProfile,
    updateUserProfile,
    loading,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
}

import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useOrganization } from './OrganizationContext';

const UsageContext = createContext();

export function useUsage() {
  return useContext(UsageContext);
}

export function UsageProvider({ children }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { organization } = useOrganization();

  // Usage types and their limits
  const USAGE_TYPES = {
    CONTACTS: 'contacts',
    STORAGE: 'storage', // in MB
    API_CALLS: 'api_calls',
    EMAIL_SENDS: 'email_sends',
  };

  async function trackUsage(type, amount = 1) {
    if (!organization?.id) return;

    try {
      const usageRef = doc(db, 'usage', organization.id);
      const date = new Date();
      const yearMonth = date.toISOString().slice(0, 7); // YYYY-MM

      // Update current month's usage
      await updateDoc(usageRef, {
        [`monthly.${yearMonth}.${type}`]: increment(amount),
        [`total.${type}`]: increment(amount),
        lastUpdated: date
      });

      // Fetch updated usage
      const usageSnap = await getDoc(usageRef);
      if (usageSnap.exists()) {
        setUsage(usageSnap.data());
      }
    } catch (error) {
      console.error('Error tracking usage:', error);
      throw error;
    }
  }

  async function getUsageReport(month = new Date().toISOString().slice(0, 7)) {
    if (!organization?.id) return null;

    try {
      const usageRef = doc(db, 'usage', organization.id);
      const usageSnap = await getDoc(usageRef);

      if (usageSnap.exists()) {
        const data = usageSnap.data();
        return {
          monthly: data.monthly?.[month] || {},
          total: data.total || {}
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting usage report:', error);
      throw error;
    }
  }

  useEffect(() => {
    async function loadUsage() {
      if (!organization?.id) {
        setLoading(false);
        return;
      }

      try {
        const usageRef = doc(db, 'usage', organization.id);
        const usageSnap = await getDoc(usageRef);

        if (usageSnap.exists()) {
          setUsage(usageSnap.data());
        } else {
          // Initialize usage document
          const initialUsage = {
            total: {
              contacts: 0,
              storage: 0,
              api_calls: 0,
              email_sends: 0
            },
            monthly: {},
            lastUpdated: new Date()
          };
          await setDoc(usageRef, initialUsage);
          setUsage(initialUsage);
        }
      } catch (error) {
        console.error('Error loading usage:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUsage();
  }, [organization]);

  const value = {
    usage,
    loading,
    USAGE_TYPES,
    trackUsage,
    getUsageReport
  };

  return (

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import ActivityFeed from '../components/ActivityFeed';
import NavigationBar from '../components/NavigationBar';

const appIdString = "1:555072601372:web:af3a40f8d9232012018ed9";

const MyLogPage = ({
  userId,
  userProfile,
  db,
  setError,
  setSuccess,
  currentAppId = appIdString,
  navigateToView,
}) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !db) return;
    setIsLoading(true);

    const activitiesRef = collection(
      db,
      `artifacts/${currentAppId}/users/${userId}/activities`
    );
    const unsubscribe = onSnapshot(
      activitiesRef,
      (snapshot) => {
        setActivities(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setIsLoading(false);
      },
      (error) => {
        setError('Failed to load activities.');
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId, db, currentAppId, setError]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <NavigationBar
        onBack={() => navigateToView('dashboard')}
        goToDashboard={() => navigateToView('dashboard')}
      />
      <h1 className="text-2xl font-bold mb-4">My Activity Log</h1>
      <ActivityFeed
        activities={activities}
        isLoading={isLoading}
        entityType="User"
        navigateToView={navigateToView}
      />
    </div>
  );
};

export default MyLogPage;

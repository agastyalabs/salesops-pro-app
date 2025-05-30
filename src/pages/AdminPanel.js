import React, { useEffect, useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import { collection, getDocs } from 'firebase/firestore';
import { LoadingSpinner } from '../components/LoadingSpinner';

const AdminPanel = ({
  userId,
  userProfile,
  db,
  setError,
  setSuccess,
  currentAppId,
  navigateToView,
}) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simple admin check (can be improved)
  const isAdmin = userProfile?.role === 'admin';

  // Fetch all users for display
  useEffect(() => {
    if (!db || !isAdmin) return;
    setIsLoading(true);
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, `artifacts/${currentAppId}/users`);
        const snapshot = await getDocs(usersRef);
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError && setError('Failed to load users.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [db, currentAppId, setError, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <NavigationBar goToDashboard={() => navigateToView('dashboard')} />
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <NavigationBar goToDashboard={() => navigateToView('dashboard')} />
      <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Welcome, Admin! Manage users and settings below.
      </p>

      {/* Quick links or admin actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          onClick={() => navigateToView('dashboard')}
        >
          Go to Dashboard
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          onClick={() => navigateToView('leads')}
        >
          View Leads
        </button>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
          onClick={() => navigateToView('activities')}
        >
          View Activities
        </button>
      </div>

      {/* User list */}
      <h2 className="text-xl font-semibold mb-2">Users</h2>
      {isLoading ? (
        <LoadingSpinner text="Loading users..." />
      ) : users.length === 0 ? (
        <div className="text-gray-500">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">User ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-2">{u.name || '—'}</td>
                  <td className="px-4 py-2">{u.email || '—'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`${
                        u.role === 'admin'
                          ? 'text-orange-600 font-semibold'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs font-mono">{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Placeholder for further admin actions: role management, stats, etc. */}
      <div className="mt-10 text-gray-500 italic">
        (More admin features coming soon: user role change, deletions, analytics…)
      </div>
    </div>
  );
};

export default AdminPanel;

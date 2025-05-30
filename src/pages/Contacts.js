import React, { useEffect, useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { LoadingSpinner } from '../components/LoadingSpinner';

const Contacts = ({
  userId,
  userProfile,
  db,
  setError,
  setSuccess,
  currentAppId,
  navigateToView,
}) => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });

  // Fetch contacts for the user
  useEffect(() => {
    if (!userId || !db || !currentAppId) return;
    setIsLoading(true);
    const contactsRef = collection(
      db,
      `artifacts/${currentAppId}/users/${userId}/contacts`
    );
    const unsubscribe = onSnapshot(
      contactsRef,
      (snapshot) => {
        const contactList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContacts(contactList);
        setIsLoading(false);
      },
      (error) => {
        setError && setError('Failed to load contacts.');
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId, db, currentAppId, setError]);

  // Handle new contact form
  const handleInputChange = (e) => {
    setNewContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email) {
      setError && setError('Name and Email are required.');
      return;
    }
    try {
      const contactsRef = collection(
        db,
        `artifacts/${currentAppId}/users/${userId}/contacts`
      );
      await addDoc(contactsRef, {
        ...newContact,
        createdAt: serverTimestamp(),
      });
      setSuccess && setSuccess('Contact added!');
      setNewContact({ name: '', email: '', phone: '' });
      setIsModalOpen(false);
    } catch (err) {
      setError && setError('Failed to add contact.');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <NavigationBar
        onBack={() => navigateToView('dashboard')}
        goToDashboard={() => navigateToView('dashboard')}
      />
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Manage and view your personal or business contacts below.
      </p>
      <button
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        onClick={() => setIsModalOpen(true)}
      >
        + Add Contact
      </button>
      {isLoading ? (
        <LoadingSpinner text="Loading contacts..." />
      ) : contacts.length === 0 ? (
        <div className="text-gray-500">No contacts found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Added On</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-2">{c.name || '—'}</td>
                  <td className="px-4 py-2">{c.email || '—'}</td>
                  <td className="px-4 py-2">{c.phone || <span className="text-gray-400">Not set</span>}</td>
                  <td className="px-4 py-2 text-xs">
                    {c.createdAt && c.createdAt.toDate
                      ? c.createdAt.toDate().toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding a contact */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm w-full shadow-lg border border-gray-100 dark:border-gray-700 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Add Contact</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name<span className="text-red-500">*</span></label>
                <input
                  className="w-full border rounded px-3 py-2"
                  type="text"
                  name="name"
                  value={newContact.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email<span className="text-red-500">*</span></label>
                <input
                  className="w-full border rounded px-3 py-2"
                  type="email"
                  name="email"
                  value={newContact.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  type="tel"
                  name="phone"
                  value={newContact.phone}
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add Contact
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;

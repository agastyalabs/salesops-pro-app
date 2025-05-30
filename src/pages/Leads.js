import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  where
} from 'firebase/firestore';
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  UserCircle,
  Building,
  Mail,
  Phone,
  DollarSign,
  Edit3,
  Trash2
} from 'lucide-react';
import { Modal } from '../components/Modal';
import InputField from '../components/InputField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Tooltip } from '../components/Tooltip';

const Leads = ({
  userId,
  userProfile,
  db,
  setError,
  setSuccess,
  currentAppId,
  navigateToView
}) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch leads in real-time
  useEffect(() => {
    if (!userId || !db) return;
    setIsLoading(true);
    let leadsRef = collection(db, `artifacts/${currentAppId}/users/${userId}/leads`);
    let q = query(leadsRef, orderBy('createdAt', 'desc'));
    if (filterStatus) {
      q = query(q, where('status', '==', filterStatus));
    }
    const unsub = onSnapshot(
      q,
      (snap) => {
        let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (searchTerm) {
          data = data.filter(lead =>
            (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setLeads(data);
        setIsLoading(false);
      },
      (err) => {
        setError('Failed to fetch leads.');
        setIsLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line
  }, [userId, db, currentAppId, filterStatus, searchTerm]);

  // Handle lead add/edit modal open/close
  const openModal = (lead = null) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setEditingLead(null);
    setIsModalOpen(false);
  };

  // Handle Add or Update Lead
  const handleSaveLead = async (e) => {
    e.preventDefault();
    const form = e.target;
    const leadData = {
      name: form.name.value,
      company: form.company.value,
      email: form.email.value,
      phone: form.phone.value,
      value: Number(form.value.value),
      status: form.status.value,
      createdAt: editingLead?.createdAt || serverTimestamp()
    };
    setIsLoading(true);
    try {
      if (editingLead) {
        // Update
        await updateDoc(
          collection(db, `artifacts/${currentAppId}/users/${userId}/leads`).doc(editingLead.id),
          leadData
        );
        setSuccess('Lead updated.');
      } else {
        // Add
        await addDoc(collection(db, `artifacts/${currentAppId}/users/${userId}/leads`), {
          ...leadData,
          createdAt: serverTimestamp()
        });
        setSuccess('Lead added.');
      }
      closeModal();
    } catch (err) {
      setError('Failed to save lead.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Lead
  const handleDeleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    setIsLoading(true);
    try {
      await deleteDoc(collection(db, `artifacts/${currentAppId}/users/${userId}/leads`).doc(id));
      setSuccess('Lead deleted.');
    } catch {
      setError('Failed to delete lead.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="mr-2" /> Leads
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          <PlusCircle className="mr-1" /> Add Lead
        </button>
      </div>
      <div className="flex gap-2 mb-6">
        <input
          className="border px-3 py-2 rounded w-64"
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>
      </div>
      {isLoading ? (
        <LoadingSpinner text="Loading leads..." />
      ) : leads.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No leads found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border rounded shadow">
            <thead>
              <tr>
                <th className="p-2 text-left border-b">Name</th>
                <th className="p-2 text-left border-b">Company</th>
                <th className="p-2 text-left border-b">Email</th>
                <th className="p-2 text-left border-b">Phone</th>
                <th className="p-2 text-left border-b">Value</th>
                <th className="p-2 text-left border-b">Status</th>
                <th className="p-2 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-100 dark:hover:bg-gray-900">
                  <td className="p-2">{lead.name}</td>
                  <td className="p-2">{lead.company}</td>
                  <td className="p-2">{lead.email}</td>
                  <td className="p-2">{lead.phone}</td>
                  <td className="p-2">${Number(lead.value || 0).toLocaleString()}</td>
                  <td className="p-2">{lead.status}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => openModal(lead)}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteLead(lead.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Lead Modal */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <form onSubmit={handleSaveLead} className="space-y-4">
            <h2 className="text-xl font-bold mb-2">{editingLead ? 'Edit Lead' : 'Add Lead'}</h2>
            <InputField
              label="Name"
              name="name"
              defaultValue={editingLead?.name || ''}
              required
            />
            <InputField
              label="Company"
              name="company"
              defaultValue={editingLead?.company || ''}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              defaultValue={editingLead?.email || ''}
            />
            <InputField
              label="Phone"
              name="phone"
              defaultValue={editingLead?.phone || ''}
            />
            <InputField
              label="Deal Value"
              name="value"
              type="number"
              defaultValue={editingLead?.value || ''}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                defaultValue={editingLead?.status || 'New'}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {editingLead ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      <div className="mt-8">
        <button
          className="text-blue-600 underline"
          onClick={() => navigateToView('dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Leads;

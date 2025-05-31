import { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';

const OrganizationContext = createContext();

export function useOrganization() {
  return useContext(OrganizationContext);
}

export function OrganizationProvider({ children }) {
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { userProfile } = useUser();

  // Roles and permissions
  const ROLES = {
    OWNER: {
      name: 'Owner',
      permissions: ['manage_org', 'manage_members', 'manage_billing', 'manage_settings', 'view_analytics', 'manage_data']
    },
    ADMIN: {
      name: 'Admin',
      permissions: ['manage_members', 'manage_settings', 'view_analytics', 'manage_data']
    },
    MEMBER: {
      name: 'Member',
      permissions: ['view_analytics', 'manage_data']
    },
    VIEWER: {
      name: 'Viewer',
      permissions: ['view_analytics']
    }
  };

  async function createOrganization(data) {
    try {
      const orgRef = doc(collection(db, 'organizations'));
      const orgData = {
        name: data.name,
        createdAt: new Date(),
        createdBy: currentUser.uid,
        settings: {
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          currency: 'USD',
        },
        members: [{
          uid: currentUser.uid,
          email: currentUser.email,
          role: 'OWNER',
          joinedAt: new Date()
        }],
        ...data
      };

      await setDoc(orgRef, orgData);

      // Update user's organization reference
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        organizationId: orgRef.id,
        organizationRole: 'OWNER'
      });

      setOrganization({ id: orgRef.id, ...orgData });
      setMembers(orgData.members);
      return { id: orgRef.id, ...orgData };
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  async function updateOrganization(data) {
    if (!organization?.id) return;

    try {
      const orgRef = doc(db, 'organizations', organization.id);
      await updateDoc(orgRef, {
        ...data,
        updatedAt: new Date()
      });

      setOrganization(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  async function inviteMember(email, role = 'MEMBER') {
    if (!organization?.id) return;

    try {
      // Create invitation
      const inviteRef = doc(collection(db, 'invitations'));
      await setDoc(inviteRef, {
        organizationId: organization.id,
        email,
        role,
        status: 'PENDING',
        createdAt: new Date(),
        createdBy: currentUser.uid
      });

      // TODO: Send invitation email
      return inviteRef.id;
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  async function updateMemberRole(memberId, newRole) {
    if (!organization?.id) return;

    try {
      const orgRef = doc(db, 'organizations', organization.id);
      const updatedMembers = members.map(member => 
        member.uid === memberId ? { ...member, role: newRole } : member
      );

      await updateDoc(orgRef, { members: updatedMembers });
      setMembers(updatedMembers);
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  useEffect(() => {
    async function loadOrganization() {
      if (!currentUser || !userProfile?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        const orgRef = doc(db, 'organizations', userProfile.organizationId);
        const orgSnap = await getDoc(orgRef);

        if (orgSnap.exists()) {
          const orgData = orgSnap.data();
          setOrganization({ id: orgSnap.id, ...orgData });
          setMembers(orgData.members);
        }
      } catch (error) {
        console.error('Error loading organization:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrganization();
  }, [currentUser, userProfile]);

  const value = {
    organization,
    members,
    loading,
    ROLES,
    createOrganization,
    updateOrganization,
    inviteMember,
    updateMemberRole,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {!loading && children}
    </OrganizationContext.Provider>
  );
}

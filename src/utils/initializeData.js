import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function initializeDemoData(userId) {
  try {
    // Add some sample customers
    const customers = [
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        status: 'Active',
        type: 'Enterprise',
        organizationId: userId,
        createdAt: new Date(),
        lastContact: new Date('2025-05-30'),
        deals: 3,
        value: 50000
      },
      {
        name: 'TechStart Inc',
        email: 'info@techstart.com',
        status: 'Active',
        type: 'Growth',
        organizationId: userId,
        createdAt: new Date(),
        lastContact: new Date('2025-05-29'),
        deals: 2,
        value: 25000
      }
    ];

    for (const customer of customers) {
      await addDoc(collection(db, 'customers'), customer);
    }

    // Add some sample deals
    const deals = [
      {
        title: 'Enterprise License Deal',
        value: 50000,
        status: 'active',
        customerId: 'acme-corp',
        organizationId: userId,
        createdAt: new Date(),
        expectedCloseDate: new Date('2025-06-30')
      },
      {
        title: 'Annual Subscription',
        value: 25000,
        status: 'active',
        customerId: 'techstart',
        organizationId: userId,
        createdAt: new Date(),
        expectedCloseDate: new Date('2025-07-15')
      }
    ];

    for (const deal of deals) {
      await addDoc(collection(db, 'deals'), deal);
    }

    // Add some sample activities
    const activities = [
      {
        type: 'deal',
        description: 'New deal created with Acme Corp',
        timestamp: new Date(),
        organizationId: userId,
        relatedTo: 'acme-corp',
        value: 50000
      },
      {
        type: 'meeting',
        description: 'Meeting scheduled with TechStart Inc',
        timestamp: new Date(Date.now() - 3600000),
        organizationId: userId,
        relatedTo: 'techstart'
      },
      {
        type: 'update',
        description: 'Customer profile updated: Global Services Ltd',
        timestamp: new Date(Date.now() - 7200000),
        organizationId: userId,
        relatedTo: 'global-services'
      }
    ];

    for (const activity of activities) {
      await addDoc(collection(db, 'activities'), activity);
    }

    // Add organization settings
    await setDoc(doc(db, 'organizations', userId), {
      name: 'My Organization',
      createdAt: new Date(),
      settings: {
        currency: 'USD',
        timeZone: 'UTC',
        fiscalYearStart: '01-01'
      }
    });

    return true;
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return false;
  }
}

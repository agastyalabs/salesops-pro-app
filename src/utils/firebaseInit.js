import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export async function initializeFirebase(userId = auth.currentUser?.uid) {
  if (!userId) return;

  try {
    // Create organization
    await setDoc(doc(db, 'organizations', userId), {
      name: 'SalesOps Pro Demo',
      createdAt: serverTimestamp(),
      owner: userId,
      settings: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      }
    });

    // Add demo customers
    const customers = [
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1 (555) 123-4567',
        type: 'Enterprise',
        status: 'Active',
        organizationId: userId,
        createdAt: serverTimestamp(),
        industry: 'Technology',
        value: 50000,
        lastContact: serverTimestamp()
      },
      {
        name: 'TechStart Inc',
        email: 'sales@techstart.io',
        phone: '+1 (555) 987-6543',
        type: 'Growth',
        status: 'Active',
        organizationId: userId,
        createdAt: serverTimestamp(),
        industry: 'SaaS',
        value: 25000,
        lastContact: serverTimestamp()
      }
    ];

    for (const customer of customers) {
      const docRef = await addDoc(collection(db, 'customers'), customer);
      
      // Add some activities for each customer
      await addDoc(collection(db, 'activities'), {
        type: 'customer_created',
        description: `New customer created: ${customer.name}`,
        customerId: docRef.id,
        organizationId: userId,
        timestamp: serverTimestamp(),
        metadata: {
          customerType: customer.type,
          value: customer.value
        }
      });
    }

    // Add demo deals
    const deals = [
      {
        title: 'Enterprise License Deal',
        customer: 'Acme Corporation',
        value: 50000,
        status: 'active',
        stage: 'proposal',
        organizationId: userId,
        createdAt: serverTimestamp(),
        expectedCloseDate: new Date('2025-06-30'),
        probability: 75,
        notes: 'Enterprise-wide deployment discussion'
      },
      {
        title: 'Growth Package',
        customer: 'TechStart Inc',
        value: 25000,
        status: 'active',
        stage: 'negotiation',
        organizationId: userId,
        createdAt: serverTimestamp(),
        expectedCloseDate: new Date('2025-07-15'),
        probability: 90,
        notes: 'Final contract review in progress'
      }
    ];

    for (const deal of deals) {
      const docRef = await addDoc(collection(db, 'deals'), deal);
      
      // Add activities for deals
      await addDoc(collection(db, 'activities'), {
        type: 'deal_created',
        description: `New deal created: ${deal.title}`,
        dealId: docRef.id,
        organizationId: userId,
        timestamp: serverTimestamp(),
        metadata: {
          value: deal.value,
          stage: deal.stage,
          customer: deal.customer
        }
      });
    }

    // Add some general activities
    const activities = [
      {
        type: 'meeting_scheduled',
        description: 'Strategy meeting with Acme Corp',
        organizationId: userId,
        timestamp: serverTimestamp(),
        metadata: {
          date: '2025-06-05',
          time: '10:00 AM',
          attendees: ['John Smith', 'Sarah Johnson']
        }
      },
      {
        type: 'task_completed',
        description: 'Proposal sent to TechStart Inc',
        organizationId: userId,
        timestamp: serverTimestamp(),
        metadata: {
          taskType: 'proposal',
          value: 25000
        }
      }
    ];

    for (const activity of activities) {
      await addDoc(collection(db, 'activities'), activity);
    }

    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
}

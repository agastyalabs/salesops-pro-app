// ... previous imports ...
import { initializeDemoData } from '../../utils/initializeData';

export default function DashboardHome() {
  // ... previous state declarations ...

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentUser) return;

      try {
        // Check if any data exists
        const customersQuery = query(
          collection(db, 'customers'),
          where('organizationId', '==', currentUser.uid),
          limit(1)
        );
        const customersSnapshot = await getDocs(customersQuery);

        // If no data exists, initialize demo data
        if (customersSnapshot.empty) {
          await initializeDemoData(currentUser.uid);
        }

        // ... rest of the fetchDashboardData function remains the same ...

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setMetrics({
          totalCustomers: 2,
          activeDeals: 2,
          monthlyRevenue: 75000,
          recentActivities: [
            {
              id: 1,
              type: 'deal',
              description: 'New deal created with Acme Corp',
              timestamp: new Date()
            },
            {
              id: 2,
              type: 'meeting',
              description: 'Meeting scheduled with TechStart Inc',
              timestamp: new Date(Date.now() - 3600000)
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentUser]);

  // ... rest of the component remains the same ...
}

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import NavigationBar from '../components/NavigationBar';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Leaflet and CSS (ensure leaflet CSS is included in your index.html or main App)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Import Leaflet.markercluster via CDN in index.html or install with npm if you'd like
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const Activities = ({
  userId,
  userProfile,
  db,
  setError,
  setSuccess,
  currentAppId,
  navigateToView,
}) => {
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch attendance logs (with location) for the user
  useEffect(() => {
    if (!userId || !db || !currentAppId) return;
    setIsLoading(true);
    const attendanceRef = collection(
      db,
      `artifacts/${currentAppId}/users/${userId}/attendanceLog`
    );
    const attendanceQuery = query(attendanceRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(
      attendanceQuery,
      (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendance(logs);
        setIsLoading(false);
      },
      (error) => {
        setError && setError('Failed to load location history.');
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId, db, currentAppId, setError]);

  // Initialize the Leaflet map with clustering
  useEffect(() => {
    if (!attendance || attendance.length === 0) return;
    // Only run once map container is rendered and not already loaded
    if (mapLoaded) return;
    const locations = attendance
      .filter(
        (entry) =>
          entry.location &&
          typeof entry.location.latitude === 'number' &&
          typeof entry.location.longitude === 'number'
      )
      .map((entry) => ({
        lat: entry.location.latitude,
        lng: entry.location.longitude,
        type: entry.type,
        time:
          entry.timestamp && entry.timestamp.toDate
            ? entry.timestamp.toDate().toLocaleString()
            : 'N/A',
      }));

    if (locations.length === 0) return;

    // Remove any previous instance (for hot reloads)
    if (window._leafletMapInstance) {
      window._leafletMapInstance.remove();
      window._leafletMapInstance = null;
    }

    // Center on the first location or a default
    const first = locations[0];
    const map = L.map('location-history-map').setView(
      [first.lat, first.lng],
      6
    );

    window._leafletMapInstance = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // --- Marker clustering ---
    // eslint-disable-next-line no-undef
    const markers = L.markerClusterGroup ? L.markerClusterGroup() : null;
    if (markers) {
      locations.forEach((loc, idx) => {
        const marker = L.marker([loc.lat, loc.lng]);
        marker.bindPopup(
          `<b>${loc.type === 'punch-in' ? 'Punch In' : 'Punch Out'}</b><br/>${loc.time}`
        );
        markers.addLayer(marker);
      });
      map.addLayer(markers);
      if (locations.length > 1) {
        const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } else {
      // fallback: plain markers if clustering not available
      locations.forEach((loc, idx) => {
        const marker = L.marker([loc.lat, loc.lng]).addTo(map);
        marker.bindPopup(
          `<b>${loc.type === 'punch-in' ? 'Punch In' : 'Punch Out'}</b><br/>${loc.time}`
        );
      });
      if (locations.length > 1) {
        const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    setMapLoaded(true);

    return () => {
      if (window._leafletMapInstance) {
        window._leafletMapInstance.remove();
        window._leafletMapInstance = null;
      }
      setMapLoaded(false);
    };
    // Only run when attendance changes
    // eslint-disable-next-line
  }, [attendance]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <NavigationBar
        onBack={() => navigateToView('dashboard')}
        goToDashboard={() => navigateToView('dashboard')}
      />
      <h1 className="text-2xl font-bold mb-4">Attendance & Location History</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        This page shows your punch in/out history and any captured location (if geolocation was enabled and allowed).
      </p>
      {isLoading ? (
        <LoadingSpinner text="Loading location history..." />
      ) : attendance.length === 0 ? (
        <div className="text-gray-500">No attendance or location data found.</div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Map of Locations (with Clustering)</h2>
            <div
              id="location-history-map"
              style={{
                width: '100%',
                height: '320px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #ddd',
              }}
              className="mb-6"
            />
            <div className="text-xs text-gray-400 mb-2">
              {attendance.filter(
                (entry) =>
                  entry.location &&
                  typeof entry.location.latitude === 'number' &&
                  typeof entry.location.longitude === 'number'
              ).length === 0
                ? 'No location coordinates recorded yet.'
                : 'Click on a marker for punch details. Markers will cluster when zoomed out.'}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Punch Type</th>
                  <th className="px-4 py-2 text-left">Date/Time</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Map</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((entry) => (
                  <tr key={entry.id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-2 font-semibold">
                      {entry.type === 'punch-in' ? (
                        <span className="text-green-600 dark:text-green-400">Punch In</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Punch Out</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {entry.timestamp && entry.timestamp.toDate
                        ? entry.timestamp.toDate().toLocaleString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      {entry.location && entry.location.latitude && entry.location.longitude ? (
                        <>
                          <div>
                            Lat: <span className="font-mono">{entry.location.latitude.toFixed(5)}</span>
                            <br />
                            Lng: <span className="font-mono">{entry.location.longitude.toFixed(5)}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">Not captured</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {entry.location && entry.location.latitude && entry.location.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${entry.location.latitude},${entry.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          title="View on Google Maps"
                        >
                          Map
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Activities;

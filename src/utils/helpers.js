// src/utils/helpers.js
import { Timestamp } from 'firebase/firestore'; // Import Timestamp for type checking if needed
import { currentAppId } from './firebase'; // Import currentAppId for User-Agent in fetch

export const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp instanceof Date) return timestamp.toLocaleDateString();
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        try {
            return timestamp.toDate().toLocaleDateString();
        } catch (e) {
            // Fallback for invalid Firestore Timestamp objects if any
            console.error("Error converting Firestore Timestamp to Date:", e);
            return 'Invalid Date';
        }
    }
    // Try to parse if it's a string or number
    try {
        const date = new Date(timestamp);
        if (!isNaN(date.valueOf())) return date.toLocaleDateString();
    } catch (e) { /* ignore parsing error */ }
    return 'Invalid Date';
};

export const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp instanceof Date) return timestamp.toLocaleString();
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
         try {
            return timestamp.toDate().toLocaleString();
        } catch (e) {
            console.error("Error converting Firestore Timestamp to Date:", e);
            return 'Invalid Date';
        }
    }
    try {
        const date = new Date(timestamp);
        if (!isNaN(date.valueOf())) return date.toLocaleString();
    } catch (e) { /* ignore */ }
    return 'Invalid Date';
};

export const formatDateForInput = (timestamp) => {
    let dateToFormat;
    if (timestamp && timestamp.toDate && typeof timestamp.toDate === 'function') {
        dateToFormat = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        dateToFormat = timestamp;
    } else if (timestamp && typeof timestamp === 'string') { 
        // Attempt to parse various string formats, including those that might come from date inputs
        const parsedDate = new Date(timestamp);
        // Check if the string might just be YYYY-MM-DD, new Date() might interpret it as UTC.
        // A more robust solution might involve a date parsing library if many formats are expected.
        if (!isNaN(parsedDate.valueOf())) {
             dateToFormat = parsedDate;
        }
    } else if (timestamp && typeof timestamp === 'number') {
        dateToFormat = new Date(timestamp);
    }

    if (dateToFormat && !isNaN(dateToFormat.valueOf())) {
        if (dateToFormat.toISOString && typeof dateToFormat.toISOString === 'function') {
             // Ensure we are using local time for ISO string conversion to YYYY-MM-DD
             const localDate = new Date(dateToFormat.getFullYear(), dateToFormat.getMonth(), dateToFormat.getDate());
             return localDate.toISOString().split('T')[0];
        }
    }
    return '';
};

export const fetchAddressFromCoordinates = async (latitude, longitude) => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        console.warn("Invalid coordinates for geocoding:", latitude, longitude);
        return "Invalid coordinates";
    }
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=<span class="math-inline">\{latitude\}&lon\=</span>{longitude}`, {
            headers: { 'User-Agent': `SalesOpsProApp/${currentAppId || 'UnknownApp'}` }
        });
        if (!response.ok) {
            console.warn(`Nominatim API error: ${response.status} ${response.statusText}`);
            return `Address lookup failed (Status: ${response.status})`;
        }
        const data = await response.json();
        return data.display_name || "Address not found";
    } catch (error) {
        console.error("Error fetching address:", error);
        return "Address lookup failed (Network error)";
    }
};

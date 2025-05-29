// src/pages/AdminPanel.js
import React, { useState, useEffect, useCallback } from &#39;react&#39;;
import { collection, query, onSnapshot, doc, updateDoc, orderBy, limit } from &#39;firebase/firestore&#39;;
import { MapPin, Clock, UserCog, Users as UsersIcon, Eye as ViewIcon, Edit, ShieldCheck } from &#39;lucide-react&#39;; // Renamed Users to UsersIcon
import { LoadingSpinner } from &#39;../components/LoadingSpinner&#39;;
import { AlertMessage } from &#39;../components/AlertMessage&#39;;
import { Tooltip } from &#39;../components/Tooltip&#39;;
import { db, currentAppId } from &#39;../utils/firebase&#39;;
import { formatDate, formatDateTime, fetchAddressFromCoordinates } from &#39;../utils/helpers&#39;;
import { AVAILABLE_ROLES, PLAN_STATUSES, TRIAL_DURATION_DAYS } from &#39;../config&#39;;
import { MapContainer, TileLayer, Marker, Popup } from &#39;react-leaflet&#39;;
import MarkerClusterGroup from &#39;react-leaflet-markercluster&#39;;
import { Timestamp, serverTimestamp } from &#39;firebase/firestore&#39;;

const AdminPanel = ({ userId, userProfile, setError: setAppErrorGlobal, setSuccess: setAppSuccessGlobal }) =\> {
const [adminTab, setAdminTab] = useState('userManagement');
const [usersList, setUsersList] = useState([]);
const [isLoadingUsers, setIsLoadingUsers] = useState(true);
const [adminError, setAdminError] = useState(null); // Local error for admin panel operations

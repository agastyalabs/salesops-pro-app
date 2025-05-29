// src/pages/MyLogPage.js
import React, { useState, useEffect, useCallback } from &#39;react&#39;;
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from &#39;firebase/firestore&#39;;
import { MapPin, Clock, PlusCircle, Sparkles, Home } from &#39;lucide-react&#39;;
import { Modal } from &#39;../components/Modal&#39;;
import { InputField } from &#39;../components/InputField&#39;;
import { LoadingSpinner } from &#39;../components/LoadingSpinner&#39;;
import { AlertMessage } from &#39;../components/AlertMessage&#39;; // For summaryError
import { db, currentAppId, auth } from &#39;../utils/firebase&#39;; // Import auth for userId
import { formatDateTime, fetchAddressFromCoordinates } from &#39;../utils/helpers&#39;;
import { GEMINI_API_KEY } from &#39;../config&#39;;
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from &quot;@google/generative-ai&quot;;

const MyLogPage = ({ userId, userProfile, setError, setSuccess }) =\> { // Removed unused currentAppId from props as it's imported
const [attendanceLog, setAttendanceLog] = useState([]);
const [checkIns, setCheckIns] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
const [checkInNotes, setCheckInNotes] = useState('');
const [isCheckingIn, setIsCheckingIn] = useState(false);

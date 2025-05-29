// src/pages/Activities.js
import React, { useState, useEffect, useCallback, useRef } from &#39;react&#39;;
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, Timestamp, where, getDocs, limit } from &#39;firebase/firestore&#39;;
import { ListChecks, PlusCircle, Search, Filter, Tag, CalendarDays, Users as UsersIcon, Edit3, Trash2, Wand2, Sparkles } from &#39;lucide-react&#39;; // Renamed Users to UsersIcon
import { Modal } from &#39;../components/Modal&#39;;
import { InputField } from &#39;../components/InputField&#39;;
import { LoadingSpinner } from &#39;../components/LoadingSpinner&#39;;
import { Tooltip } from &#39;../components/Tooltip&#39;;
import { db, currentAppId } from &#39;../utils/firebase&#39;; // Assuming firebase.js is in src/utils/
import { formatDateForInput, formatDateTime } from &#39;../utils/helpers&#39;; // Assuming helpers.js is in src/utils/
import { GEMINI_API_KEY, TASK_PRIORITIES } from &#39;../config&#39;; // Import from your config.js
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from &quot;@google/generative-ai&quot;;

const Activities = ({ userId, userProfile, setError, setSuccess, navigateToView, activeParams }) =\> { // Added activeParams
const [activities, setActivities] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingActivity, setEditingActivity] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
const [filterType, setFilterType] = useState("");
const [filterStatus, setFilterStatus] = useState("");

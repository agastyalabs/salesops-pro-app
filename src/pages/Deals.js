// src/pages/Deals.js
import React, { useState, useEffect, useCallback } from &#39;react&#39;;
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, Timestamp, where, getCountFromServer, getDocs, limit } from &#39;firebase/firestore&#39;;
import { Briefcase, PlusCircle, Search, Filter, Tag, Building, UserCircle, DollarSign, CalendarDays, Edit3, Trash2, TrendingUp } from &#39;lucide-react&#39;;
import { Modal } from &#39;../components/Modal&#39;;
import { InputField } from &#39;../components/InputField&#39;;
import { LoadingSpinner } from &#39;../components/LoadingSpinner&#39;;
import { Tooltip } from &#39;../components/Tooltip&#39;;
import { ActivityFeed } from &#39;../components/ActivityFeed&#39;;
import { formatDate, formatDateForInput } from &#39;../utils/helpers&#39;;

const Deals = ({ userId, userProfile, db, setError, setSuccess, currentAppId, navigateToView }) =\> {
const [deals, setDeals] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingDeal, setEditingDeal] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
const [filterStage, setFilterStage] = useState("");

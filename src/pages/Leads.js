import React, { useState, useEffect } from &#39;react&#39;;
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, getCountFromServer, where, limit } from &#39;firebase/firestore&#39;;
import { Users, PlusCircle, Search, Filter, UserCircle, Building, Mail, Phone, DollarSign, Edit3, Trash2, TrendingUp } from &#39;lucide-react&#39;;
import { Modal } from &#39;../components/Modal&#39;;
import { InputField } from &#39;../components/InputField&#39;;
import { LoadingSpinner } from &#39;../components/LoadingSpinner&#39;;
import { Tooltip } from &#39;../components/Tooltip&#39;;
import { ActivityFeed } from &#39;../components/ActivityFeed&#39;; // Assuming ActivityFeed.js is in src/components/

const Leads = ({ userId, userProfile, db, setError, setSuccess, currentAppId, navigateToView }) =\> {
const [leads, setLeads] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingLead, setEditingLead] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
const [filterStatus, setFilterStatus] = useState("");

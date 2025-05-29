// src/config.js
export const TRIAL_DURATION_DAYS = 14; 
export const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE"; 
export const AVAILABLE_ROLES = ['user', 'admin']; 
export const TASK_PRIORITIES = ["Low", "Medium", "High"];
export const PLAN_STATUSES = ['trial', 'paid', 'cancelled', 'free']; 
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D', '#FFC0CB', '#A0522D', '#D2691E'];

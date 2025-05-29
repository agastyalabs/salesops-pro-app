// src/pages/SettingsPage.js
import React from &#39;react&#39;;
import { Moon, Sun, Gift, UserCog, HelpCircle, LogOut } from &#39;lucide-react&#39;;
import { LoadingSpinner } from &#39;../components/LoadingSpinner&#39;; // Assuming LoadingSpinner.js is in src/components/
import { formatDateTime } from &#39;../utils/helpers&#39;; // Assuming helpers.js is in src/utils/

const SettingsPage = ({ userId, userProfile, theme, toggleTheme, handleSignOut, navigateToView }) =\> {
if (\!userProfile) return &lt;LoadingSpinner text=&quot;Loading settings...&quot; /&gt;;

// src/components/AlertMessage.js
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const AlertMessage = ({ message, type, onDismiss }) => {
    if (!message) return null;

    const SvgIcon = type === 'error' ? AlertTriangle : type === 'success' ? CheckCircle : AlertTriangle; // Default to AlertTriangle for other/info types

    const baseClasses = "p-3 my-2 rounded-md shadow-sm text-sm flex items-center justify-between pointer-events-auto transition-all duration-300 ease-in-out";
    const typeClasses = {
        error: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 border-l-4 border-red-500 dark:border-red-400',
        success: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-l-4 border-green-500 dark:border-green-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 border-l-4 border-blue-500 dark:border-blue-400',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>
            <div className="flex items-center">
                <SvgIcon size={18} className="mr-2 flex-shrink-0" />
                <span>{message}</span>
            </div>
            {onDismiss && (
                <button 
                    onClick={onDismiss} 
                    className="ml-3 text-current hover:opacity-75 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    aria-label="Dismiss alert"
                >
                    <XCircle size={16}/>
                </button>
            )}
        </div>
    );
};

export default AlertMessage;

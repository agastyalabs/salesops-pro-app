// src/pages/AuthPageLayout.js
import React from 'react';
import { Briefcase } from 'lucide-react';

const AuthPageLayout = ({ children, title, theme }) => (
    <div className={`min-h-screen flex flex-col items-center justify-center font-inter p-4 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <div className="flex items-center mb-8">
            <Briefcase size={32} className="text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold ml-3 text-gray-800 dark:text-white">SalesOps Pro</h1>
        </div>
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">{title}</h2>
            {children}
        </div>
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} SalesOps Pro.
        </p>
    </div>
);

export default AuthPageLayout;

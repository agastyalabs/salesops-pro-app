import React from 'react';
import { Briefcase } from 'lucide-react';

const AuthPageLayout = ({ children, title, theme }) => (
  <div
    className={`min-h-screen flex flex-col items-center justify-center font-inter p-4 ${
      theme === 'dark'
        ? 'dark bg-gray-900 text-gray-100'
        : 'bg-gray-100 text-gray-900'
    }`}
  >
    <div className="flex flex-col items-center mb-8">
      <div className="flex items-center">
        <Briefcase size={36} className="text-blue-600 dark:text-blue-400" />
        <h1 className="text-3xl font-extrabold ml-3 tracking-tight text-gray-800 dark:text-white">
          SalesOps <span className="text-blue-600 dark:text-blue-400">Pro</span>
        </h1>
      </div>
      <span className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
        Elevate Your Sales Operations
      </span>
    </div>
    <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-200 mb-6">
        {title}
      </h2>
      <div>{children}</div>
    </div>
    <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
      &copy; {new Date().getFullYear()} <span className="font-semibold">SalesOps Pro</span>. All rights reserved.
    </p>
  </div>
);

export default AuthPageLayout;

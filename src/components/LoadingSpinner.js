import React from 'react';

export const LoadingSpinner = ({ text = '', size = 'md' }) => (
  <div className="flex items-center justify-center space-x-2 py-4">
    <svg
      className="animate-spin text-blue-600 dark:text-blue-400"
      width={size === 'sm' ? 18 : size === 'lg' ? 32 : 24}
      height={size === 'sm' ? 18 : size === 'lg' ? 32 : 24}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
    {text && <span className="text-gray-500 dark:text-gray-300">{text}</span>}
  </div>
);

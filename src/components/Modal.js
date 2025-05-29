// src/components/Modal.js
import React from 'react';
import { XCircle } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl'
    };

    // Prevent clicks inside the modal from closing it, only on the overlay
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out animate-fadeIn"
            onClick={onClose} // Close when clicking on the overlay
        >
            <div 
                className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow max-h-[90vh] flex flex-col`}
                onClick={handleModalContentClick} // Stop propagation for clicks inside the modal
            >
                <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700 flex-shrink-0">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close modal"
                    >
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow pr-1 custom-scrollbar">{children}</div>
            </div>
            {/* Animation styles should be in a global CSS file or defined with a CSS-in-JS solution if not using Tailwind JIT features for animation classes directly */}
            <style jsx global>{` 
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                @keyframes modalShow { 
                    0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); } 
                } 
                .animate-modalShow { 
                    animation: modalShow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default Modal;

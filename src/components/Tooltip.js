// src/components/Tooltip.js
import React, { useState } from 'react';

const Tooltip = ({ text, children, position = "bottom" }) => {
    const [visible, setVisible] = useState(false);

    let positionClasses = '';
    switch (position) {
        case 'top':
            positionClasses = 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
            break;
        case 'bottom':
            positionClasses = 'top-full left-1/2 transform -translate-x-1/2 mt-2';
            break;
        case 'left':
            positionClasses = 'right-full top-1/2 transform -translate-y-1/2 mr-2';
            break;
        case 'right':
            positionClasses = 'left-full top-1/2 transform -translate-y-1/2 ml-2';
            break;
        default:
            positionClasses = 'top-full left-1/2 transform -translate-x-1/2 mt-2';
    }

    return (
        <div className="relative inline-block">
            <div 
                onMouseEnter={() => setVisible(true)} 
                onMouseLeave={() => setVisible(false)} 
                className="cursor-pointer"
            >
                {children}
            </div>
            {visible && (
                <div 
                    className={`absolute ${positionClasses} px-3 py-1.5 bg-gray-800 dark:bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg z-20 whitespace-nowrap transition-opacity duration-200 opacity-0 animate-tooltipShow`}
                >
                    {text}
                    {/* Arrow (optional, can be complex with pure Tailwind for all positions) */}
                    {/* For bottom position example: 
                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-1 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-gray-800 dark:border-b-gray-900"></div> 
                    */}
                </div>
            )}
            <style jsx global>{`
                @keyframes tooltipShow { 
                    to { opacity: 1; } 
                } 
                .animate-tooltipShow { 
                    animation: tooltipShow 0.2s forwards; opacity:0;
                }
            `}</style>
        </div>
    );
};

export default Tooltip;

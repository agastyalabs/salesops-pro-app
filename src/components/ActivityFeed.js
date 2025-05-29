// src/components/ActivityFeed.js
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner'; // Assuming LoadingSpinner is in the same folder
import { formatDateTime } from '../utils/helpers'; // Assuming helpers.js is in src/utils/

const ActivityFeed = ({ activities, isLoading, entityType, navigateToView }) => {
    if (isLoading) return <LoadingSpinner text={`Loading ${entityType} activities...`} size="sm"/>;

    if (!activities || activities.length === 0) {
        return (
            <div className="mt-6 pt-4 border-t dark:border-gray-700">
                 <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Related Activities:</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">No activities linked to this {entityType.toLowerCase()}.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 pt-4 border-t dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Related Activities ({activities.length}):</h4>
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {activities.map(activity => (
                    <li key={activity.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span 
                                className="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:underline" 
                                onClick={() => navigateToView ? navigateToView('activities', { openActivityId: activity.id }) : console.log("Navigate to activity:", activity.id)}
                                title={activity.subject}
                            >
                                {activity.subject && activity.subject.length > 40 ? activity.subject.substring(0, 37) + "..." : activity.subject || "No Subject"}
                            </span>
                            <span className={`flex-shrink-0 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                                activity.status === 'Completed' || activity.status === 'Logged' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' 
                                : activity.status === 'Open' || activity.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' 
                                : activity.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100' 
                            }`}>{activity.status || "N/A"}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Type: {activity.type || "N/A"} {activity.dueDate && `| Due: ${formatDateTime(activity.dueDate)}`}
                        </p>
                        {activity.notes && <p className="mt-1 text-gray-600 dark:text-gray-300 text-xs whitespace-pre-wrap">{activity.notes.substring(0,100)}{activity.notes.length > 100 ? '...' : ''}</p>}
                    </li>
                ))}
            </ul>
            {/* Styles for custom scrollbar can be in index.css or a global stylesheet */}
        </div>
    );
};

export default ActivityFeed;

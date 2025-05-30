import React from 'react';
import { LoadingSpinner } from './LoadingSpinner'; // Make sure path is correct
import { formatDateTime } from '../utils/helpers'; // Make sure function exists
import {
  CheckSquare,
  MessageSquare,
  PhoneCall,
  Users as MeetingIcon,
  Calendar,
} from 'lucide-react';

// Activity type to icon mapping (expand as needed)
const typeToIcon = {
  Task: CheckSquare,
  Call: PhoneCall,
  Meeting: MeetingIcon,
  Email: MessageSquare,
};

const ActivityFeed = ({ activities, isLoading, entityType = 'Related', navigateToView }) => {
  if (isLoading)
    return (
      <LoadingSpinner text={`Loading ${entityType.toLowerCase()} activities...`} size="sm" />
    );

  if (!activities || activities.length === 0) {
    return (
      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
          {entityType} Activities:
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No activities linked to this {entityType.toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-4 border-t dark:border-gray-700">
      <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {entityType} Activities ({activities.length})
      </h4>
      <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {activities.map((activity) => {
          const Icon =
            typeToIcon[activity.type] ||
            Calendar; // Default icon if type not matched
          return (
            <li
              key={activity.id}
              className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <span
                  className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:underline"
                  onClick={() =>
                    navigateToView
                      ? navigateToView('activities', { openActivityId: activity.id })
                      : null
                  }
                  title={activity.subject}
                >
                  <Icon size={16} className="text-blue-500 flex-shrink-0" />
                  {activity.subject && activity.subject.length > 40
                    ? activity.subject.substring(0, 37) + '...'
                    : activity.subject || 'No Subject'}
                </span>
                <span
                  className={`flex-shrink-0 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    activity.status === 'Completed' || activity.status === 'Logged'
                      ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                      : activity.status === 'Open' || activity.status === 'Scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100'
                      : activity.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                  }`}
                >
                  {activity.status || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Type: {activity.type || 'N/A'}
                {activity.dueDate && ` | Due: ${formatDateTime(activity.dueDate)}`}
              </p>
              {activity.notes && (
                <p className="mt-1 text-gray-600 dark:text-gray-300 text-xs whitespace-pre-wrap">
                  {activity.notes.substring(0, 100)}
                  {activity.notes.length > 100 ? '...' : ''}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {/* Add custom-scrollbar styles to your global CSS if desired */}
    </div>
  );
};

export default ActivityFeed;

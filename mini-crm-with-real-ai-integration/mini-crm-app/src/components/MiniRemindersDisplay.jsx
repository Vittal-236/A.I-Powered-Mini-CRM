import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, X } from 'lucide-react';

const MiniRemindersDisplay = ({ isVisible, onClose }) => {
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      fetchUpcomingReminders();
      // Refresh reminders every 5 minutes
      const interval = setInterval(fetchUpcomingReminders, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const fetchUpcomingReminders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/reminders/upcoming');
      const data = await response.json();
      if (data.success) {
        // Show only next 5 upcoming reminders
        setUpcomingReminders(data.reminders.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeReminder = async (reminderId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/reminders/${reminderId}/complete`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        setUpcomingReminders(upcomingReminders.filter(reminder => reminder._id !== reminderId));
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const formatTimeUntil = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffTime < 0) return 'Overdue';
    if (diffHours < 1) return 'Soon';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays <= 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'call': return '📞';
      case 'meeting': return '🤝';
      case 'follow_up': return '📧';
      default: return '📝';
    }
  };

  const getUrgencyColor = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date - now) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'border-l-red-500 bg-red-50'; // Overdue
    if (diffHours < 24) return 'border-l-orange-500 bg-orange-50'; // Due today
    if (diffHours < 72) return 'border-l-yellow-500 bg-yellow-50'; // Due in 3 days
    return 'border-l-blue-500 bg-blue-50'; // Future
  };

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className="fixed top-20 right-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Upcoming Reminders</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Upcoming Reminders</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
              {upcomingReminders.length}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded"
              title="Close reminders"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {upcomingReminders.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No upcoming reminders</p>
            <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="p-2">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder._id}
                className={`p-3 mb-2 rounded-lg border-l-4 ${getUrgencyColor(reminder.reminder_date)} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getTypeIcon(reminder.type)}</span>
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {reminder.title}
                      </h4>
                    </div>
                    {reminder.lead_name && (
                      <p className="text-xs text-blue-600 mb-1">
                        👤 {reminder.lead_name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeUntil(reminder.reminder_date)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => completeReminder(reminder._id)}
                    className="ml-2 text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                    title="Mark as completed"
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniRemindersDisplay;
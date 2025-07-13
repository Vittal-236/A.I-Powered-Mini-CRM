import React, { useState, useEffect } from 'react';

const RemindersDashboard = () => {
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [allReminders, setAllReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchUpcomingReminders();
    fetchAllReminders();
  }, []);

  const fetchUpcomingReminders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/reminders/upcoming');
      const data = await response.json();
      if (data.success) {
        setUpcomingReminders(data.reminders);
      }
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
    }
  };

  const fetchAllReminders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/reminders');
      const data = await response.json();
      if (data.success) {
        setAllReminders(data.reminders);
      }
    } catch (error) {
      console.error('Error fetching all reminders:', error);
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
        // Update both lists
        setUpcomingReminders(upcomingReminders.map(reminder => 
          reminder._id === reminderId 
            ? { ...reminder, status: 'completed' }
            : reminder
        ));
        setAllReminders(allReminders.map(reminder => 
          reminder._id === reminderId 
            ? { ...reminder, status: 'completed' }
            : reminder
        ));
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const deleteReminder = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setUpcomingReminders(upcomingReminders.filter(reminder => reminder._id !== reminderId));
        setAllReminders(allReminders.filter(reminder => reminder._id !== reminderId));
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays > 0 && diffDays <= 7) {
      return `In ${diffDays} days (${date.toLocaleDateString()})`;
    } else {
      return date.toLocaleString();
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      call: 'bg-blue-100 text-blue-800',
      meeting: 'bg-green-100 text-green-800',
      follow_up: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || colors.general;
  };

  const getUrgencyColor = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date - now) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'border-l-red-500'; // Overdue
    if (diffHours < 24) return 'border-l-orange-500'; // Due today
    if (diffHours < 72) return 'border-l-yellow-500'; // Due in 3 days
    return 'border-l-blue-500'; // Future
  };

  const ReminderCard = ({ reminder, showLeadName = false }) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${getUrgencyColor(reminder.reminder_date)}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`font-semibold ${
              reminder.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {reminder.title}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(reminder.type)}`}>
              {reminder.type}
            </span>
            {reminder.status === 'completed' && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Completed
              </span>
            )}
          </div>
          {showLeadName && (
            <p className="text-sm text-blue-600 font-medium mb-1">
              👤 {reminder.lead_name}
            </p>
          )}
          {reminder.description && (
            <p className="text-gray-600 text-sm mb-2">{reminder.description}</p>
          )}
          <p className="text-sm text-gray-500">
            📅 {formatDate(reminder.reminder_date)}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          {reminder.status !== 'completed' && (
            <button
              onClick={() => completeReminder(reminder._id)}
              className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded hover:bg-green-50"
            >
              Complete
            </button>
          )}
          <button
            onClick={() => deleteReminder(reminder._id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reminders</h1>
        <p className="text-gray-600">Manage your follow-ups, calls, and meetings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Upcoming</h3>
          <p className="text-2xl font-bold text-blue-600">
            {upcomingReminders.filter(r => r.status !== 'completed').length}
          </p>
          <p className="text-sm text-blue-600">Next 7 days</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Completed</h3>
          <p className="text-2xl font-bold text-green-600">
            {allReminders.filter(r => r.status === 'completed').length}
          </p>
          <p className="text-sm text-green-600">All time</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800">Total</h3>
          <p className="text-2xl font-bold text-orange-600">{allReminders.length}</p>
          <p className="text-sm text-orange-600">All reminders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming ({upcomingReminders.filter(r => r.status !== 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Reminders ({allReminders.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'upcoming' && (
          <div>
            {upcomingReminders.filter(r => r.status !== 'completed').length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming reminders</h3>
                <p className="text-gray-500">You're all caught up! Create reminders from the lead details.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingReminders
                  .filter(r => r.status !== 'completed')
                  .map((reminder) => (
                    <ReminderCard key={reminder._id} reminder={reminder} showLeadName={true} />
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            {allReminders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders yet</h3>
                <p className="text-gray-500">Start by creating reminders for your leads to stay organized.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allReminders.map((reminder) => (
                  <ReminderCard key={reminder._id} reminder={reminder} showLeadName={true} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersDashboard;
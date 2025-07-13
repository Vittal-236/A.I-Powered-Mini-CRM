import React, { useState, useEffect } from 'react';

const RemindersModal = ({ isOpen, onClose, leadId, leadName }) => {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    reminder_date: '',
    type: 'general'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && leadId) {
      fetchReminders();
    }
  }, [isOpen, leadId]);

  const fetchReminders = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/reminders?lead_id=${leadId}`);
      const data = await response.json();
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const createReminder = async () => {
    if (!newReminder.title || !newReminder.reminder_date) {
      alert('Please fill in title and date');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newReminder,
          lead_id: leadId
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReminders([...reminders, data.reminder]);
        setNewReminder({
          title: '',
          description: '',
          reminder_date: '',
          type: 'general'
        });
      } else {
        alert('Error creating reminder: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Error creating reminder');
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
        setReminders(reminders.map(reminder => 
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
        setReminders(reminders.filter(reminder => reminder._id !== reminderId));
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Reminders for {leadName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Create New Reminder */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Reminder</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newReminder.title}
                onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Follow up call"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={newReminder.type}
                onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="follow_up">Follow Up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={newReminder.reminder_date}
                onChange={(e) => setNewReminder({...newReminder, reminder_date: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newReminder.description}
                onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional description"
              />
            </div>
          </div>
          <button
            onClick={createReminder}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Reminder'}
          </button>
        </div>

        {/* Existing Reminders */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Existing Reminders</h3>
          {reminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reminders found for this lead.</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className={`p-4 border rounded-lg ${
                    reminder.status === 'completed' ? 'bg-gray-50 opacity-75' : 'bg-white'
                  }`}
                >
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
                            Completed
                          </span>
                        )}
                      </div>
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
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => deleteReminder(reminder._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemindersModal;
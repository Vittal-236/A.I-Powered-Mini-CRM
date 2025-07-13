import { useEffect } from 'react';
import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trash2, MessageCircle, Plus, Users, TrendingUp, Mail, Activity, Sparkles, Target, Zap, Bell, Calendar } from 'lucide-react'
import WorkflowDesigner from './components/WorkflowDesigner.jsx'
import CreateLeadModal from './components/CreateLeadModal.jsx'
import LeadInteractionModal from './components/LeadInteractionModal.jsx'
import RemindersModal from './components/RemindersModal.jsx'
import RemindersDashboard from './components/RemindersDashboard.jsx'
import MiniRemindersDisplay from './components/MiniRemindersDisplay.jsx'
import './App.css'

function App() {
  // Sample lead data
const [leads, setLeads] = useState([]);
useEffect(() => {
  fetch("http://localhost:5001/api/leads")
    .then(res => res.json())
    .then(data => setLeads(data.leads || [])) // Ensure data.leads is an array, default to empty array
    .catch(err => {
      console.error("Failed to fetch leads:", err);
      setLeads([]); // Ensure leads is reset to an empty array on error
    });
}, []);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [filter, setFilter] = useState('All') // 'All', 'New', 'Contacted'
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInteractModal, setShowInteractModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showRemindersModal, setShowRemindersModal] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'reminders'

  // Filter leads based on status
  const filteredLeads = filter === 'All' 
    ? leads 
    : leads.filter(lead => lead.status === filter);

  // Calculate statistics
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === 'New').length;
  const contactedLeads = leads.filter(lead => lead.status === 'Contacted').length;
  const conversionRate = totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0;

  // Delete lead
  const deleteLead = (id) => {
  fetch(`http://localhost:5001/api/leads/${id}`, { method: "DELETE" })
    .then(() => setLeads(leads.filter(lead => lead._id !== id)));
}

  // Update lead status
  const updateStatus = (id, newStatus) => {
    fetch(`http://localhost:5001/api/leads/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: newStatus }),
}).then(() =>
  setLeads(leads.map(lead => 
    lead._id === id ? { ...lead, status: newStatus } : lead
  ))
);

  }
  // ✅ Create new lead
const createLead = (newLead) => {
  fetch("http://localhost:5001/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newLead),
  })
    .then((res) => res.json())
    .then((savedLead) => {
      setLeads([...leads, savedLead]);
      setShowCreateForm(false);
    })
    .catch((err) => console.error("Failed to create lead:", err));
};

  // Open interaction modal
  const openInteraction = (lead) => {
    setSelectedLead(lead)
    setShowInteractModal(true)
  }

  // Open reminders modal
  const openReminders = (lead) => {
    setSelectedLead(lead)
    setShowRemindersModal(true)
  }

const generateEmail = async (lead) => {
  try {
    const response = await fetch("http://localhost:5001/api/ai/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name,
        context: "follow-up"
      }),
    });

    const data = await response.json();

    if (data.email) {
      setGeneratedEmail(data.email);           // ✅ Set the email text
      setShowEmailModal(true);                 // ✅ Show the modal
    } else {
      setGeneratedEmail("Sorry, we couldn't generate the email. Please try again.");
      setShowEmailModal(true);                 // ✅ Still show the modal with error
      console.error("AI Email Error:", data.error || "Unknown error");
    }
  } catch (error) {
    console.error("Email generation failed:", error);
    setGeneratedEmail("An error occurred while generating the email.");
    setShowEmailModal(true);                   // ✅ Still show modal even on error
  }
};

  return (
    <div className="min-h-screen" style={{ background: '#223137' }}>

      {/* Header */}
      <header className="relative" style={{ background: '#2d4a53' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img src="/piazza logo.png" alt="Piazza Consulting Group Logo" style={{ height: 32, width: 'auto', position: 'absolute', top: '8px', left: '16px' }} />
              <div className="ml-16">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  Nexus
                </h1>
                <p className="text-sm text-white/80 drop-shadow">
                  Your Leads, Seamlessly Managed.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setCurrentView(currentView === 'dashboard' ? 'reminders' : 'dashboard')}
                className="flex items-center gap-2 px-6 py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white drop-shadow-lg shadow-2xl shadow-blue-400/60 rounded-full border-2 border-blue-400 hover:border-cyan-500 transform hover:scale-110 hover:animate-pulse transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                {currentView === 'dashboard' ? (
                  <>
                    <Calendar className="h-5 w-5" />
                    Reminders
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5" />
                    Dashboard
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-8 py-3 text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white drop-shadow-lg shadow-2xl shadow-pink-400/60 rounded-full border-2 border-pink-400 hover:border-purple-500 transform hover:scale-110 hover:animate-pulse transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-300"
              >
                <Plus className="h-5 w-5" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mini Reminders Display - Only show on dashboard view */}
      {currentView === 'dashboard' && <MiniRemindersDisplay />}

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'reminders' ? (
          <RemindersDashboard />
        ) : (
          <>
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" style={{ background: '#a1b6c1', color: '#223137' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Leads</p>
                      <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                      <Users className="h-6 w-6" style={{ color: '#001f3f' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" style={{ background: '#a1b6c1', color: '#223137' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New Leads</p>
                      <p className="text-3xl font-bold" style={{ color: '#FFFF00' }}>{newLeads}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <Target className="h-6 w-6" style={{ color: '#001f3f' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" style={{ background: '#a1b6c1', color: '#223137' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contacted</p>
                      <p className="text-3xl font-bold text-purple-600">{contactedLeads}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <Mail className="h-6 w-6" style={{ color: '#001f3f' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" style={{ background: '#a1b6c1', color: '#223137' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-3xl font-bold text-orange-600">{conversionRate}%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                      <TrendingUp className="h-6 w-6" style={{ color: '#001f3f' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Buttons */}
            <div className="my-6 rounded-xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 shadow-md px-6 py-4 flex flex-wrap gap-3 justify-center">
              <Button 
                variant={filter === 'All' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setFilter('All')}
                className={`${
                  filter === 'All' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-black shadow-lg border-none' 
                    : 'bg-white border-2 border-purple-200 text-gray-800'
                } transform hover:scale-105 transition-all duration-200`}
              >
                <Activity className={`h-4 w-4 mr-2 ${filter === 'All' ? 'text-black' : 'text-gray-800'}`} />
                All Leads ({totalLeads})
              </Button>
              <Button 
                variant={filter === 'New' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setFilter('New')}
                className={`${
                  filter === 'New' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-black shadow-lg border-none' 
                    : 'bg-white border-2 border-green-200 text-gray-800'
                } transform hover:scale-105 transition-all duration-200`}
              >
                <Target className={`h-4 w-4 mr-2 ${filter === 'New' ? 'text-black' : 'text-gray-800'}`} />
                New ({newLeads})
              </Button>
              <Button 
                variant={filter === 'Contacted' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setFilter('Contacted')}
                className={`${
                  filter === 'Contacted' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-black shadow-lg border-none' 
                    : 'bg-white border-2 border-blue-200 text-gray-800'
                } transform hover:scale-105 transition-all duration-200`}
              >
                <Mail className={`h-4 w-4 mr-2 ${filter === 'Contacted' ? 'text-black' : 'text-gray-800'}`} />
                Contacted ({contactedLeads})
              </Button>
            </div>

            {/* Dashboard Section */}
            <Card className="bg-white border-0 shadow-xl mb-8">
              <CardHeader className="border-b border-gray-200/50">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                  <Zap className="h-6 w-6 mr-3 text-purple-600" />
                  Lead Management Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Phone</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Source</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead, index) => (
                        <tr 
                          key={lead._id} 
                          className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="py-4 px-6 font-medium text-gray-900">{lead.name}</td>
                          <td className="py-4 px-6 text-gray-700">{lead.email}</td>
                          <td className="py-4 px-6 text-gray-700">{lead.phone}</td>
                          <td className="py-4 px-6">
                            <Badge 
                              variant={lead.status === 'New' ? 'default' : 'secondary'}
                              className={`${
                                lead.status === 'New' 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black' 
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-black'
                              } px-3 py-1 rounded-full font-medium`}
                            >
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-gray-700">{lead.source}</td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(lead._id, lead.status === 'New' ? 'Contacted' : 'New')}
                                className="bg-white/80 backdrop-blur-md border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transform hover:scale-105 transition-all duration-200 text-gray-800"
                              >
                                {lead.status === 'New' ? 'Mark Contacted' : 'Mark New'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openInteraction(lead)}
                                className="bg-white/80 backdrop-blur-md border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 text-gray-800"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Interact
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReminders(lead)}
                                className="bg-white/80 backdrop-blur-md border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 transform hover:scale-105 transition-all duration-200 text-gray-800"
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                Reminders
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateEmail(lead)}
                                className="bg-white/80 backdrop-blur-md border-2 border-green-200 hover:border-green-300 hover:bg-green-50 transform hover:scale-105 transition-all duration-200 text-gray-800"
                              >
                                ✉️ Generate Email
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteLead(lead._id)}
                                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transform hover:scale-105 transition-all duration-200 text-gray-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Designer */}
            <WorkflowDesigner onLeadStatusChange={updateStatus} leads={leads} />
          </>
        )}
      </main>

      {/* Modals */}
      {/* Lead Creation Form Modal */}
      {showCreateForm && (
        <CreateLeadModal 
          onClose={() => setShowCreateForm(false)}
          onAddLead={createLead}
        />
      )}

      {/* Lead Interaction Modal */}
      {showInteractModal && selectedLead && (
        <LeadInteractionModal 
          lead={selectedLead}
          onClose={() => setShowInteractModal(false)}
        />
      )}

      {/* Reminders Modal */}
      {showRemindersModal && selectedLead && (
        <RemindersModal 
          isOpen={showRemindersModal}
          onClose={() => setShowRemindersModal(false)}
          leadId={selectedLead._id}
          leadName={selectedLead.name}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 bg-white/95 backdrop-blur-md border-0 shadow-2xl">
            <CardHeader className="border-b border-gray-200/50">
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                AI-Generated Follow-up Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="whitespace-pre-wrap bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 text-sm leading-relaxed">
                {generatedEmail}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedEmail);
                  }}
                  className="bg-white/80 backdrop-blur-md border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transform hover:scale-105 transition-all duration-200 text-gray-800"
                >
                  Copy to Clipboard
                </Button>
                <Button 
                  onClick={() => setShowEmailModal(false)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default App

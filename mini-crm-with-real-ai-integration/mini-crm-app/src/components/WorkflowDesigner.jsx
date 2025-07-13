import React, { useState, useCallback } from 'react'
import ReactFlow,{MiniMap,Controls,Background,useNodesState,useEdgesState,addEdge,Handle,Position,}from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Play, Save, Mail, RefreshCw, Zap, Workflow, Terminal, Settings } from 'lucide-react'

const initialNodes = [
  {
    id: 'trigger',
    type: 'trigger',
    data: { 
      label: 'Lead Created',
      description: 'Trigger when a new lead is created'
    },
    position: { x: 250, y: 50 },
    deletable: false,
  },
]

const initialEdges = []

// Custom node components with enhanced styling
const TriggerNode = ({ data }) => (
  <div style={{ background: '#a1b6c1', border: '2px solid #2d4a53', borderRadius: '1rem', padding: '1rem', minWidth: 200, boxShadow: '0 4px 24px #22313722' }}>
    <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-emerald-300 border-2 border-white" />
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-emerald-200 rounded-lg">
        <Zap className="h-5 w-5" style={{ color: 'black' }} />
      </div>
      <div className="font-bold text-lg" style={{ color: '#223137' }}>{data.label}</div>
    </div>
    <div className="text-xs p-2 rounded-lg" style={{ color: '#223137', background: '#c7d3db' }}>{data.description}</div>
  </div>
)

const SendEmailNode = ({ data }) => (
  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-400 rounded-xl p-4 min-w-[200px] shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
    <Handle type="target" position={Position.Top} className="w-4 h-4 bg-blue-300 border-2 border-white" />
    <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-blue-300 border-2 border-white" />
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-blue-200 rounded-lg">
        <Mail className="h-5 w-5" style={{ color: 'black' }} />
      </div>
      <div className="font-bold text-lg" style={{ color: 'black' }}>{data.label}</div>
    </div>
    <div className="text-xs opacity-90 bg-white/40 p-2 rounded-lg" style={{ color: 'black' }}>{data.description}</div>
  </div>
)

const UpdateStatusNode = ({ data }) => (
  <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-400 rounded-xl p-4 min-w-[200px] shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
    <Handle type="target" position={Position.Top} className="w-4 h-4 bg-orange-300 border-2 border-white" />
    <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-orange-300 border-2 border-white" />
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-orange-200 rounded-lg">
        <RefreshCw className="h-5 w-5" style={{ color: 'black' }} />
      </div>
      <div className="font-bold text-lg" style={{ color: 'black' }}>{data.label}</div>
    </div>
    <div className="text-xs opacity-90 bg-white/40 p-2 rounded-lg" style={{ color: 'black' }}>{data.description}</div>
  </div>
)

// Custom node types
const nodeTypes = {
  trigger: TriggerNode,
  sendEmail: SendEmailNode,
  updateStatus: UpdateStatusNode,
}

function WorkflowDesigner({ onLeadStatusChange, leads }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeCount, setNodeCount] = useState(1)
  const [executionLog, setExecutionLog] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addSendEmailNode = () => {
    if (nodes.length >= 4) {
      showToastMessage('Maximum 3 action nodes allowed!')
      return
    }
    
    const newNode = {
      id: `email-${nodeCount + 1}`,
      type: 'sendEmail',
      data: { 
        label: 'Send Email',
        description: 'Send follow-up email to lead'
      },
      position: { x: 100 + (nodeCount * 200), y: 200 },
    }
    
    setNodes((nds) => nds.concat(newNode))
    setNodeCount(nodeCount + 1)
    showToastMessage('Email action node added!')
  }

  const addUpdateStatusNode = () => {
    if (nodes.length >= 4) {
      showToastMessage('Maximum 3 action nodes allowed!')
      return
    }
    
    const newNode = {
      id: `status-${nodeCount + 1}`,
      type: 'updateStatus',
      data: { 
        label: 'Update Status',
        description: 'Change lead status to Contacted'
      },
      position: { x: 100 + (nodeCount * 200), y: 200 },
    }
    
    setNodes((nds) => nds.concat(newNode))
    setNodeCount(nodeCount + 1)
    showToastMessage('Status update action node added!')
  }

  const clearWorkflow = () => {
    setNodes(initialNodes)
    setEdges([])
    setNodeCount(1)
    setExecutionLog([])
    showToastMessage('Workflow cleared!')
  }

  const saveWorkflow = () => {
    const workflow = { 
      nodes: nodes.map(n => ({ ...n, selected: false })), 
      edges: edges.map(e => ({ ...e, selected: false }))
    }
    localStorage.setItem('crm-workflow', JSON.stringify(workflow))
    console.log('Workflow saved:', workflow)
    showToastMessage('Workflow saved to browser storage!')
  }

  const loadWorkflow = () => {
    try {
      const saved = localStorage.getItem('crm-workflow')
      if (saved) {
        const workflow = JSON.parse(saved)
        setNodes(workflow.nodes || initialNodes)
        setEdges(workflow.edges || [])
        setNodeCount(workflow.nodes ? workflow.nodes.length : 1)
        showToastMessage('Workflow loaded from storage!')
      } else {
        showToastMessage('No saved workflow found!')
      }
    } catch (error) {
      showToastMessage('Error loading workflow!')
    }
  }

  const executeWorkflow = async () => {
    const log = []
    const timestamp = new Date().toLocaleTimeString()
    
    log.push(`[${timestamp}] Workflow execution started...`)
    log.push(`[${timestamp}] Trigger: Lead Created - Activated`)
    
    // Find all nodes connected to the trigger
    const connectedNodes = edges
      .filter(edge => edge.source === 'trigger')
      .map(edge => nodes.find(n => n.id === edge.target))
      .filter(Boolean)
    
    if (connectedNodes.length === 0) {
      log.push(`[${timestamp}] No actions connected to trigger`)
    } else {
      for (const node of connectedNodes) {
        if (node.type === 'sendEmail') {
          log.push(`[${timestamp}] ✉️ Action: Email sent to lead`)
          // In a real app, you'd trigger an email sending API here
        } else if (node.type === 'updateStatus') {
          log.push(`[${timestamp}] 🔄 Action: Lead status updated to Contacted`)
          // Assuming you want to update the first lead in the list for demonstration
          // In a real app, you'd pass the lead ID from the trigger context
          if (leads.length > 0) {
            const leadToUpdate = leads[0]; // For demonstration, update the first lead
            try {
              const response = await fetch(`http://localhost:5001/api/leads/${leadToUpdate._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Contacted' }),
              });
              if (response.ok) {
                log.push(`[${timestamp}] ✅ Lead ${leadToUpdate.name} status updated to Contacted in DB.`)
                onLeadStatusChange(leadToUpdate._id, 'Contacted'); // Update parent state
              } else {
                const errorData = await response.json();
                log.push(`[${timestamp}] ❌ Failed to update lead status: ${errorData.error || response.statusText}`)
              }
            } catch (error) {
              log.push(`[${timestamp}] ❌ Error updating lead status: ${error.message}`)
            }
          } else {
            log.push(`[${timestamp}] ⚠️ No leads available to update status.`)
          }
        }
      }
    }
    
    log.push(`[${timestamp}] Workflow execution completed!`)
    log.push('---')
    
    setExecutionLog(prev => [...log, ...prev])
    showToastMessage(`Workflow executed! ${connectedNodes.length} actions triggered.`)
  }

  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <Card className="mt-8 border-0 shadow-xl" style={{ background: '#a1b6c1', color: '#223137' }}>
      <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center justify-between text-xl font-bold" style={{ color: 'black' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Workflow className="h-6 w-6" style={{ color: 'black' }} />
            </div>
            <div>
              <div style={{ color: 'black' }}>AI-Powered Workflow Designer</div>
              <div className="text-sm font-normal" style={{ color: 'black' }}>Visual automation with React Flow</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={addSendEmailNode} 
              size="sm" 
              disabled={nodes.length >= 4} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg transform hover:scale-105 transition-all duration-200"
              style={{ color: 'black' }}
            >
              <Mail className="h-4 w-4 mr-1" style={{ color: 'black' }} />
              Add Email
            </Button>
            <Button 
              onClick={addUpdateStatusNode} 
              size="sm" 
              disabled={nodes.length >= 4} 
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg transform hover:scale-105 transition-all duration-200"
              style={{ color: 'black' }}
            >
              <RefreshCw className="h-4 w-4 mr-1" style={{ color: 'black' }} />
              Add Status
            </Button>
            <Button 
              onClick={clearWorkflow} 
              size="sm" 
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              style={{ color: 'black' }}
            >
              Clear
            </Button>
            <Button 
              onClick={loadWorkflow} 
              size="sm" 
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              style={{ color: 'black' }}
            >
              Load
            </Button>
            <Button 
              onClick={saveWorkflow} 
              size="sm" 
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              style={{ color: 'black' }}
            >
              <Save className="h-4 w-4 mr-1" style={{ color: 'black' }} />
              Save
            </Button>
            <Button 
              onClick={executeWorkflow} 
              size="sm" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg transform hover:scale-105 transition-all duration-200"
              style={{ color: 'black' }}
            >
              <Play className="h-4 w-4 mr-1" style={{ color: 'black' }} />
              Execute
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* React Flow Canvas */}
          <div className="lg:col-span-2">
            <div style={{ width: '100%', height: '500px' }} className="border-2 border-gray-200 rounded-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-lg overflow-hidden">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
                edgestyle={{
                  stroke: '#8b5cf6',
                  strokeWidth: 3,
                }}
              >
                <Controls className="bg-white/90 backdrop-blur-sm shadow-lg rounded-lg" />
                <MiniMap 
                  className="bg-white/90 backdrop-blur-sm shadow-lg rounded-lg" 
                  nodeColor={(node) => {
                    switch (node.type) {
                      case 'trigger': return '#10b981'
                      case 'sendEmail': return '#3b82f6'
                      case 'updateStatus': return '#f59e0b'
                      default: return '#6b7280'
                    }
                  }}
                />
                <Background variant="dots" gap={20} size={1} color="#e5e7eb" />
              </ReactFlow>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Settings className="h-5 w-5" style={{ color: 'black' }} />
                <p className="font-semibold" style={{ color: 'black' }}>📋 Instructions:</p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-sm" style={{ color: 'black' }}>
                <li>Click <strong>"Add Email"</strong> or <strong>"Add Status"</strong> to add action nodes</li>
                <li>Drag from the <strong>small circles</strong> on nodes to connect them</li>
                <li>Maximum <strong>3 action nodes</strong> can be connected to the trigger</li>
                <li>Click <strong>"Execute"</strong> to run the workflow and see results in the log</li>
                <li>Use <strong>"Save"</strong> and <strong>"Load"</strong> to persist workflows in browser storage</li>
              </ul>
            </div>
          </div>

          {/* Execution Log */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Terminal className="h-5 w-5" style={{ color: 'black' }} />
              <h3 className="font-semibold" style={{ color: 'black' }}>📊 Execution Log</h3>
              <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 border-0" style={{ color: 'black', background: 'white' }}>
                {executionLog.length} entries
              </Badge>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl h-80 overflow-y-auto font-mono text-xs shadow-xl border border-gray-700" style={{ color: 'black', background: 'white' }}>
              {executionLog.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'black' }}>
                  <div className="p-4 rounded-lg" style={{ background: '#eee', color: 'black' }}>
                    <p className="text-lg" style={{ color: 'black' }}>💻 No executions yet</p>
                    <p className="mt-2 text-sm" style={{ color: 'black' }}>Click "Execute" to run the workflow</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {executionLog.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <span className="min-w-[20px] font-bold" style={{ color: 'black' }}>{String(executionLog.length - idx).padStart(2, '0')}:</span>
                      <span style={{ color: 'black' }}>{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-xs font-medium" style={{ color: 'black' }}>
                💡 Tip: Workflows are saved to browser storage and persist between sessions
              </p>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 transform hover:scale-105 transition-all duration-200" style={{ color: 'black', background: 'white' }}>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WorkflowDesigner

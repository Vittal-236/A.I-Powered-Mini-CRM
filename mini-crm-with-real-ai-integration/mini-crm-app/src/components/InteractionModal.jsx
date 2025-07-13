import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'

function InteractionModal({ lead, onClose }) {
  const [messages, setMessages] = useState([
    {
      type: 'system',
      content: `Lead Details: Name: ${lead.name}, Email: ${lead.email}, Status: ${lead.status}`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { type: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          lead_context: {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: lead.status,
            source: lead.source
          },
          history: messages.filter(msg => msg.type !== 'system').map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessages([...newMessages, { type: 'assistant', content: result.response }])
      } else {
        setMessages([...newMessages, { type: 'assistant', content: `Error: ${result.error}` }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages([...newMessages, { type: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 h-96">
        <CardHeader>
          <CardTitle>Lead Interaction with AI Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-md ${
                  msg.type === 'user' 
                    ? 'bg-blue-100 ml-8' 
                    : msg.type === 'assistant'
                    ? 'bg-gray-100 mr-8'
                    : 'bg-yellow-50 text-sm'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 mr-8 p-2 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded-md"
              placeholder="Ask about this lead..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
          <Button variant="outline" onClick={onClose} className="mt-2">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default InteractionModal


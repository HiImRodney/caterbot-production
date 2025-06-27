import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Bot, User, AlertCircle, CheckCircle, Clock, Phone } from 'lucide-react'
import { useEquipment } from '../contexts/EquipmentContext'
import { sendChatMessage, ChatMessage } from '../lib/supabase'

const ChatInterface: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { currentEquipment } = useEquipment()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus input on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Start with welcome message if we have equipment context
    if (currentEquipment && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        session_id: sessionId || 'temp',
        content: `Hello! I'm here to help you troubleshoot the **${currentEquipment.custom_name}** (${currentEquipment.make} ${currentEquipment.model}) located in ${currentEquipment.location}.

What issue are you experiencing? Please describe:
• What's happening with the equipment?
• When did you first notice the problem?
• Any error messages or unusual sounds?

I'll provide step-by-step guidance to help resolve the issue safely.`,
        role: 'assistant',
        created_at: new Date().toISOString(),
        equipment_context: currentEquipment
      }
      setMessages([welcomeMessage])
    }
  }, [currentEquipment, sessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      session_id: sessionId || 'temp',
      content: inputMessage.trim(),
      role: 'user',
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      // Send to our Edge Functions pipeline
      const response = await sendChatMessage(
        inputMessage.trim(),
        sessionId || 'temp',
        currentEquipment
      )

      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          session_id: sessionId || 'temp',
          content: response.response,
          role: 'assistant',
          created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(response.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setError('Failed to send message. Please try again.')
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        session_id: sessionId || 'temp',
        content: '⚠️ Sorry, I encountered an error. Please try rephrasing your question or contact your manager if the issue persists.',
        role: 'assistant',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Format message content (basic markdown support)
  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }

  // Render message
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user'
    const isError = message.content.startsWith('⚠️')
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-600' : isError ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {isUser ? (
                <User size={16} className="text-white" />
              ) : isError ? (
                <AlertCircle size={16} className="text-red-600" />
              ) : (
                <Bot size={16} className="text-gray-600" />
              )}
            </div>
          </div>

          {/* Message bubble */}
          <div>
            <div
              className={`px-4 py-2 rounded-lg ${
                isUser
                  ? 'bg-blue-600 text-white'
                  : isError
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: formatMessage(message.content)
                }}
              />
            </div>
            <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {new Date(message.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">
                {currentEquipment ? currentEquipment.custom_name : 'Equipment Assistant'}
              </h1>
              <p className="text-sm text-gray-600">
                {currentEquipment 
                  ? `${currentEquipment.make} ${currentEquipment.model} • ${currentEquipment.location}`
                  : 'AI-powered troubleshooting'
                }
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {currentEquipment && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentEquipment.status === 'operational' ? 'bg-green-100 text-green-800' :
                currentEquipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentEquipment.status}
              </div>
            )}
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <Phone size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {messages.map(renderMessage)}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex max-w-xs lg:max-w-md">
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot size={16} className="text-gray-600" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the issue you're experiencing..."
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Press Enter to send</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle size={12} className="text-green-600" />
                Secure connection
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {sessionId ? `Session ${sessionId.slice(-8)}` : 'New session'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (if no messages yet) */}
      {messages.length <= 1 && currentEquipment && (
        <div className="bg-gray-100 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-600 mb-2">Quick troubleshooting starters:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "It's not turning on",
                "Making unusual noise",
                "Temperature issues",
                "Error message displayed",
                "Leaking or dripping"
              ].map((starter, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(starter)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatInterface
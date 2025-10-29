import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import io from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

const TherapyChatPage = () => {
  const { sessionId } = useParams()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [isConnected, setIsConnected] = useState(false)
    const [sessionInfo, setSessionInfo] = useState(null)
    const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    
    const navigate = useNavigate()
    const messagesEndRef = useRef(null)
    const { user } = useAuth()
    const isTherapist = localStorage.getItem('isTherapist') === 'true'
    const socketRef = useRef(null)
    
    console.log('TherapyChatPage rendered with sessionId:', sessionId);
    console.log('Is therapist:', isTherapist);
    console.log('User:', user);

  // Initialize therapy session
    useEffect(() => {
      console.log('Initializing therapy session with sessionId:', sessionId);
      initializeTherapySession()
      
      return () => {
        // Cleanup on component unmount
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    }, [sessionId])

  // Timer effect
  useEffect(() => {
    let timer
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleEndSession()
    }
    
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isTimerRunning, timeLeft])

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeTherapySession = async () => {
      try {
        console.log('Fetching therapy session messages with sessionId:', sessionId);
        // Fetch session info
        const response = await fetch(`/api/therapy/messages/${sessionId}`)
        const data = await response.json()
        console.log('Messages response:', data);
        
        if (data.success) {
          setMessages(data.messages)
          
          // Get session info
          console.log('Fetching session info with sessionId:', sessionId);
          const sessionResponse = await fetch(`/api/therapy/user/${sessionId}`)
          const sessionData = await sessionResponse.json()
          console.log('Session info response:', sessionData);
          
          if (sessionData.success && sessionData.sessions.length > 0) {
            setSessionInfo(sessionData.sessions[0])
            console.log('Session status:', sessionData.sessions[0].status);
            
            // Start timer if session is in progress
            if (sessionData.sessions[0].status === 'in_progress') {
              console.log('Starting timer as session is in progress');
              setIsTimerRunning(true)
              if (sessionData.sessions[0].started_at) {
                const startedAt = new Date(sessionData.sessions[0].started_at)
                const now = new Date()
                const elapsedSeconds = Math.floor((now - startedAt) / 1000)
                const remainingSeconds = Math.max(0, (15 * 60) - elapsedSeconds)
                console.log('Setting time left to:', remainingSeconds);
                setTimeLeft(remainingSeconds)
              }
            } else {
              console.log('Session not in progress, timer will not start');
            }
          }
        }
        
        // Initialize WebSocket connection
        console.log('Initializing WebSocket connection');
        initializeWebSocket()
      } catch (error) {
        console.error('Error initializing therapy session:', error)
      }
    }

  const initializeWebSocket = () => {
    // Connect to WebSocket server
    const socket = io('http://localhost:3000', {
      transports: ['websocket']
    })
    
    socketRef.current = socket
    
    // Handle connection
    socket.on('connect', () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      
      // Join therapy session
      socket.emit('join_therapy_session', {
        session_id: sessionId,
        user_id: isTherapist ? 'therapist' : (user?.id || 'user') // Use actual user ID
      })
    })
    
    // Handle connection error
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    })
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
    })
    
    // Handle new therapy messages
    socket.on('new_therapy_message', (message) => {
      setMessages(prev => [...prev, message])
    })
    
    // Handle user joined notification
    socket.on('user_joined_therapy', (data) => {
      console.log(data.message)
    })
    
    // Handle session started notification
    socket.on('therapy_session_started', async (data) => {
      console.log('Therapy session started:', data)
      // Refresh session info to update the UI
      try {
        const sessionResponse = await fetch(`/api/therapy/user/${sessionId}`)
        const sessionData = await sessionResponse.json()
        
        if (sessionData.success && sessionData.sessions.length > 0) {
          setSessionInfo(sessionData.sessions[0])
          
          // Start timer if session is in progress
          if (sessionData.sessions[0].status === 'in_progress') {
            console.log('Starting timer as session is now in progress');
            setIsTimerRunning(true)
            if (sessionData.sessions[0].started_at) {
              const startedAt = new Date(sessionData.sessions[0].started_at)
              const now = new Date()
              const elapsedSeconds = Math.floor((now - startedAt) / 1000)
              const remainingSeconds = Math.max(0, (15 * 60) - elapsedSeconds)
              console.log('Setting time left to:', remainingSeconds);
              setTimeLeft(remainingSeconds)
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing session info:', error)
      }
    })
    
    // Handle user left notification
    socket.on('user_left_therapy', (data) => {
      console.log(data.message)
    })
    
    // Handle errors
    socket.on('error', (data) => {
      console.error('WebSocket error:', data.message)
    })
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return
    
    // Send message via WebSocket
    socketRef.current.emit('send_therapy_message', {
      session_id: sessionId,
      sender_id: isTherapist ? 'therapist' : (user?.id || 'user'), // Use actual user ID
      sender_type: isTherapist ? 'therapist' : 'user',
      content: newMessage
    })
    
    // Clear input
    setNewMessage('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleEndSession = async () => {
      try {
        console.log('Attempting to end session with ID:', sessionId);
        console.log('Current session info:', sessionInfo);
        
        const response = await fetch(`/api/therapy/end/${sessionId}`, {
          method: 'POST'
        })
        
        const data = await response.json()
        console.log('End session response:', data);
        
        if (data.success) {
          alert('Therapy session ended successfully!')
          navigate(isTherapist ? '/therapist/dashboard' : '/dashboard')
        } else {
          alert(`Error: ${data.error}`)
        }
      } catch (error) {
        console.error('Error ending session:', error)
        alert('Failed to end session')
      }
    }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Therapy Session</h1>
            {sessionInfo && (
              <p className="text-gray-400">
                Session with: {sessionInfo.user_email} | 
                Status: <span className="capitalize">{sessionInfo.status}</span>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <span className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className="flex items-center bg-gray-700 px-3 py-1 rounded">
              <span className="mr-2">⏰</span>
              <span className={`font-mono ${timeLeft < 300 ? 'text-red-400' : 'text-green-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <button
              onClick={handleEndSession}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Chat interface */}
        <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 p-3 rounded-lg max-w-3xl ${
                    message.sender_type === 'therapist'
                      ? 'bg-blue-900 ml-auto'
                      : 'bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">
                      {isTherapist ?
                        (message.sender_type === 'therapist' ? 'You' : 'Patient') :
                        (message.sender_type === 'user' ? 'You' : 'Therapist')}
                     </div>
                    <div className="text-xs text-gray-400">
                      {message.created_at ? new Date(message.created_at).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                  <div className="mt-2 break-words">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 px-6 py-2 rounded-r-lg transition"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <p>This is a secure therapy session. All communications are confidential.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TherapyChatPage
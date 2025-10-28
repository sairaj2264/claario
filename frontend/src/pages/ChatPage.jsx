import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const ChatPage = () => {
  const [userSessionId, setUserSessionId] = useState(null);
  const [username, setUsername] = useState('');
  const [groupId, setGroupId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(0);
  
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize chat session
  useEffect(() => {
    initializeChatSession();
    
    return () => {
      // Cleanup on component unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeChatSession = async () => {
    try {
      // Create a new session
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setUserSessionId(data.user_session_id);
        
        // Initialize WebSocket connection
        initializeWebSocket(data.user_session_id);
      } else {
        console.error('Failed to create chat session:', data.error);
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
    }
  };

  const initializeWebSocket = (sessionId) => {
    // Connect to WebSocket server
    const socket = io('http://localhost:3000', {
      transports: ['websocket']
    });
    
    socketRef.current = socket;
    
    // Handle connection
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      
      // Join chat with user session ID
      socket.emit('join_chat', { user_session_id: sessionId });
    });
    
    // Handle connection error
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });
    
    // Handle waiting for group
    socket.on('waiting_for_group', (data) => {
      setUsername(data.username);
      setIsWaiting(true);
    });
    
    // Handle joined group
    socket.on('joined_group', (data) => {
      setGroupId(data.group.id);
      setUsername(data.username);
      setIsWaiting(false);
    });
    
    // Handle previous messages
    socket.on('previous_messages', (data) => {
      setMessages(data.messages);
      if (data.messages.length > 0) {
        const maxId = Math.max(...data.messages.map(msg => msg.id));
        setLastMessageId(maxId);
      }
    });
    
    // Handle new messages
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
      if (message.id > lastMessageId) {
        setLastMessageId(message.id);
      }
    });
    
    // Handle user joined notification
    socket.on('user_joined', (data) => {
      // Could show a notification or update UI
      console.log(data.message);
    });
    
    // Handle user typing
    socket.on('user_typing', (data) => {
      // Could show typing indicators
      console.log(`${data.username} is typing: ${data.is_typing}`);
    });
    
    // Handle banned user
    socket.on('banned', (data) => {
      setIsBanned(true);
      // Fetch ban info
      fetchBanInfo(sessionId);
    });
    
    // Handle errors
    socket.on('error', (data) => {
      console.error('WebSocket error:', data.message);
    });
  };

  const generateRandomUsername = () => {
    const adjectives = ['Cool', 'Awesome', 'Brave', 'Clever', 'Swift', 'Bright', 'Witty', 'Smart', 'Quick', 'Bold'];
    const nouns = ['Panda', 'Eagle', 'Tiger', 'Wolf', 'Fox', 'Bear', 'Lion', 'Hawk', 'Shark', 'Falcon'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 90) + 10;
    
    return `${adjective}${noun}${number}`;
  };

  const fetchBanInfo = async (sessionId) => {
    try {
      const response = await fetch(`/api/chat/status/${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.status.banned) {
        setBanInfo(data.status.ban_info);
      }
    } catch (error) {
      console.error('Error fetching ban info:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !userSessionId || !groupId) return;
    
    // Send message via WebSocket
    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        user_session_id: userSessionId,
        content: newMessage
      });
      
      // Clear input
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      
      // Notify server that user is typing
      if (socketRef.current && userSessionId) {
        socketRef.current.emit('typing', {
          user_session_id: userSessionId,
          is_typing: true
        });
      }
    }
    
    // Reset typing indicator after 1 second of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      
      // Notify server that user stopped typing
      if (socketRef.current && userSessionId) {
        socketRef.current.emit('typing', {
          user_session_id: userSessionId,
          is_typing: false
        });
      }
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const leaveChat = () => {
    if (!userSessionId) return;
    
    // Leave chat via WebSocket
    if (socketRef.current) {
      socketRef.current.emit('leave_chat', { user_session_id: userSessionId });
    }
    
    // Reset state
    setGroupId(null);
    setMessages([]);
    setIsWaiting(false);
    setUsername('');
    
    // Navigate to home
    navigate('/');
  };

  if (isBanned) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 mt-8">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-4">You have been banned from the chat system due to violations of our community guidelines.</p>
            
            {banInfo && (
              <div className="bg-red-800 rounded p-4 mb-4">
                <h2 className="font-semibold mb-2">Ban Details:</h2>
                <p>Reason: {banInfo.ban_reason || 'Multiple policy violations'}</p>
                <p>Banned on: {banInfo.banned_at ? new Date(banInfo.banned_at).toLocaleString() : 'N/A'}</p>
                <p>Flag count: {banInfo.flag_count}</p>
              </div>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Anonymous Chat</h1>
            {groupId && (
              <p className="text-gray-400">Group ID: {groupId} | Username: {username}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <span className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={leaveChat}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Leave Chat
            </button>
          </div>
        </div>

        {/* Waiting for group */}
        {isWaiting && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Finding Chat Partners</h2>
            <p className="text-gray-400">Waiting for more users to join... (Groups of 2-5 users)</p>
            <p className="text-gray-400 mt-2">Your temporary username: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{username}</span></p>
          </div>
        )}

        {/* Chat interface */}
        {!isWaiting && groupId && (
          <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet. Be the first to start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 p-3 rounded-lg max-w-3xl ${
                      message.user_session_id === userSessionId
                        ? 'bg-blue-900 ml-auto'
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold">
                        {message.username}
                        {message.user_session_id === userSessionId && (
                          <span className="ml-2 text-xs bg-blue-700 px-2 py-1 rounded">You</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {message.created_at ? new Date(message.created_at).toLocaleTimeString() : 'Just now'}
                      </div>
                    </div>
                    <div className="mt-2 break-words">
                      {message.content}
                      {message.flagged && (
                        <span className="ml-2 text-xs bg-yellow-700 px-2 py-1 rounded">
                          Flagged
                        </span>
                      )}
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
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
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
                <p>All messages are monitored for inappropriate content. Violations will result in account restrictions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Connection status */}
        {!isConnected && !isWaiting && !groupId && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Connecting to Chat Server</h2>
            <p className="text-gray-400">Establishing secure connection...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DiaryEntryModal = ({
  userId,
  userEmail,
  date,
  entry,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Mood options with emojis
  const moodOptions = [
    { value: '😊', label: 'Happy' },
    { value: '😢', label: 'Sad' },
    { value: '😠', label: 'Angry' },
    { value: '😰', label: 'Anxious' },
    { value: '😌', label: 'Calm' },
    { value: '😴', label: 'Tired' },
    { value: '🤩', label: 'Excited' },
    { value: '😐', label: 'Neutral' }
  ]

  // Reset form when entry changes or modal opens
  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '')
      setContent(entry.content || '')
      setMood(entry.mood || '')
    } else {
      setTitle('')
      setContent('')
      setMood('')
    }
    setError(null)
  }, [entry, isOpen])

  // Handle save
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }
    
    if (!date) {
      setError('Date is required')
      return
    }
    
    if (!userId) {
      setError('User not available')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // DEBUGGING: Log what we're about to send
      console.log('Saving diary entry with userEmail:', userEmail, 'date:', date);
      
      const diaryData = {
        title: title.trim(),
        content: content.trim(),
        mood: mood || null
      }
      
      let response
      if (entry && entry.id) {
        // Update existing entry
        console.log('Updating entry:', entry.id)
        response = await axios.put(`/api/diary/entry/${entry.id}`, {
          ...diaryData,
          user_id: userEmail  // Use email for backend compatibility
        })
      } else {
        // Create new entry - use email instead of userId
        console.log('Creating entry with email:', userEmail)
        response = await axios.post(`/api/diary/entry/${userEmail}/${date}`, diaryData)
      }
      
      // Notify parent component of successful save
      if (onSave) {
        onSave(response.data)
      }
      
      // Close modal
      onClose()
    } catch (err) {
      console.error('Error saving diary entry:', err)
      
      // Enhanced error handling
      let errorMessage = 'Failed to save diary entry'
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 404) {
          errorMessage = `API endpoint not found: ${err.response.config?.method?.toUpperCase()} ${err.response.config?.url}`
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
          <h2 className="text-2xl font-bold text-white">
            {entry ? 'Edit Diary Entry' : 'Create Diary Entry'}
          </h2>
          <p className="text-green-100">
            {date ? new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Select a date'}
          </p>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-grow overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter a title for your diary entry"
              />
            </div>
            
            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How are you feeling today?
              </label>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    className={`flex items-center px-3 py-2 rounded-full text-sm ${
                      mood === option.value
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1 text-lg">{option.value}</span>
                    {option.label}
                  </button>
                ))}
                {mood && (
                  <button
                    type="button"
                    onClick={() => setMood('')}
                    className="px-3 py-2 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Your thoughts *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Write your thoughts, feelings, or anything you'd like to remember..."
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Entry'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DiaryEntryModal
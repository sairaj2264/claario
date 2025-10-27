import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import StreakVisualization from '../components/StreakVisualization'
import DailyQuote from '../components/DailyQuote'
import DiaryEntryModal from '../components/DiaryEntryModal'

const CalendarPage = ({ user }) => {
  // Check if user is valid
  if (!user || !user.id) {
  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-900 rounded-xl shadow-lg p-8 text-center border border-gray-700">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300 mb-6">User not available. Please log in again.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}
  
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)

  // Fetch calendar data when the component mounts or when the month changes
  useEffect(() => {
    if (user && user.id) {
      fetchCalendarData()
    }
  }, [currentDate, user])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is valid before making the request
      if (!user || !user.id || !user.email) {
        throw new Error('User not available');
      }
      
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1 // JavaScript months are 0-indexed
      
      // DEBUGGING: Log the API call we're about to make
      console.log('Fetching calendar data for:', {
        userEmail: user.email,
        year,
        month,
        userId: user.id
      })
      
      // Call the calendar API
      const response = await axios.get(`/api/calendar/view/${user.email}/${year}/${month}`)
      console.log('Calendar API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        dataType: typeof response.data,
        isHTML: typeof response.data === 'string' && response.data.startsWith('<')
      })
      
      // Validate response is JSON
      if (typeof response.data === 'string' && response.data.startsWith('<')) {
        throw new Error(`Received HTML instead of JSON. Status: ${response.status}. This indicates the API endpoint may not exist or server is misconfigured.`)
      }
      
      setCalendarData(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      
      // Enhanced error handling
      let errorMessage = 'Failed to load calendar data'
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = `Calendar API not found: ${err.response.config?.method?.toUpperCase()} ${err.response.config?.url}`
        } else if (err.response.status >= 500) {
          errorMessage = 'Calendar service error. Please check backend server.'
        } else {
          errorMessage = `Calendar API error: ${err.response.status}`
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to calendar service. Is the backend running?'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  // Handle opening the modal for creating a new entry
  const handleCreateEntry = (date) => {
    setSelectedDate(date)
    setSelectedEntry(null)
    setIsModalOpen(true)
  }
  
  // Handle opening the modal for editing an existing entry
  const handleEditEntry = (date, entry) => {
    setSelectedDate(date)
    setSelectedEntry(entry)
    setIsModalOpen(true)
  }
  
  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
    setSelectedEntry(null)
  }
  
  // Handle saving an entry (refreshes calendar data)
  const handleSaveEntry = () => {
    fetchCalendarData()
    handleCloseModal()
  }

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Render calendar header
  const renderHeader = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={goToPreviousMonth}
        className="p-2 rounded-lg bg-gray-800 text-green-400 hover:bg-gray-700 transition-colors border border-gray-600"
      >
        {'<'} Prev
      </button>
      
      <h2 className="text-2xl font-bold text-green-400">
        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </h2>
      
      <div className="flex space-x-2">
        <button
          onClick={goToToday}
          className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-600 transition-colors"
        >
          Today
        </button>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg bg-gray-800 text-green-400 hover:bg-gray-700 transition-colors border border-gray-600"
        >
          Next {'>'}
        </button>
      </div>
    </div>
  )
  }

  // Render day names
  const renderDayNames = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {days.map(day => (
        <div key={day} className="text-center font-medium text-green-500 py-2">
          {day}
        </div>
      ))}
    </div>
  )
  }

  // Render calendar days
  const renderCalendarDays = () => {
    if (!calendarData) return null
    
    // Enhanced safety check for diary_entries structure
    if (!calendarData.diary_entries) {
      console.warn('Calendar data missing diary_entries field:', {
        calendarDataKeys: Object.keys(calendarData || {}),
        calendarDataType: typeof calendarData,
        diaryEntriesType: typeof calendarData?.diary_entries
      });
      
      // Show error state but still render empty calendar
      return (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          Calendar data structure invalid. Please refresh the page.
        </div>
      );
    }
    
    if (typeof calendarData.diary_entries !== 'object') {
      console.warn('Invalid diary_entries structure:', {
        diary_entries: calendarData.diary_entries,
        diary_entries_type: typeof calendarData.diary_entries,
        calendarData: calendarData
      });
      
      // Still render the calendar but show warning
      return (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg">
          Warning: Diary entries data structure is invalid.
        </div>
      );
    }

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDateObj = new Date(startDate)
    
    for (let i = 0; i < 42; i++) { // 6 weeks
      const dateStr = currentDateObj.toISOString().split('T')[0]
      const isCurrentMonth = currentDateObj.getMonth() === month
      // More robust safety check
      const diaryEntry = calendarData.diary_entries && typeof calendarData.diary_entries === 'object' && calendarData.diary_entries !== null
        ? calendarData.diary_entries[dateStr] || null
        : null
      
      days.push(
        <div
          key={dateStr}
          onClick={() => {
            // Only allow creating/editing for today and past 2 days
            const today = new Date()
            const dateToCheck = new Date(currentDateObj)
            const diffTime = today - dateToCheck
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
            
            if (diffDays >= 0 && diffDays <= 2) {
              if (diaryEntry) {
                handleEditEntry(dateStr, diaryEntry)
              } else {
                handleCreateEntry(dateStr)
              }
            }
          }}
          className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          isCurrentMonth
            ? 'bg-gray-800 border-gray-700 text-green-300'
            : 'bg-gray-900 border-gray-800 text-gray-500'
        } ${
          // Highlight today
          dateStr === new Date().toISOString().split('T')[0]
            ? 'ring-2 ring-green-500'
            : ''
        } hover:bg-gray-700`}
        >
          <div className="font-medium">
            {currentDateObj.getDate()}
          </div>
          {diaryEntry && (
            <div className="mt-1 text-xs truncate">
              <span className="inline-block w-3 mr-1">{diaryEntry.mood}</span>
              {diaryEntry.title}
            </div>
          )}
        </div>
      )
      
      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    )
  }

  // Render streak visualization
  const renderStreakVisualization = () => {
    if (!calendarData) return null
    
    return (
      <StreakVisualization
        streakData={calendarData.streak_data || []}
        currentStreak={calendarData.streak || 0}
      />
    )
  }

  // Render daily quote
  const renderDailyQuote = () => {
    if (!calendarData) return null
    
    return (
      <DailyQuote
        userId={user.id}
        initialQuote={calendarData.quote || null}
      />
    )
  }

  if (loading) {
  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-4 text-green-400">Loading your calendar...</p>
        </div>
      </div>
    </div>
  )
}

  if (error) {
  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-900 rounded-xl shadow-lg p-8 text-center border border-gray-700">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchCalendarData}
            className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

  return (
  <div className="min-h-screen bg-black py-12">
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-400">Mental Health Calendar</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-green-800 text-green-200 rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Calendar Section */}
      <div className="bg-gray-900 rounded-2xl shadow-xl p-6 mb-8">
        {renderHeader()}
        {renderDayNames()}
        {renderCalendarDays()}
      </div>

      {/* Quote Section - Full Width Rectangle */}
      <div className="mb-8">
        {renderDailyQuote()}
      </div>

      {/* Streak Visualization - Moved to Bottom */}
      <div className="mb-8">
        {renderStreakVisualization()}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 text-center">
        <button
          onClick={() => handleCreateEntry(new Date().toISOString().split('T')[0])}
          className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg"
        >
          Add Today's Diary Entry
        </button>
      </div>
    </div>
      
      {/* Diary Entry Modal */}
      <DiaryEntryModal
        userId={user.id}
        userEmail={user.email}
        date={selectedDate}
        entry={selectedEntry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEntry}
      />
    </div>
  )
}

export default CalendarPage
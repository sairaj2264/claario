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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">User not available. Please log in again.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      // Check if user is valid before making the request
      if (!user || !user.id) {
        throw new Error('User not available');
      }
      
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1 // JavaScript months are 0-indexed
      
      // Replace with your actual backend URL
      const response = await axios.get(`/api/calendar/view/${user.id}/${year}/${month}`)
      console.log('Calendar data received:', response.data); // Debug log
      setCalendarData(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      setError('Failed to load calendar data')
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
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {'<'} Prev
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={goToToday}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
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
          <div key={day} className="text-center font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
    )
  }

  // Render calendar days
  const renderCalendarDays = () => {
    if (!calendarData) return null
    
    // Additional safety check for diary_entries
    if (!calendarData.diary_entries || typeof calendarData.diary_entries !== 'object') {
      console.warn('Invalid diary_entries structure:', calendarData.diary_entries);
      return (
        <div className="grid grid-cols-7 gap-1">
          {Array(42).fill(0).map((_, i) => (
            <div key={i} className="min-h-24 p-2 border rounded-lg bg-gray-50 border-gray-100 text-gray-400">
              <div className="font-medium">&nbsp;</div>
            </div>
          ))}
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
              ? 'bg-white border-gray-200'
              : 'bg-gray-50 border-gray-100 text-gray-400'
          } ${
            // Highlight today
            dateStr === new Date().toISOString().split('T')[0]
              ? 'ring-2 ring-green-500'
              : ''
          }`}
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading your calendar...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button 
              onClick={fetchCalendarData}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mental Health Calendar</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Stats and Quote Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {renderStreakVisualization()}
          </div>
          <div className="lg:col-span-1">
            {renderDailyQuote()}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {renderHeader()}
          {renderDayNames()}
          {renderCalendarDays()}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => handleCreateEntry(new Date().toISOString().split('T')[0])}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg"
          >
            Add Today's Diary Entry
          </button>
        </div>
      </div>
      
      {/* Diary Entry Modal */}
      <DiaryEntryModal
        userId={user.id}
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
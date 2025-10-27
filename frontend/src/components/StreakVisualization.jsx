import React from 'react'

const StreakVisualization = ({ streakData, currentStreak }) => {
  // Function to determine the color intensity based on activity
  const getActivityColor = (completed) => {
    if (!completed) return 'bg-gray-200'
    // For now, we'll use a single green color for completed days
    // In a more advanced version, we could have different shades based on activity level
    return 'bg-green-500'
  }

  // Group streak data into weeks (7 days each)
  const groupIntoWeeks = (data) => {
    if (!data || !Array.isArray(data)) return []
    const weeks = []
    for (let i = 0; i < data.length; i += 7) {
      weeks.push(data.slice(i, i + 7))
    }
    return weeks
  }

  // Group the streak data into weeks
  const weeks = streakData && Array.isArray(streakData) ? groupIntoWeeks(streakData) : []

  return (
  <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-700">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-green-400">Your Activity Streak</h3>
      <div className="text-2xl font-bold text-green-500">
        {currentStreak || 0} days
      </div>
    </div>
    
    <p className="text-gray-400 mb-4">
      Keep going! Consistency helps build healthy habits.
    </p>
    
    {/* GitHub-style grid */}
    <div className="flex flex-col items-start">
      {/* Day labels */}
      <div className="flex mb-1" style={{ marginLeft: '1.5rem' }}>
        <div className="text-xs text-gray-500 w-4 mr-1"></div>
        {['Mon', 'Wed', 'Fri'].map((day, index) => (
          <div key={day} className="text-xs text-gray-500 w-4 mx-0.5">
            {day}
          </div>
        ))}
      </div>
      
      {/* Weeks grid */}
      <div className="flex space-x-1">
        {weeks && weeks.map ? weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col space-y-1">
            {week && week.map ? week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`w-4 h-4 rounded-sm ${getActivityColor(day?.completed)} ${
                  day?.completed ? 'hover:opacity-75' : ''
                }`}
                title={`${day?.date}: ${day?.completed ? 'Completed' : 'Not completed'}`}
              ></div>
            )) : null}
          </div>
        )) : null}
      </div>
      
      {/* Month labels */}
      <div className="flex mt-2 space-x-1">
        <div className="text-xs text-gray-500 w-4"></div>
        {weeks && Array.isArray(weeks) ? Array.from({ length: Math.ceil(weeks.length / 4) }).map((_, index) => (
          <div key={index} className="text-xs text-gray-500 w-8 text-center">
            {index % 2 === 0 ? 'M' : ''}
          </div>
        )) : null}
      </div>
    </div>
    
    {/* Legend */}
    <div className="flex items-center mt-4 text-sm text-gray-400">
      <span className="mr-2">Less</span>
      <div className="w-3 h-3 bg-gray-700 rounded-sm mx-1"></div>
      <div className="w-3 h-3 bg-green-700 rounded-sm mx-1"></div>
      <div className="w-3 h-3 bg-green-500 rounded-sm mx-1"></div>
      <span className="ml-2">More</span>
    </div>
  </div>
)
}

export default StreakVisualization
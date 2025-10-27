import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DailyQuote = ({ userId, initialQuote }) => {
  const [quote, setQuote] = useState(initialQuote)
  const [loading, setLoading] = useState(false)

  // Function to fetch a new quote
  const fetchNewQuote = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      // In a more advanced implementation, we could pass excluded quote IDs
      // to avoid repetition
      const response = await axios.get(`/api/calendar/quote/${userId}`)
      setQuote(response.data)
    } catch (err) {
      console.error('Error fetching quote:', err)
    } finally {
      setLoading(false)
    }
  }

  // If we don't have an initial quote, fetch one
  useEffect(() => {
    if (!quote && userId) {
      fetchNewQuote()
    }
  }, [userId, quote])

  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md p-6 text-white h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold">Daily Inspiration</h3>
        <button 
          onClick={fetchNewQuote}
          disabled={loading}
          className="text-sm bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all disabled:opacity-50"
          title="Get new quote"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>
      
      {quote && quote.text ? (
        <>
          <p className="text-lg italic mb-2">"{quote.text}"</p>
          {quote.author && (
            <p className="text-right text-purple-200">— {quote.author}</p>
          )}
        </>
      ) : (
        <p className="text-center py-4">
          {loading ? 'Loading quote...' : 'No quote available'}
        </p>
      )}
    </div>
  )
}

export default DailyQuote
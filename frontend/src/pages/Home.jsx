import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Mental Health Support
              </h1>
              <p className="text-lg text-gray-600">
                Your wellness journey starts here
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white rounded-lg py-2 px-6 hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Choose Your Support Path
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <button
                    onClick={() => alert('Please login to access this feature')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg opacity-70"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">💬</div>
                      <h3 className="text-xl font-semibold mb-2">Anonymous Chatting</h3>
                      <p className="text-purple-100">
                        Connect with others safely and anonymously
                      </p>
                    </div>
                  </button>
                </div>

                <div className="group">
                  <button
                    onClick={() => alert('Please login to access this feature')}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg opacity-70"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">📅</div>
                      <h3 className="text-xl font-semibold mb-2">Calendar/Diary</h3>
                      <p className="text-green-100">
                        Track your mood and mental health journey
                      </p>
                    </div>
                  </button>
                </div>

                <div className="group md:col-span-2">
                  <button
                    onClick={() => alert('Please login to access this feature')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg opacity-70"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">🧠</div>
                      <h3 className="text-xl font-semibold mb-2">Mental Therapy Request</h3>
                      <p className="text-blue-100">
                        Request professional mental health therapy sessions
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Quick WhatsApp Support
              </h3>
              
              <div className="bg-gray-100 rounded-xl p-8 mb-6">
                <div className="aspect-square bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-sm font-medium">QR Code</p>
                    <p className="text-xs">Scan to connect</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-4">
                  Scan the QR code above to connect with our mental health support team via WhatsApp
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-green-600 text-2xl mr-2">📲</span>
                    <span className="text-green-800 font-medium">WhatsApp Support</span>
                  </div>
                  <p className="text-green-700 text-xs">
                    Available 24/7 for immediate assistance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">
            Remember: You are not alone. Seeking help is a sign of strength.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            If you're in crisis, please contact emergency services or a crisis hotline immediately.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
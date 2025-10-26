import React from 'react'

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Mental Health Support
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back, {user?.user_metadata?.full_name || user?.email || 'User'}!
              </p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white rounded-lg py-2 px-4 hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Navigation Buttons */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Choose Your Support Path
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Anonymous Chatting */}
                <div className="group">
                  <button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg"
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

                {/* Calendar/Diary */}
                <div className="group">
                  <button
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg"
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

                {/* Mental Therapy Request */}
                <div className="group md:col-span-2">
                  <button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg"
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

          {/* Right Side - User Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Your Profile
              </h3>
              
              <div className="flex flex-col items-center mb-6">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-2xl mb-4">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <h4 className="text-lg font-medium text-gray-900">
                  {user?.user_metadata?.full_name || 'User'}
                </h4>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-1">Account Status</h5>
                  <p className="text-blue-700 text-sm">Verified</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-1">Member Since</h5>
                  <p className="text-green-700 text-sm">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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

export default Dashboard
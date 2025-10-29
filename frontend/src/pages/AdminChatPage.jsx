import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminChatPage = () => {
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    
    fetchFlaggedUsers();
    fetchBannedUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const fetchFlaggedUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/admin/flagged-users');
      const data = await response.json();
      
      if (data.success) {
        setFlaggedUsers(data.flagged_users);
      } else {
        setError(data.error || 'Failed to fetch flagged users');
      }
    } catch (err) {
      setError('Error fetching flagged users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBannedUsers = async () => {
    try {
      const response = await fetch('/api/chat/admin/banned-users');
      const data = await response.json();
      
      if (data.success) {
        setBannedUsers(data.banned_users);
      } else {
        setError(data.error || 'Failed to fetch banned users');
      }
    } catch (err) {
      setError('Error fetching banned users: ' + err.message);
    }
  };

  const unbanUser = async (userSessionId) => {
    try {
      const response = await fetch('/api/chat/admin/unban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_session_id: userSessionId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh banned users list
        fetchBannedUsers();
        // Refresh flagged users list
        fetchFlaggedUsers();
      } else {
        setError(data.error || 'Failed to unban user');
      }
    } catch (err) {
      setError('Error unbanning user: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Loading Chat Administration</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 mt-8">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
            >
              Retry
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
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Chat Administration</h1>
              <p className="text-gray-400">Monitor flagged users and manage bans</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Flagged Users</h2>
            <p className="text-3xl font-bold text-yellow-400">{flaggedUsers.length}</p>
            <p className="text-gray-400">Users with violations</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Banned Users</h2>
            <p className="text-3xl font-bold text-red-400">{bannedUsers.length}</p>
            <p className="text-gray-400">Permanently restricted</p>
          </div>
        </div>

        {/* Flagged Users */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Flagged Users</h2>
          {flaggedUsers.length === 0 ? (
            <p className="text-gray-400">No flagged users at this time.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">User Session ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Flags</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Last Flagged</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {flaggedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 text-sm font-mono">{user.user_session_id.substring(0, 8)}...</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.flag_count >= 3
                            ? 'bg-red-900 text-red-100'
                            : user.flag_count >= 2
                            ? 'bg-yellow-900 text-yellow-100'
                            : 'bg-orange-900 text-orange-100'
                        }`}>
                          {user.flag_count} flag{user.flag_count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {user.last_flagged_at
                          ? new Date(user.last_flagged_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.is_banned ? (
                          <span className="px-2 py-1 bg-red-900 text-red-100 rounded-full text-xs">Banned</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-900 text-green-100 rounded-full text-xs">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Banned Users */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Banned Users</h2>
          {bannedUsers.length === 0 ? (
            <p className="text-gray-400">No banned users at this time.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">User Session ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Banned On</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {bannedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 text-sm font-mono">{user.user_session_id.substring(0, 8)}...</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {user.banned_at
                          ? new Date(user.banned_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">{user.reason || 'Policy violation'}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => unbanUser(user.user_session_id)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition"
                        >
                          Unban
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
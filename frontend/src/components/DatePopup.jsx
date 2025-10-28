import React from 'react';

const DatePopup = ({ date, entry, isOpen, onAdd, onEdit, onClose, canEdit }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
          <h2 className="text-2xl font-bold text-white">
            {entry ? 'Diary Entry' : 'No Entry'}
          </h2>
          <p className="text-green-100">
            {formatDate(date)}
          </p>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-grow overflow-y-auto">
          {entry ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{entry.title}</h3>
                {entry.mood && (
                  <p className="text-2xl mt-2">{entry.mood}</p>
                )}
              </div>
              <div>
                <p className="text-gray-600 whitespace-pre-wrap">{entry.content}</p>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Created: {new Date(entry.created_at).toLocaleString()}
                {entry.updated_at && (
                  <span className="block">Last edited: {new Date(entry.updated_at).toLocaleString()}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-gray-600">No diary entry for this date</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          
          {canEdit && (
            <>
              {!entry && (
                <button
                  type="button"
                  onClick={onAdd}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Entry
                </button>
              )}
              {entry && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Entry
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatePopup;
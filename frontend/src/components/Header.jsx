import React from 'react'

const Header = ({ title, subtitle }) => {
  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}

export default Header
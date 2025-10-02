import React from 'react'

const Logo = ({ size = 'medium', showText = true, className = '' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 text-xs',
    medium: 'w-8 h-8 text-sm',
    large: 'w-12 h-12 text-lg',
    xlarge: 'w-16 h-16 text-xl'
  }

  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0`}
        style={{ backgroundColor: '#6743a5' }}
      >
        DC
      </div>
      {showText && (
        <span 
          className={`font-bold ${textSizeClasses[size]} whitespace-nowrap`}
          style={{ color: '#6743a5' }}
        >
          Dashboard
        </span>
      )}
    </div>
  )
}

export default Logo

import React from 'react'

const SidebarOverlay = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      onClick={onClose}
    />
  )
}

export default SidebarOverlay

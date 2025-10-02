import React from 'react'
import { ChevronRight, X } from 'lucide-react'
import Logo from '../ui/Logo'

const SidebarHeader = ({
    isSidebarCollapsed,
    toggleSidebarCollapse,
    toggleSidebar
}) => {
    return (
        <div className={`border-b border-purple-100 flex-shrink-0 min-h-[80px] transition-all duration-300 relative ${isSidebarCollapsed ? 'md:flex md:justify-center md:items-center p-4' : 'flex items-center justify-between p-6'
            }`}>
            {/* Logo y título */}
            <div className={`flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-2'
                }`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: '#6743a5' }}>
                    DC
                </div>
                <span className={`font-bold text-xl transition-all duration-300 ease-in-out overflow-hidden ${
                    isSidebarCollapsed 
                        ? 'md:opacity-0 md:w-0 md:max-w-0 md:whitespace-nowrap' 
                        : 'opacity-100 whitespace-nowrap max-w-full'
                }`} style={{ color: '#6743a5' }}>
                    Dashboard
                </span>
            </div>

            {/* Botones de control */}
            <div className={`flex items-center space-x-1 transition-all duration-300 ease-in-out overflow-hidden ${
                isSidebarCollapsed 
                    ? 'md:opacity-0 md:w-0 md:max-w-0 md:pointer-events-none' 
                    : 'opacity-100 w-auto max-w-full'
            }`}>
                <button
                    onClick={toggleSidebarCollapse}
                    className="hidden md:block p-1 rounded-lg hover:bg-purple-100 transition-all duration-200 flex-shrink-0"
                >
                    <ChevronRight className="w-4 h-4" style={{ color: '#6743a5' }} />
                </button>
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-1 rounded-lg hover:bg-purple-100 transition-colors flex-shrink-0"
                >
                    <X className="w-5 h-5" style={{ color: '#6743a5' }} />
                </button>
            </div>

            {/* Botón de expandir cuando está colapsado - posicionado de forma absoluta */}
            {isSidebarCollapsed && (
                <button
                    onClick={toggleSidebarCollapse}
                    className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-purple-200 rounded-full shadow-md hover:shadow-lg hover:bg-purple-50 transition-all duration-300 z-10 items-center justify-center"
                    title="Expandir sidebar"
                >
                    <ChevronRight className="w-3 h-3" style={{ color: '#6743a5' }} />
                </button>
            )}
        </div>
    )
}

export default SidebarHeader

import React from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const SidebarUser = ({ user, isSidebarCollapsed }) => {
    const navigate = useNavigate()
    const { logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="p-2 border-t border-purple-100 flex-shrink-0">
            <div className={`bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 transition-all duration-300 ${isSidebarCollapsed ? 'md:p-2 md:flex md:flex-col md:items-center md:space-y-2' : 'p-4'
                }`}>
                {/* Avatar y info del usuario */}
                <div className={`flex items-center transition-all duration-300 ${isSidebarCollapsed
                        ? 'md:flex-col md:space-y-1 md:space-x-0 mb-2'
                        : 'space-x-3 mb-3'
                    }`}>
                    <div
                        className={`rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
                            }`}
                        style={{ backgroundColor: '#6743a5' }}
                    >
                        {user.avatar}
                    </div>
                    <div className={`min-w-0 transition-all duration-300 ease-in-out overflow-hidden ${
                        isSidebarCollapsed 
                            ? 'md:opacity-0 md:w-0 md:max-w-0' 
                            : 'opacity-100 flex-1 max-w-full'
                    }`}>
                        <p className="font-semibold text-sm truncate" style={{ color: '#6743a5' }}>
                            {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* Botón de logout */}
                <button
                    onClick={handleLogout}
                    className={`w-full bg-white border border-purple-200 rounded-lg font-medium transition-all duration-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600 group relative overflow-hidden ${
                        isSidebarCollapsed
                            ? 'md:p-2 md:flex md:justify-center md:items-center'
                            : 'flex items-center justify-center py-2.5 px-3 space-x-2 text-sm'
                    }`}
                    title={isSidebarCollapsed ? 'Cerrar Sesión' : ''}
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span className={`transition-all duration-300 overflow-hidden ${
                        isSidebarCollapsed 
                            ? 'md:opacity-0 md:w-0 md:whitespace-nowrap' 
                            : 'opacity-100 whitespace-nowrap'
                    }`}>
                        Cerrar Sesión
                    </span>

                    {/* Tooltip para sidebar colapsado */}
                    {isSidebarCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            Cerrar Sesión
                        </div>
                    )}
                </button>
            </div>
        </div>
    )
}

export default SidebarUser

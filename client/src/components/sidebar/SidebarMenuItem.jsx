import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const SidebarMenuItem = ({
    item,
    isSidebarCollapsed,
    expandedItems,
    toggleExpanded
}) => {
    const navigate = useNavigate()
    const location = useLocation()

    const Icon = item.icon
    const isActive = location.pathname === item.path
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedItems[item.id] && !isSidebarCollapsed

    const handleClick = (e) => {
        // Solo para elementos sin subitems
        if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            navigate(item.path)
        }
    }

    const handleSubItemClick = (e, subItem) => {
        // Si es click normal (izquierdo), navegamos programáticamente
        if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            navigate(subItem.path)
        }
        // Si es click con Ctrl/Cmd o click derecho, dejamos que el navegador maneje la apertura en nueva pestaña
    }

    return (
        <li>
            <div>
                {hasSubItems && !isSidebarCollapsed ? (
                    // Para elementos con subitems, usar button para expandir/contraer
                    <button
                        onClick={() => toggleExpanded(item.id)}
                        className={`
            w-full flex rounded-lg transition-all duration-300 ease-in-out group relative overflow-hidden
            ${isActive
                                ? 'text-white shadow-lg'
                                : 'text-gray-600 hover:bg-purple-50'
                            }
            items-start space-x-3 px-4 py-3 min-h-[48px]
          `}
                        style={{
                            backgroundColor: isActive ? '#6743a5' : 'transparent'
                        }}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="font-medium text-left transition-all duration-300 ease-in-out opacity-100 flex-1 leading-tight max-w-full whitespace-normal overflow-visible h-auto">
                            {item.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-all duration-300 ease-in-out flex-shrink-0 mt-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                ) : (
                    // Para elementos sin subitems o sidebar colapsado, usar enlace
                    <a
                        href={item.path}
                        onClick={handleClick}
                        className={`
            w-full flex rounded-lg transition-all duration-300 ease-in-out group relative overflow-hidden
            ${isActive
                                ? 'text-white shadow-lg'
                                : 'text-gray-600 hover:bg-purple-50'
                            }
            ${isSidebarCollapsed
                                ? 'justify-center md:px-2 py-3 items-center min-h-[48px]'
                                : 'items-start space-x-3 px-4 py-3 min-h-[48px]'
                            }
          `}
                        style={{
                            backgroundColor: isActive ? '#6743a5' : 'transparent'
                        }}
                        title={isSidebarCollapsed ? item.label : ''}
                    >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isSidebarCollapsed ? '' : 'mt-0.5'}`} />
                        <span className={`font-medium text-left transition-all duration-300 ease-in-out ${isSidebarCollapsed
                                ? 'md:opacity-0 md:w-0 md:max-w-0 md:h-0 md:overflow-hidden md:whitespace-nowrap md:leading-none'
                                : 'opacity-100 flex-1 leading-tight max-w-full whitespace-normal overflow-visible h-auto'
                            }`}>
                            {item.label}
                        </span>
                        {isActive && !isSidebarCollapsed && (
                            <ChevronRight className="w-4 h-4 flex-shrink-0 transition-all duration-300 ease-in-out mt-0.5" />
                        )}

                        {/* Tooltip para sidebar colapsado */}
                        {isSidebarCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        )}
                    </a>
                )}

                {/* Sub items */}
                {hasSubItems && isExpanded && !isSidebarCollapsed && (
                    <ul className="mt-1 space-y-1 pl-4">
                        {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon
                            const isSubActive = location.pathname === subItem.path

                            return (
                                <li key={subItem.id}>
                                    <a
                                        href={subItem.path}
                                        onClick={(e) => handleSubItemClick(e, subItem)}
                                        className={`
                      w-full flex items-start space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                      ${isSubActive
                                                ? 'text-white shadow-md'
                                                : 'text-gray-500 hover:bg-purple-50 hover:text-gray-700'
                                            }
                    `}
                                        style={{
                                            backgroundColor: isSubActive ? '#8d71bb' : 'transparent'
                                        }}
                                    >
                                        <SubIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span className="font-medium flex-1 text-left leading-tight">{subItem.label}</span>
                                    </a>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </li>
    )
}

export default SidebarMenuItem

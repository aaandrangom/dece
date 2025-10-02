import { menuItems } from '../../constants/menuItems'
import { useAuth } from '../../hooks/useAuth'
import SidebarHeader from './SidebarHeader'
import SidebarMenuItem from './SidebarMenuItem'
import SidebarUser from './SidebarUser'

const Sidebar = ({
    isSidebarOpen,
    isSidebarCollapsed,
    expandedItems,
    toggleSidebar,
    toggleSidebarCollapse,
    toggleExpanded
}) => {
    const { getUser } = useAuth()
    const user = getUser()

    return (
        <div className={`
      fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 border-r border-purple-100 flex flex-col
      ${isSidebarCollapsed ? 'md:w-16' : 'md:w-64'} w-64
    `}>
            <SidebarHeader
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebarCollapse={toggleSidebarCollapse}
                toggleSidebar={toggleSidebar}
            />

            {/* Menu items */}
            <nav className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <SidebarMenuItem
                            key={item.id}
                            item={item}
                            isSidebarCollapsed={isSidebarCollapsed}
                            expandedItems={expandedItems}
                            toggleExpanded={toggleExpanded}
                        />
                    ))}
                </ul>
            </nav>

            <SidebarUser
                user={user || { avatar: 'U', name: 'Usuario', email: '' }} 
                isSidebarCollapsed={isSidebarCollapsed}
            />
        </div>
    )
}

export default Sidebar

import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import Header from '../header/Header'
import SidebarOverlay from '../ui/SidebarOverlay'
import { useSidebar } from '../../hooks/useSidebar'

const MainLayout = () => {
    const {
        isSidebarOpen,
        isSidebarCollapsed,
        expandedItems,
        toggleSidebar,
        toggleSidebarCollapse,
        toggleExpanded,
        closeSidebar
    } = useSidebar()

    return (
        <div className="min-h-screen bg-white">
            <SidebarOverlay isOpen={isSidebarOpen} onClose={closeSidebar} />

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSidebarCollapsed={isSidebarCollapsed}
                expandedItems={expandedItems}
                toggleSidebar={toggleSidebar}
                toggleSidebarCollapse={toggleSidebarCollapse}
                toggleExpanded={toggleExpanded}
            />

            <div className={`min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
                }`}>
                <Header toggleSidebar={toggleSidebar} />

                <main className="p-4 lg:p-6 ">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default MainLayout

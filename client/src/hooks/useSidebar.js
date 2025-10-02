import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const useSidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [expandedItems, setExpandedItems] = useState({})
    const location = useLocation()

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed)
        if (!isSidebarCollapsed) {
            setExpandedItems({})
        }
    }

    const toggleExpanded = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }))
    }

    const closeSidebar = () => {
        setIsSidebarOpen(false)
    }

    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false)
        }
    }, [location.pathname])

    return {
        isSidebarOpen,
        isSidebarCollapsed,
        expandedItems,
        toggleSidebar,
        toggleSidebarCollapse,
        toggleExpanded,
        closeSidebar
    }
}

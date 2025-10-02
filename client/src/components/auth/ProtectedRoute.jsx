import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth()
    const location = useLocation()

    if (!isAuthenticated()) {
        // Redirigir a login y guardar la ubicación a la que intentaba acceder
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

export default ProtectedRoute

import { useState } from 'react'

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const login = async (email, password) => {
        setIsLoading(true)
        setError('')

        try {
            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Validación básica de demo
            if (email === 'admin@dashboard.com' && password === '123456') {
                // Guardar token de ejemplo
                localStorage.setItem('authToken', 'demo-token-12345')
                localStorage.setItem('user', JSON.stringify({
                    name: 'Juan Pérez',
                    email: 'admin@dashboard.com',
                    avatar: 'JP'
                }))
                return { success: true }
            } else {
                throw new Error('Credenciales incorrectas')
            }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
    }

    const isAuthenticated = () => {
        return !!localStorage.getItem('authToken')
    }

    const getUser = () => {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    }

    return {
        login,
        logout,
        isAuthenticated,
        getUser,
        isLoading,
        error,
        setError
    }
}

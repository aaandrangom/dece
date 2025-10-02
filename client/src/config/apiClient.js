import axios from 'axios';
import { API_ROUTES } from './apiRoutes';

const apiClient = axios.create({
    baseURL: API_ROUTES.BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

/*
apiClient.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`)
        return response
    },
    (error) => {
        console.error('Response error:', error)

        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    localStorage.removeItem('auth_token')
                    window.location.href = '/login'
                    break
                case 403:
                    console.error('Acceso denegado')
                    break
                case 404:
                    console.error('Recurso no encontrado')
                    break
                case 500:
                    console.error('Error interno del servidor')
                    break
                default:
                    console.error(`Error ${status}:`, data?.message || 'Error desconocido')
            }
        } else if (error.request) {
            console.error('Error de red:', error.message)
        } else {
            console.error('Error de configuración:', error.message)
        }

        return Promise.reject(error)
    }
) */

export default apiClient

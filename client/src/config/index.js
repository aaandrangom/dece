// Configuraciones centralizadas
export { default as apiClient } from './apiClient'
export { API_ROUTES } from './apiRoutes'

// Configuraciones generales de la aplicación
export const APP_CONFIG = {
    // Configuración de la institución
    INSTITUTION_ID: 1,
    
    // Configuración de paginación
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
    
    // Configuración de la API
    API_TIMEOUT: 10000,
    
    // Configuración de autenticación
    TOKEN_STORAGE_KEY: 'auth_token',
    
    // Configuración de la aplicación
    APP_NAME: 'Sistema Educativo DECE',
    APP_VERSION: '1.0.0',
}

export default {
    APP_CONFIG,
    API_ROUTES: () => import('./apiRoutes').then(m => m.API_ROUTES),
    apiClient: () => import('./apiClient').then(m => m.default),
}

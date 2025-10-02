import apiClient from '../../config/apiClient'
import { API_ROUTES } from '../../config/apiRoutes';
import HandleApiError from '../../helpers/errorHandler'

export const ClassroomService = {
    // Obtener grados disponibles
    getGrades: async () => {
        try {
            const response = await apiClient.get('/classrooms/grades');
            return response.data;
        } catch (error) {
            // Re-lanzar el error con estructura amigable
            const errorMessage = error?.response?.data?.error || 'Error al cargar los grados disponibles';
            const newError = new Error(errorMessage);
            newError.response = error.response;
            throw newError;
        }
    },

    // Obtener paralelos disponibles
    getParallels: async () => {
        try {
            const response = await apiClient.get('/classrooms/parallels');
            return response.data;
        } catch (error) {
            // Re-lanzar el error con estructura amigable
            const errorMessage = error?.response?.data?.error || 'Error al cargar los paralelos disponibles';
            const newError = new Error(errorMessage);
            newError.response = error.response;
            throw newError;
        }
    },

    // Obtener todas las aulas por institución con paginación
    getClassroomsByInstitution: async ({ page = 1, limit = 10, institutionId = 1 } = {}) => {
        try {
            const response = await apiClient.get(API_ROUTES.CLASSROOMS.BY_INSTITUTION, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 ||
                error.response?.data?.code === 'NOT_FOUND') {
                return {
                    success: true,
                    data: {
                        classrooms: [],
                        pagination: {
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: 0,
                            itemsPerPage: limit,
                            hasNextPage: false,
                            hasPreviousPage: false
                        }
                    },
                    message: error.response?.data?.error || 'No classrooms found'
                };
            }
            HandleApiError(error, 'getClassroomsByInstitution')
        }
    },

    // Buscar aulas
    searchClassrooms: async ({ q, page = 1, limit = 10, institutionId = 1 } = {}) => {
        try {
            const response = await apiClient.get(API_ROUTES.CLASSROOMS.SEARCH_CLASSROOMS, {
                params: { q, page, limit }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 ||
                error.response?.data?.code === 'NOT_FOUND') {
                return {
                    success: true,
                    data: {
                        classrooms: [],
                        pagination: {
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: 0,
                            itemsPerPage: limit,
                            hasNextPage: false,
                            hasPreviousPage: false
                        }
                    },
                    message: error.response?.data?.error || 'No classrooms found matching the search criteria'
                };
            }
            HandleApiError(error, 'searchClassrooms')
        }
    },

    // Crear una nueva aula
    createClassroom: async (classroomData) => {
        try {
            const response = await apiClient.post('/classrooms/', classroomData);
            return response.data;
        } catch (error) {
            HandleApiError(error, 'createClassroom')
        }
    },

    // Obtener detalles de una aula
    getClassroomDetails: async (classroomId) => {
        try {
            const response = await apiClient.get(`/classrooms/${classroomId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.error || 'Error al obtener los detalles del aula';
            const newError = new Error(errorMessage);
            newError.response = error.response;
            throw newError;
        }
    },

    // Actualizar una aula
    updateClassroom: async (classroomId, classroomData) => {
        try {
            const response = await apiClient.put(`/classrooms/${classroomId}`, classroomData);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.error || 'Error al actualizar el aula';
            const newError = new Error(errorMessage);
            newError.response = error.response;
            throw newError;
        }
    },

    // Eliminar/Desactivar una aula (soft delete)
    deleteClassroom: async (classroomId) => {
        try {
            const response = await apiClient.put(`/classrooms/${classroomId}`, {
                active: 0
            });
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.error || 'Error al eliminar el aula';
            const newError = new Error(errorMessage);
            newError.response = error.response;
            throw newError;
        }
    }
};
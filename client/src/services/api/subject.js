import apiClient from '../../config/apiClient'
import { API_ROUTES } from '../../config/apiRoutes';
import HandleApiError from '../../helpers/errorHandler'

export const SubjectService = {
    // Crear una nueva materia
    createSubject: async (subjectData) => {
        try {
            const response = await apiClient.post(API_ROUTES.SUBJECTS.CREATE, subjectData);
            return response.data;
        } catch (error) {
            HandleApiError(error, 'createSubject')
        }
    },

    // Obtener todas las materias con paginación
    getSubjects: async ({ page = 1, limit = 10 } = {}) => {
        try {
            const response = await apiClient.get(API_ROUTES.SUBJECTS.LIST, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 ||
                error.response?.data?.code === 'NO_SUBJECTS') {
                return {
                    success: true,
                    data: {
                        subjects: [],
                        pagination: {
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: 0,
                            itemsPerPage: limit,
                            hasNextPage: false,
                            hasPreviousPage: false
                        }
                    },
                    message: error.response?.data?.error || 'No subjects found'
                };
            }
            HandleApiError(error, 'getSubjects')
        }
    },

    // Buscar materias
    searchSubjects: async ({ search, page = 1, limit = 10 } = {}) => {
        try {
            const response = await apiClient.get(API_ROUTES.SUBJECTS.SEARCH_SUBJECTS, {
                params: { search, page, limit }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 ||
                error.response?.data?.code === 'NOT_FOUND') {
                return {
                    success: true,
                    data: [],
                    message: error.response?.data?.error || 'No subjects found matching the search criteria'
                };
            }
            HandleApiError(error, 'searchSubjects')
        }
    },

    // Obtener detalles de una materia
    getSubjectDetails: async (subjectId) => {
        try {
            const response = await apiClient.get(API_ROUTES.SUBJECTS.GET_DETAILS(subjectId));
            return response.data;
        } catch (error) {
            HandleApiError(error, 'getSubjectDetails')
        }
    },

    // Actualizar una materia
    updateSubject: async (subjectData) => {
        try {
            const response = await apiClient.put(API_ROUTES.SUBJECTS.UPDATE, subjectData);
            return response.data;
        } catch (error) {
            HandleApiError(error, 'updateSubject')
        }
    },

    // Eliminar/Desactivar una materia
    deleteSubject: async (subjectId) => {
        try {
            const response = await apiClient.put(API_ROUTES.SUBJECTS.UPDATE, {
                subject_id: subjectId,
                active: 0
            });
            return response.data;
        } catch (error) {
            HandleApiError(error, 'deleteSubject')
        }
    }
};
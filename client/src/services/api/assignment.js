import apiClient from '../../config/apiClient';

// Obtener todas las aulas para asignaciones
export const getAssignmentClassrooms = async (params = {}) => {
    try {
        const response = await apiClient.get('/course-subjects/classrooms', { params });
        return response.data;
    } catch (error) {
        if (error?.response?.status === 404 && 
            (error?.response?.data?.code === 'NO_SUBJECTS')) {
            return {
                success: true,
                data: {
                    classrooms: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: params.limit || 10,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                },
                message: 'No hay aulas disponibles para asignaciones'
            };
        }
        
        console.error('Error fetching assignment classrooms:', error);
        throw error;
    }
};

// Obtener todas las materias disponibles
export const getAvailableSubjects = async () => {
    try {
        const response = await apiClient.get('/course-subjects/subjects');
        return response.data;
    } catch (error) {
        // Si no hay materias disponibles, retornar una respuesta vacía válida
        if (error?.response?.status === 400 && 
            (error?.response?.data?.code === 'NO_SUBJECTS_FOUND' || 
             error?.response?.data?.code === 'NO_SUBJECTS_AVAILABLE')) {
            return {
                success: true,
                data: [],
                message: 'No hay materias disponibles'
            };
        }
        
        console.error('Error fetching available subjects:', error);
        throw error;
    }
};

// Obtener materias asignadas a un aula específica
export const getClassroomSubjects = async (classroomId) => {
    try {
        const response = await apiClient.get(`/course-subjects/classroom/${classroomId}/subjects`);
        return response.data;
    } catch (error) {
        // Si no hay materias asignadas, retornar una respuesta vacía válida
        if (error?.response?.status === 400 && error?.response?.data?.code === 'NO_SUBJECTS_FOUND') {
            return {
                success: true,
                data: [],
                message: 'No hay materias asignadas a esta aula'
            };
        }
        
        console.error('Error fetching classroom subjects:', error);
        throw error;
    }
};

// Crear asignaciones de materias
export const createSubjectAssignments = async (assignments) => {
    try {
        const response = await apiClient.post('/course-subjects', assignments);
        return response.data;
    } catch (error) {
        console.error('Error creating subject assignments:', error);
        throw error;
    }
};

// Actualizar una asignación de materia
export const updateSubjectAssignment = async (assignmentId, data) => {
    try {
        const response = await apiClient.put(`/course-subjects/${assignmentId}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating subject assignment:', error);
        throw error;
    }
};

// Buscar aulas para asignaciones
export const searchAssignmentClassrooms = async (params = {}) => {
    try {
        const response = await apiClient.get('/course-subjects/classrooms/search', { params });
        return response.data;
    } catch (error) {
        // Si no hay resultados de búsqueda, retornar una respuesta vacía válida
        if (error?.response?.status === 400 && 
            (error?.response?.data?.code === 'NO_CLASSROOMS_FOUND' || 
             error?.response?.data?.code === 'NO_RESULTS_FOUND')) {
            return {
                success: true,
                data: {
                    classrooms: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: params.limit || 10,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                },
                message: 'No se encontraron aulas que coincidan con la búsqueda'
            };
        }
        
        console.error('Error searching assignment classrooms:', error);
        throw error;
    }
};

// Eliminar una asignación de materia (hard delete)
export const deleteSubjectAssignment = async (assignmentId) => {
    try {
        const response = await apiClient.delete(`/course-subjects/${assignmentId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting subject assignment:', error);
        throw error;
    }
};
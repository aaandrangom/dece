import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getAssignmentClassrooms, 
    getAvailableSubjects, 
    getClassroomSubjects,
    createSubjectAssignments,
    updateSubjectAssignment,
    deleteSubjectAssignment,
    searchAssignmentClassrooms
} from '../services/api/assignment';

// Hook para obtener aulas para asignaciones
export const useAssignmentClassrooms = (params = {}, options = {}) => {
    return useQuery({
        queryKey: ['assignment-classrooms', params],
        queryFn: () => getAssignmentClassrooms(params),
        staleTime: 5 * 60 * 1000, // 5 minutos
        ...options
    });
};

// Hook para obtener todas las materias disponibles
export const useAvailableSubjects = (options = {}) => {
    return useQuery({
        queryKey: ['available-subjects'],
        queryFn: getAvailableSubjects,
        staleTime: 10 * 60 * 1000, // 10 minutos
        ...options
    });
};

// Hook para obtener materias asignadas a un aula
export const useClassroomSubjects = (classroomId, options = {}) => {
    return useQuery({
        queryKey: ['classroom-subjects', classroomId],
        queryFn: () => getClassroomSubjects(classroomId),
        enabled: !!classroomId,
        staleTime: 5 * 60 * 1000, // 5 minutos
        ...options
    });
};

// Hook para crear asignaciones de materias
export const useCreateSubjectAssignments = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createSubjectAssignments,
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: ['classroom-subjects'] });
            queryClient.invalidateQueries({ queryKey: ['assignment-classrooms'] });
        }
    });
};

// Hook para actualizar una asignación de materia
export const useUpdateSubjectAssignment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ assignmentId, data }) => updateSubjectAssignment(assignmentId, data),
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: ['classroom-subjects'] });
        }
    });
};

// Hook para buscar aulas para asignaciones
export const useSearchAssignmentClassrooms = (params = {}, options = {}) => {
    return useQuery({
        queryKey: ['search-assignment-classrooms', params],
        queryFn: () => searchAssignmentClassrooms(params),
        staleTime: 5 * 60 * 1000, // 5 minutos
        ...options
    });
};

// Hook para eliminar una asignación de materia
export const useDeleteSubjectAssignment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteSubjectAssignment,
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: ['classroom-subjects'] });
        }
    });
};
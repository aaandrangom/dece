import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubjectService } from '../services/api/subject';

// Query keys para el cache
export const SUBJECTS_QUERY_KEYS = {
    all: ['subjects'],
    lists: () => [...SUBJECTS_QUERY_KEYS.all, 'list'],
    list: (filters) => [...SUBJECTS_QUERY_KEYS.lists(), { filters }],
    details: () => [...SUBJECTS_QUERY_KEYS.all, 'detail'],
    detail: (id) => [...SUBJECTS_QUERY_KEYS.details(), id],
    search: (term) => [...SUBJECTS_QUERY_KEYS.all, 'search', term || ''],
};

// Hook para obtener todas las materias
export const useSubjects = (options = {}, queryConfig = {}) => {
    return useQuery({
        queryKey: SUBJECTS_QUERY_KEYS.list(options),
        queryFn: () => SubjectService.getSubjects(options),
        staleTime: 5 * 60 * 1000, // 5 minutos
        ...queryConfig,
    });
};

// Hook para buscar materias
export const useSearchSubjects = (options = {}, queryConfig = {}) => {
    const searchTerm = options.search;
    const shouldSearch = searchTerm && typeof searchTerm === 'string' && searchTerm.trim().length > 0;
    
    return useQuery({
        queryKey: SUBJECTS_QUERY_KEYS.search(searchTerm),
        queryFn: () => SubjectService.searchSubjects(options),
        enabled: shouldSearch,
        staleTime: 30 * 1000, // 30 segundos para búsquedas
        ...queryConfig,
    });
};

// Hook para obtener detalles de una materia
export const useSubjectDetails = (subjectId, queryConfig = {}) => {
    return useQuery({
        queryKey: SUBJECTS_QUERY_KEYS.detail(subjectId),
        queryFn: () => SubjectService.getSubjectDetails(subjectId),
        enabled: !!subjectId,
        ...queryConfig,
    });
};

// Hook para crear una materia
export const useCreateSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: SubjectService.createSubject,
        onSuccess: () => {
            // Invalidar y refrescar la lista de materias
            queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEYS.all });
        },
    });
};

// Hook para actualizar una materia
export const useUpdateSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: SubjectService.updateSubject,
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEYS.all });
            // Invalidar detalles específicos si el subject_id está disponible
            if (variables.subject_id) {
                queryClient.invalidateQueries({ 
                    queryKey: SUBJECTS_QUERY_KEYS.detail(variables.subject_id) 
                });
            }
        },
    });
};

// Hook para eliminar/desactivar una materia
export const useDeleteSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: SubjectService.deleteSubject,
        onSuccess: (data, subjectId) => {
            // Invalidar y refrescar la lista de materias
            queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEYS.all });
            // Invalidar detalles específicos
            queryClient.invalidateQueries({ 
                queryKey: SUBJECTS_QUERY_KEYS.detail(subjectId) 
            });
        },
    });
};
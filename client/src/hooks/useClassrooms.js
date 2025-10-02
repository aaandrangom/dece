import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassroomService } from '../services/api/classroom';

// Query keys para el cache
export const CLASSROOMS_QUERY_KEYS = {
    all: ['classrooms'],
    lists: () => [...CLASSROOMS_QUERY_KEYS.all, 'list'],
    list: (filters) => [...CLASSROOMS_QUERY_KEYS.lists(), { filters }],
    details: () => [...CLASSROOMS_QUERY_KEYS.all, 'detail'],
    detail: (id) => [...CLASSROOMS_QUERY_KEYS.details(), id],
    search: (term) => [...CLASSROOMS_QUERY_KEYS.all, 'search', term || ''],
    grades: () => [...CLASSROOMS_QUERY_KEYS.all, 'grades'],
    parallels: () => [...CLASSROOMS_QUERY_KEYS.all, 'parallels'],
};

// Hook para obtener grados
export const useGrades = (queryConfig = {}) => {
    return useQuery({
        queryKey: CLASSROOMS_QUERY_KEYS.grades(),
        queryFn: () => ClassroomService.getGrades(),
        staleTime: 10 * 60 * 1000, // 10 minutos - datos que cambian poco
        ...queryConfig,
    });
};

// Hook para obtener paralelos
export const useParallels = (queryConfig = {}) => {
    return useQuery({
        queryKey: CLASSROOMS_QUERY_KEYS.parallels(),
        queryFn: () => ClassroomService.getParallels(),
        staleTime: 10 * 60 * 1000, // 10 minutos - datos que cambian poco
        ...queryConfig,
    });
};

// Hook para obtener todas las aulas por institución
export const useClassrooms = (options = {}, queryConfig = {}) => {
    return useQuery({
        queryKey: CLASSROOMS_QUERY_KEYS.list(options),
        queryFn: () => ClassroomService.getClassroomsByInstitution(options),
        staleTime: 5 * 60 * 1000, // 5 minutos
        enabled: queryConfig.enabled !== undefined ? Boolean(queryConfig.enabled) : true,
        ...queryConfig,
    });
};

// Hook para buscar aulas
export const useSearchClassrooms = (options = {}, queryConfig = {}) => {
    const searchTerm = options.q;
    const shouldSearch = searchTerm && typeof searchTerm === 'string' && searchTerm.trim().length > 0;
    
    return useQuery({
        queryKey: CLASSROOMS_QUERY_KEYS.search(searchTerm),
        queryFn: () => ClassroomService.searchClassrooms(options),
        staleTime: 30 * 1000, // 30 segundos para búsquedas
        ...queryConfig,
        enabled: queryConfig.enabled !== undefined ? queryConfig.enabled : shouldSearch,
    });
};

// Hook para obtener detalles de una aula
export const useClassroomDetails = (classroomId, queryConfig = {}) => {
    return useQuery({
        queryKey: CLASSROOMS_QUERY_KEYS.detail(classroomId),
        queryFn: () => ClassroomService.getClassroomDetails(classroomId),
        enabled: !!classroomId,
        ...queryConfig,
    });
};

// Hook para crear una aula
export const useCreateClassroom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ClassroomService.createClassroom,
        onSuccess: () => {
            // Invalidar y refrescar la lista de aulas
            queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEYS.all });
        },
    });
};

// Hook para actualizar una aula
export const useUpdateClassroom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ classroomId, ...data }) => ClassroomService.updateClassroom(classroomId, data),
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEYS.all });
            // Invalidar detalles específicos
            if (variables.classroomId) {
                queryClient.invalidateQueries({ 
                    queryKey: CLASSROOMS_QUERY_KEYS.detail(variables.classroomId) 
                });
            }
        },
    });
};

// Hook para eliminar/desactivar una aula
export const useDeleteClassroom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ClassroomService.deleteClassroom,
        onSuccess: (data, classroomId) => {
            // Invalidar y refrescar la lista de aulas
            queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEYS.all });
            // Invalidar detalles específicos
            queryClient.invalidateQueries({ 
                queryKey: CLASSROOMS_QUERY_KEYS.detail(classroomId) 
            });
        },
    });
};
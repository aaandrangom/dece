import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeacherService } from '../services/api/teacher';

// Hook para obtener todos los docentes
export const useTeachers = (options = {}, queryConfig = {}) => {
    return useQuery({
        queryKey: ['teachers', options],
        queryFn: () => TeacherService.getTeachersByInstitution(options, 1),
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 2,
        refetchOnWindowFocus: false,
        ...queryConfig
    });
};

// Hook para buscar docentes
export const useSearchTeachers = (options = {}, queryConfig = {}) => {
    const { search } = options;

    const isSearchEnabled = Boolean(search && search.trim().length > 0);
    const configEnabled = queryConfig.enabled !== false;
    const finalEnabled = isSearchEnabled && configEnabled;

    return useQuery({
        queryKey: ['teachers-search', options],
        queryFn: () => TeacherService.searchTeacher(options, 1),
        enabled: finalEnabled,
        keepPreviousData: true,
        staleTime: 2 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
        ...Object.fromEntries(
            Object.entries(queryConfig).filter(([key]) => key !== 'enabled')
        )
    });
};

// Hook para obtener detalles de un docente
export const useTeacherDetails = (teacherId, queryConfig = {}) => {
    return useQuery({
        queryKey: ['teacher-details', teacherId],
        queryFn: () => TeacherService.getDetails(teacherId),
        staleTime: 0, // Reducir staleTime para permitir actualizaciones más frecuentes
        retry: 2,
        refetchOnWindowFocus: false,
        ...queryConfig
    });
};

// Hook para obtener información básica de un docente
export const useTeacherBasicInfo = (teacherId, queryConfig = {}) => {
    return useQuery({
        queryKey: ['teacher-basic-info', teacherId],
        queryFn: () => TeacherService.getBasicInfo(teacherId),
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 2,
        refetchOnWindowFocus: false,
        enabled: !!teacherId,
        ...queryConfig
    });
};

// Hook para obtener las aulas
export const useTeacherClasses = (institutionId, queryConfig = {}) => {
    return useQuery({
        queryKey: ['teacher-classes', institutionId],
        queryFn: () => TeacherService.getClassrooms(institutionId),
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 2,
        refetchOnWindowFocus: false,
        enabled: !!institutionId,
        ...queryConfig
    });
};

// Hook para asignar tutor a aula
export const useAssignTutorToClassroom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => TeacherService.assignTutorToClassroom(data),
        onSuccess: (data, variables) => {
            console.log('✅ Tutor asignado exitosamente:', data);
            console.log('🔄 Invalidando queries para teacher_id:', variables.teacher_id);
            
            // Invalidar y refrescar las consultas relacionadas de forma más específica
            queryClient.invalidateQueries({
                queryKey: ['teacher-details', variables.teacher_id.toString()]
            });
            
            // También invalidar la query sin convertir a string por si acaso
            queryClient.invalidateQueries({
                queryKey: ['teacher-details', variables.teacher_id]
            });
            
            // Invalidar todas las queries de teachers
            queryClient.invalidateQueries({
                queryKey: ['teachers']
            });
            
            // Refrescar inmediatamente los datos del docente
            queryClient.refetchQueries({
                queryKey: ['teacher-details', variables.teacher_id.toString()]
            });
            
            queryClient.refetchQueries({
                queryKey: ['teacher-details', variables.teacher_id]
            });
            
            console.log('✅ Queries invalidadas y refrescadas');
        },
        onError: (error) => {
            console.error('Error al asignar tutor:', error);
            
            // Log detallado del error para debugging
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        // No usar throwOnError para evitar que el error se propague fuera de React Query
        throwOnError: false
    });
};

// Hook para eliminar asignación de tutor
export const useDeleteAssignmentTutor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (classroomTutorId) => TeacherService.deleteAssignmentTutor(classroomTutorId),
        onSuccess: (data, variables) => {
            console.log('✅ Asignación de tutor eliminada exitosamente:', data);
            console.log('🔄 Invalidando queries después de eliminar assignment');
            
            // Invalidar queries relacionadas
            // Nota: No tenemos el teacher_id directo, así que invalidamos todas las teacher-details
            queryClient.invalidateQueries({
                queryKey: ['teacher-details']
            });
            
            // Invalidar todas las queries de teachers
            queryClient.invalidateQueries({
                queryKey: ['teachers']
            });
            
            // Refrescar inmediatamente
            queryClient.refetchQueries({
                queryKey: ['teacher-details']
            });
            
            console.log('✅ Queries invalidadas y refrescadas después de eliminar');
        },
        onError: (error) => {
            console.error('Error al eliminar asignación de tutor:', error);
            
            // Log detallado del error para debugging
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        // No usar throwOnError para evitar que el error se propague fuera de React Query
        throwOnError: false
    });
};

// Hook para actualizar asignación de tutor
export const useUpdateAssignmentTutor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => TeacherService.updateAssignmentTutor(data),
        onSuccess: (data, variables) => {
            console.log('✅ Asignación de tutor actualizada exitosamente:', data);
            console.log('🔄 Invalidando queries después de actualizar assignment');
            
            // Invalidar queries relacionadas
            // Nota: No tenemos el teacher_id directo, así que invalidamos todas las teacher-details
            queryClient.invalidateQueries({
                queryKey: ['teacher-details']
            });
            
            // Invalidar todas las queries de teachers
            queryClient.invalidateQueries({
                queryKey: ['teachers']
            });
            
            // Refrescar inmediatamente
            queryClient.refetchQueries({
                queryKey: ['teacher-details']
            });
            
            console.log('✅ Queries invalidadas y refrescadas después de actualizar');
        },
        onError: (error) => {
            console.error('Error al actualizar asignación de tutor:', error);
            
            // Log detallado del error para debugging
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        // No usar throwOnError para evitar que el error se propague fuera de React Query
        throwOnError: false
    });
};

// Hook para obtener las materias de cursos (course subjects)
export const useCourseSubjects = (institutionId, queryConfig = {}) => {
    return useQuery({
        queryKey: ['course-subjects', institutionId],
        queryFn: () => TeacherService.getCourseSubjects(institutionId),
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 2,
        refetchOnWindowFocus: false,
        enabled: !!institutionId,
        ...queryConfig
    });
};

// Hook para asignar profesor a materia
export const useAssignClassroomSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => TeacherService.assignClassroomSubject(data),
        onSuccess: (data, variables) => {
            console.log('✅ Materia asignada exitosamente:', data);
            console.log('🔄 Invalidando queries para teacher_id:', variables.teacher_id);
            
            // Invalidar y refrescar las consultas relacionadas de forma más específica
            queryClient.invalidateQueries({
                queryKey: ['teacher-details', variables.teacher_id.toString()]
            });
            
            // También invalidar la query sin convertir a string por si acaso
            queryClient.invalidateQueries({
                queryKey: ['teacher-details', variables.teacher_id]
            });
            
            // Invalidar todas las queries de teachers
            queryClient.invalidateQueries({
                queryKey: ['teachers']
            });
            
            // Refrescar inmediatamente los datos del docente
            queryClient.refetchQueries({
                queryKey: ['teacher-details', variables.teacher_id.toString()]
            });
            
            queryClient.refetchQueries({
                queryKey: ['teacher-details', variables.teacher_id]
            });
            
            console.log('✅ Queries invalidadas y refrescadas');
        },
        onError: (error) => {
            console.error('Error al asignar materia:', error);
            
            // Log detallado del error para debugging
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        // No usar throwOnError para evitar que el error se propague fuera de React Query
        throwOnError: false
    });
};

// Hook para actualizar asignación de materia
export const useUpdateClassroomSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => TeacherService.updateClassroomSubject(data),
        onSuccess: (data, variables) => {
            console.log('✅ Asignación de materia actualizada exitosamente:', data);
            console.log('🔄 Invalidando queries después de actualizar materia');
            
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({
                queryKey: ['teacher-details']
            });
            
            // Invalidar todas las queries de teachers
            queryClient.invalidateQueries({
                queryKey: ['teachers']
            });
            
            // Refrescar inmediatamente
            queryClient.refetchQueries({
                queryKey: ['teacher-details']
            });
            
            console.log('✅ Queries invalidadas y refrescadas después de actualizar materia');
        },
        onError: (error) => {
            console.error('Error al actualizar asignación de materia:', error);
            
            // Log detallado del error para debugging
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        // No usar throwOnError para evitar que el error se propague fuera de React Query
        throwOnError: false
    });
};

// Hook para eliminar asignación de materia
export const useDeleteClassroomSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (assignmentId) => TeacherService.deleteClassroomSubject(assignmentId),
        onSuccess: (data, variables) => {
            console.log('✅ Asignación de materia eliminada exitosamente:', data);
            console.log('🔄 Invalidando queries después de eliminar materia');
            
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({
                queryKey: ['teacher-details']
            });
            
            // Invalidar todas las queries de teachers
            queryClient.invalidateQueries({
                queryKey: ['teachers']
            });
            
            // Refrescar inmediatamente
            queryClient.refetchQueries({
                queryKey: ['teacher-details']
            });
            
            console.log('✅ Queries invalidadas y refrescadas después de eliminar materia');
        },
        onError: (error) => {
            console.error('Error al eliminar asignación de materia:', error);
            
            // Log detallado del error para debugging
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        // No usar throwOnError para evitar que el error se propague fuera de React Query
        throwOnError: false
    });
};

// Hook para actualizar información básica de un docente
export const useUpdateTeacher = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (updateData) => TeacherService.updateTeacher(updateData),
        onSuccess: (response, variables) => {
            console.log('✅ Docente actualizado exitosamente:', response);
            
            // Invalidar y refrescar queries relacionadas
            queryClient.invalidateQueries({
                queryKey: ['teachers']
            });
            queryClient.invalidateQueries({
                queryKey: ['teacher-details', variables.teacher_id?.toString()]
            });
            queryClient.invalidateQueries({
                queryKey: ['teacher-basic-info', variables.teacher_id?.toString()]
            });
            
            console.log('✅ Queries invalidadas y refrescadas después de actualizar docente');
        },
        onError: (error) => {
            console.error('Error al actualizar docente:', error);
            
            // Log detallado del error para debugging
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        // No usar throwOnError para evitar que el error se propague fuera de React Query
        throwOnError: false
    });
};

// Hook para eliminar (soft delete) un docente
export const useDeleteTeacher = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (teacherId) => TeacherService.softDeleteTeacher(teacherId),
        onSuccess: (response, teacherId) => {
            console.log('✅ Docente eliminado exitosamente:', response);
            
            // Invalidar y refrescar la lista de docentes
            queryClient.invalidateQueries({
                queryKey: ['teachers']
            });
            
            // También invalidar búsquedas
            queryClient.invalidateQueries({
                queryKey: ['teachers-search']
            });
            
            console.log('✅ Lista de docentes actualizada después de eliminación');
        },
        onError: (error) => {
            console.error('Error al eliminar docente:', error);
            
            // Log detallado del error para debugging
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        // No usar throwOnError para evitar que el error se propague fuera de React Query
        throwOnError: false
    });
};

// Hook para crear un nuevo docente (con posibles asignaciones)
export const useCreateTeacher = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (teacherData) => TeacherService.createTeacher(teacherData, 1), // institutionId = 1
        onSuccess: (response, variables) => {
            console.log('✅ Docente creado exitosamente:', response);
            
            // Invalidar y refrescar todas las queries relacionadas
            queryClient.invalidateQueries({
                queryKey: ['teachers']
            });
            
            queryClient.invalidateQueries({
                queryKey: ['teachers-search']
            });
            
            // Si se creó con asignaciones, invalidar también las listas de opciones disponibles
            if (variables.classroom_id) {
                queryClient.invalidateQueries({
                    queryKey: ['teacher-classes', 1]
                });
            }
            
            if (variables.course_subject_id) {
                queryClient.invalidateQueries({
                    queryKey: ['course-subjects', 1]
                });
            }
            
            console.log('✅ Docente creado y todas las listas actualizadas');
        },
        onError: (error) => {
            console.error('Error al crear docente:', error);
            
            // Log detallado del error para debugging
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        // No usar throwOnError para evitar que el error se propague fuera de React Query
        throwOnError: false
    });
};

// Hook para validar archivo Excel
export const useValidateExcel = () => {
    return useMutation({
        mutationFn: ({ file, institutionId }) => TeacherService.validateExcelFile(file, institutionId),
        onError: (error) => {
            console.error('Error al validar archivo Excel:', error);
            
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        throwOnError: false
    });
};

// Hook para importar docentes validados
export const useImportValidatedTeachers = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ validTeachers, institutionId }) => TeacherService.importValidatedTeachers(validTeachers, institutionId),
        onSuccess: (data, variables) => {
            // Invalidar todas las queries relacionadas con docentes
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            queryClient.invalidateQueries({ queryKey: ['teachers-search'] });
            
            console.log('Importación exitosa:', data);
        },
        onError: (error) => {
            console.error('Error al importar docentes:', error);
            
            if (error?.response?.data) {
                console.error('Error del API:', error.response.data);
            }
        },
        throwOnError: false
    });
};
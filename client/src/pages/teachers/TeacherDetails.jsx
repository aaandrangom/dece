import React from 'react';
import { X, ArrowLeft, User, Mail, Phone, Calendar, Clock, Users, BookOpen, GraduationCap, AlertCircle, Loader2, RefreshCw, Plus, Check, FileText, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useTeacherDetails, useTeacherClasses, useAssignTutorToClassroom, useDeleteAssignmentTutor, useUpdateAssignmentTutor, useCourseSubjects, useAssignClassroomSubject, useUpdateClassroomSubject, useDeleteClassroomSubject } from '../../hooks/useTeachers';
import { useNavigate, useParams } from "react-router-dom";
import { showSuccessToast, showErrorToast } from '../../config/toast';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmModal from '../../components/ui/ConfirmModal';

// Componente de Loading Skeleton
const DetailsSkeleton = () => (
    <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="h-8 bg-purple-200 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 bg-purple-200 rounded w-1/2"></div>
                        <div className="h-6 bg-purple-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* Cards skeleton */}
        {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-300 rounded w-full"></div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

// Componente de Error
const ErrorState = ({ error, onRetry, onBack }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar los detalles</h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
            {error?.message || 'Ha ocurrido un error inesperado al cargar la información del docente.'}
        </p>
        <div className="flex gap-3">
            <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
            </button>
            <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
            </button>
        </div>
    </div>
);

// Componente principal
const TeacherDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { data, isLoading, error, refetch, isFetching } = useTeacherDetails(id);
    const { data: classroomsData, isLoading: isLoadingClassrooms } = useTeacherClasses(1);
    const { data: courseSubjectsData, isLoading: isLoadingCourseSubjects } = useCourseSubjects(1);
    const assignTutorMutation = useAssignTutorToClassroom();
    const deleteAssignmentMutation = useDeleteAssignmentTutor();
    const updateAssignmentMutation = useUpdateAssignmentTutor();
    const assignSubjectMutation = useAssignClassroomSubject();
    const updateSubjectMutation = useUpdateClassroomSubject();
    const deleteSubjectMutation = useDeleteClassroomSubject();

    // Forzar restauración del scroll al montar el componente
    React.useEffect(() => {
        // Forzar limpieza de cualquier estado de modal que pueda haber quedado
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        console.log('🔓 TeacherDetails: Scroll forzado a restaurar al montar');
    }, []);

    const teacherData = data?.data;
    const basicInfo = teacherData?.basicInfo;
    const tutorInfo = teacherData?.tutorInfo || [];
    const additionalInfo = teacherData?.additionalInfo || [];

    // Obtener las aulas del hook
    const classroomOptions = classroomsData?.data || [];
    const courseSubjectOptions = courseSubjectsData?.data || [];

    // Estado para mostrar la card editable de nuevo curso como tutor
    const [showAddTutorCard, setShowAddTutorCard] = React.useState(false);
    const [showEditTutorCard, setShowEditTutorCard] = React.useState(false);
    const [editingTutor, setEditingTutor] = React.useState(null);
    const [newTutor, setNewTutor] = React.useState({
        classroom_id: '',
        start_date: '',
        end_date: '',
        notes: ''
    });
    
    // Estado para mostrar la card editable de nueva materia
    const [showAddSubjectCard, setShowAddSubjectCard] = React.useState(false);
    const [showEditSubjectCard, setShowEditSubjectCard] = React.useState(false);
    const [editingSubject, setEditingSubject] = React.useState(null);
    const [newSubject, setNewSubject] = React.useState({
        course_subject_id: '',
        start_date: '',
        end_date: '',
        notes: ''
    });
    
    const [formError, setFormError] = React.useState('');

    // Estados para modales de confirmación de desactivación
    const [showDeleteTutorModal, setShowDeleteTutorModal] = React.useState(false);
    const [showDeleteSubjectModal, setShowDeleteSubjectModal] = React.useState(false);
    const [tutorToDelete, setTutorToDelete] = React.useState(null);
    const [subjectToDelete, setSubjectToDelete] = React.useState(null);

    const handleBack = () => {
        navigate(-1);
    };

    const handleCancel = () => {
        setShowAddTutorCard(false);
        setShowEditTutorCard(false);
        setShowAddSubjectCard(false);
        setShowEditSubjectCard(false);
        setEditingTutor(null);
        setEditingSubject(null);
        setFormError('');
        setNewTutor({
            classroom_id: '',
            start_date: '',
            end_date: '',
            notes: ''
        });
        setNewSubject({
            course_subject_id: '',
            start_date: '',
            end_date: '',
            notes: ''
        });
    };

    const handleUpdateTutor = async () => {
        // Limpiar errores previos
        setFormError('');
        
        // Validaciones básicas
        if (!newTutor.classroom_id) {
            setFormError('Por favor selecciona un aula');
            return;
        }
        
        if (!newTutor.start_date) {
            setFormError('Por favor selecciona una fecha de inicio');
            return;
        }

        // Validar que la fecha de fin no sea anterior a la de inicio
        if (newTutor.end_date && new Date(newTutor.end_date) < new Date(newTutor.start_date)) {
            setFormError('La fecha de fin no puede ser anterior a la fecha de inicio');
            return;
        }

        // Formatear las fechas al formato esperado por el API (DD-MM-YYYY)
        const formatDate = (dateString) => {
            if (!dateString) return '';
            // Usar split para evitar problemas de zona horaria
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        };

        const updateData = {
            classroom_tutor_id: editingTutor.id,
            classroom_id: parseInt(newTutor.classroom_id),
            start_date: formatDate(newTutor.start_date),
            end_date: newTutor.end_date ? formatDate(newTutor.end_date) : null,
            notes: newTutor.notes || ''
        };

        // Usar mutate para mejor manejo de errores
        updateAssignmentMutation.mutate(updateData, {
            onSuccess: (response) => {
                console.log('✅ Asignación actualizada exitosamente:', response);
                
                // Mostrar toast de éxito con Sonner
                showSuccessToast(
                    response.message || 'Asignación actualizada correctamente',
                    {
                        description: `Se modificaron ${response.data?.updatedFields || 0} campo(s)`
                    }
                );
                
                // Refrescar los datos del docente inmediatamente
                refetch();
                
                // Invalidar las listas de aulas disponibles por si cambió el aula asignada
                queryClient.invalidateQueries({
                    queryKey: ['teacher-classes', 1]
                });
                
                console.log('✅ Lista de aulas disponibles actualizada después de modificar asignación');
                
                // Limpiar el formulario y cerrar la card al éxito
                handleCancel();
            },
            onError: (error) => {
                console.error('Error al actualizar asignación:', error);
                
                // Manejar diferentes tipos de errores
                let errorMessage = 'Error al actualizar la asignación. Inténtalo de nuevo.';
                
                // Si el error viene del API con la estructura esperada
                if (error?.response?.data) {
                    const errorData = error.response.data;
                    
                    // Si tiene la estructura: { success: false, error: "mensaje", code: "codigo" }
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                    // Si tiene la estructura: { success: false, message: "mensaje" }
                    else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                }
                // Si es un error de red o conexión
                else if (error?.message) {
                    errorMessage = error.message;
                }
                
                // Mostrar toast de error con Sonner
                showErrorToast(
                    errorMessage,
                    {
                        description: 'Verifica los datos e inténtalo nuevamente'
                    }
                );
                
                setFormError(errorMessage);
            }
        });
    };

    const handleEditTutor = (tutor) => {
        // Formatear las fechas del formato DD-MM-YYYY al formato YYYY-MM-DD para los inputs
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const [day, month, year] = dateString.split('-');
            return `${year}-${month}-${day}`;
        };

        setEditingTutor(tutor);
        setNewTutor({
            classroom_id: tutor.classroom_id?.toString() || '',
            start_date: formatDateForInput(tutor.start_date) || '',
            end_date: formatDateForInput(tutor.end_date) || '',
            notes: tutor.notes || ''
        });
        setShowEditTutorCard(true);
        setShowAddTutorCard(false);
        setFormError('');
    };

    const handleEditSubject = (subject) => {
        // Formatear las fechas del formato DD-MM-YYYY al formato YYYY-MM-DD para los inputs
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const [day, month, year] = dateString.split('-');
            return `${year}-${month}-${day}`;
        };

        setEditingSubject(subject);
        setNewSubject({
            course_subject_id: subject.course_subject_id?.toString() || '',
            start_date: formatDateForInput(subject.start_date) || '',
            end_date: formatDateForInput(subject.end_date) || '',
            notes: subject.notes || ''
        });
        setShowEditSubjectCard(true);
        setShowAddSubjectCard(false);
        setShowAddTutorCard(false);
        setShowEditTutorCard(false);
        setEditingTutor(null);
        setFormError('');
    };

    const handleUpdateSubject = async () => {
        // Limpiar errores previos
        setFormError('');
        
        // Validaciones básicas
        if (!newSubject.course_subject_id) {
            setFormError('Por favor selecciona una materia');
            return;
        }
        
        if (!newSubject.start_date) {
            setFormError('Por favor selecciona una fecha de inicio');
            return;
        }

        // Validar que la fecha de fin no sea anterior a la de inicio
        if (newSubject.end_date && new Date(newSubject.end_date) < new Date(newSubject.start_date)) {
            setFormError('La fecha de fin no puede ser anterior a la fecha de inicio');
            return;
        }

        // Formatear las fechas al formato esperado por el API (DD-MM-YYYY)
        const formatDate = (dateString) => {
            if (!dateString) return '';
            // Usar split para evitar problemas de zona horaria
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        };

        const updateData = {
            assignment_id: editingSubject.assignment_id, // ID único de la asignación desde el backend
            course_subject_id: parseInt(newSubject.course_subject_id),
            start_date: formatDate(newSubject.start_date),
            end_date: newSubject.end_date ? formatDate(newSubject.end_date) : null,
            notes: newSubject.notes || ''
        };

        // Usar mutate para mejor manejo de errores
        updateSubjectMutation.mutate(updateData, {
            onSuccess: (response) => {
                console.log('✅ Asignación de materia actualizada exitosamente:', response);
                
                // Mostrar toast de éxito con Sonner
                showSuccessToast(
                    response.message || 'Materia actualizada correctamente',
                    {
                        description: `Se modificaron ${response.data?.updatedFields || 0} campo(s)`
                    }
                );
                
                // Refrescar los datos del docente inmediatamente
                refetch();
                
                // Invalidar las listas de materias disponibles por si cambió la materia asignada
                queryClient.invalidateQueries({
                    queryKey: ['course-subjects', 1]
                });
                
                console.log('✅ Lista de materias disponibles actualizada después de modificar asignación');
                
                // Limpiar el formulario y cerrar la card al éxito
                handleCancel();
            },
            onError: (error) => {
                console.error('Error al actualizar materia:', error);
                
                // Manejar diferentes tipos de errores
                let errorMessage = 'Error al actualizar la materia. Inténtalo de nuevo.';
                
                // Si el error viene del API con la estructura esperada
                if (error?.response?.data) {
                    const errorData = error.response.data;
                    
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                }
                else if (error?.message) {
                    errorMessage = error.message;
                }
                
                // Mostrar toast de error con Sonner
                showErrorToast(
                    errorMessage,
                    {
                        description: 'Verifica los datos e inténtalo nuevamente'
                    }
                );
                
                setFormError(errorMessage);
            }
        });
    };

    const handleDeleteSubject = (subjectId, subjectName) => {
        // Configurar los datos para el modal de confirmación
        setSubjectToDelete({
            id: subjectId,
            name: subjectName
        });
        setShowDeleteSubjectModal(true);
    };

    const handleConfirmDeleteSubject = () => {
        if (!subjectToDelete) return;

        deleteSubjectMutation.mutate(subjectToDelete.id, {
            onSuccess: () => {
                // Mostrar toast de éxito con Sonner
                showSuccessToast(
                    'Materia desactivada correctamente',
                    {
                        description: `Se desactivó la asignación de "${subjectToDelete.name}". Se mantiene en el historial.`
                    }
                );
                
                // Refrescar los datos del docente inmediatamente
                refetch();
                
                // Invalidar las listas de materias disponibles porque ahora hay una materia más disponible
                queryClient.invalidateQueries({
                    queryKey: ['course-subjects', 1]
                });
                
                console.log('✅ Lista de materias disponibles actualizada después de desactivar asignación');

                // Cerrar modal y limpiar estado
                setShowDeleteSubjectModal(false);
                setSubjectToDelete(null);
            },
            onError: (error) => {
                console.error('Error al desactivar materia:', error);
                
                // Manejar diferentes tipos de errores
                let errorMessage = 'Error al desactivar la materia. Inténtalo de nuevo.';
                
                if (error?.response?.data) {
                    const errorData = error.response.data;
                    
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } else if (error?.message) {
                    errorMessage = error.message;
                }
                
                // Mostrar toast de error con Sonner
                showErrorToast(
                    errorMessage,
                    {
                        description: 'No se pudo desactivar la asignación'
                    }
                );

                // Cerrar modal en caso de error también
                setShowDeleteSubjectModal(false);
                setSubjectToDelete(null);
            }
        });
    };

    const handleCloseDeleteSubjectModal = () => {
        if (!deleteSubjectMutation.isPending) {
            setShowDeleteSubjectModal(false);
            setSubjectToDelete(null);
        }
    };

    const handleSaveTutor = async () => {
        // Limpiar errores previos
        setFormError('');
        
        // Validaciones básicas
        if (!newTutor.classroom_id) {
            setFormError('Por favor selecciona un aula');
            return;
        }
        
        if (!newTutor.start_date) {
            setFormError('Por favor selecciona una fecha de inicio');
            return;
        }

        // Validar que la fecha de fin no sea anterior a la de inicio
        if (newTutor.end_date && new Date(newTutor.end_date) < new Date(newTutor.start_date)) {
            setFormError('La fecha de fin no puede ser anterior a la fecha de inicio');
            return;
        }

        // Formatear las fechas al formato esperado por el API (DD-MM-YYYY)
        const formatDate = (dateString) => {
            if (!dateString) return '';
            // Usar split para evitar problemas de zona horaria
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        };

        const tutorData = {
            classroom_id: parseInt(newTutor.classroom_id),
            teacher_id: parseInt(id),
            start_date: formatDate(newTutor.start_date),
            end_date: newTutor.end_date ? formatDate(newTutor.end_date) : null,
            notes: newTutor.notes || ''
        };

        // Usar mutate en lugar de mutateAsync para mejor manejo de errores
        assignTutorMutation.mutate(tutorData, {
            onSuccess: () => {
                // Mostrar toast de éxito con Sonner
                showSuccessToast(
                    'Tutor asignado correctamente',
                    {
                        description: 'La asignación se ha creado exitosamente'
                    }
                );
                
                // Refrescar los datos del docente inmediatamente
                refetch();
                
                // Invalidar las listas de aulas disponibles para que se actualicen
                queryClient.invalidateQueries({
                    queryKey: ['teacher-classes', 1]
                });
                
                console.log('✅ Lista de aulas disponibles actualizada después de asignar tutor');
                
                // Limpiar el formulario y cerrar la card al éxito
                handleCancel();
            },
            onError: (error) => {
                console.error('Error al asignar tutor:', error);
                
                // Manejar diferentes tipos de errores
                let errorMessage = 'Error al asignar el tutor. Inténtalo de nuevo.';
                
                // Si el error viene del API con la estructura esperada
                if (error?.response?.data) {
                    const errorData = error.response.data;
                    
                    // Si tiene la estructura: { success: false, error: "mensaje", code: "codigo" }
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                    // Si tiene la estructura: { success: false, message: "mensaje" }
                    else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                }
                // Si es un error de red o conexión
                else if (error?.message) {
                    errorMessage = error.message;
                }
                
                // Mostrar toast de error con Sonner
                showErrorToast(
                    errorMessage,
                    {
                        description: 'Verifica los datos e inténtalo nuevamente'
                    }
                );
                
                setFormError(errorMessage);
            }
        });
    };

    const handleSaveSubject = async () => {
        // Limpiar errores previos
        setFormError('');
        
        // Validaciones básicas
        if (!newSubject.course_subject_id) {
            setFormError('Por favor selecciona una materia');
            return;
        }
        
        if (!newSubject.start_date) {
            setFormError('Por favor selecciona una fecha de inicio');
            return;
        }

        // Validar que la fecha de fin no sea anterior a la de inicio
        if (newSubject.end_date && new Date(newSubject.end_date) < new Date(newSubject.start_date)) {
            setFormError('La fecha de fin no puede ser anterior a la fecha de inicio');
            return;
        }

        // Formatear las fechas al formato esperado por el API (DD-MM-YYYY)
        const formatDate = (dateString) => {
            if (!dateString) return '';
            // Usar split para evitar problemas de zona horaria
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        };

        const subjectData = {
            teacher_id: parseInt(id),
            course_subject_id: parseInt(newSubject.course_subject_id),
            start_date: formatDate(newSubject.start_date),
            end_date: newSubject.end_date ? formatDate(newSubject.end_date) : null,
            notes: newSubject.notes || ''
        };

        // Usar mutate para mejor manejo de errores
        assignSubjectMutation.mutate(subjectData, {
            onSuccess: () => {
                // Mostrar toast de éxito con Sonner
                showSuccessToast(
                    'Materia asignada correctamente',
                    {
                        description: 'La asignación se ha creado exitosamente'
                    }
                );
                
                // Refrescar los datos del docente inmediatamente
                refetch();
                
                // Invalidar las listas de materias disponibles para que se actualicen
                queryClient.invalidateQueries({
                    queryKey: ['course-subjects', 1]
                });
                
                console.log('✅ Lista de materias disponibles actualizada después de asignar materia');
                
                // Limpiar el formulario y cerrar la card al éxito
                handleCancel();
            },
            onError: (error) => {
                console.error('Error al asignar materia:', error);
                
                // Manejar diferentes tipos de errores
                let errorMessage = 'Error al asignar la materia. Inténtalo de nuevo.';
                
                // Si el error viene del API con la estructura esperada
                if (error?.response?.data) {
                    const errorData = error.response.data;
                    
                    // Si tiene la estructura: { success: false, error: "mensaje", code: "codigo" }
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                    // Si tiene la estructura: { success: false, message: "mensaje" }
                    else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                }
                // Si es un error de red o conexión
                else if (error?.message) {
                    errorMessage = error.message;
                }
                
                // Mostrar toast de error con Sonner
                showErrorToast(
                    errorMessage,
                    {
                        description: 'Verifica los datos e inténtalo nuevamente'
                    }
                );
                
                setFormError(errorMessage);
            }
        });
    };

    const handleDeleteTutor = (tutorId, classroomName) => {
        // Configurar los datos para el modal de confirmación
        setTutorToDelete({
            id: tutorId,
            classroomName: classroomName
        });
        setShowDeleteTutorModal(true);
    };

    const handleConfirmDeleteTutor = () => {
        if (!tutorToDelete) return;

        deleteAssignmentMutation.mutate(tutorToDelete.id, {
            onSuccess: () => {
                // Mostrar toast de éxito con Sonner
                showSuccessToast(
                    'Asignación de tutor desactivada correctamente',
                    {
                        description: `Se desactivó la asignación para "${tutorToDelete.classroomName}". Se mantiene en el historial.`
                    }
                );
                
                // Refrescar los datos del docente inmediatamente
                refetch();
                
                // Invalidar las listas de aulas disponibles porque ahora hay un aula más disponible
                queryClient.invalidateQueries({
                    queryKey: ['teacher-classes', 1]
                });
                
                console.log('✅ Lista de aulas disponibles actualizada después de desactivar asignación de tutor');

                // Cerrar modal y limpiar estado
                setShowDeleteTutorModal(false);
                setTutorToDelete(null);
            },
            onError: (error) => {
                console.error('Error al desactivar asignación:', error);
                
                // Manejar diferentes tipos de errores
                let errorMessage = 'Error al desactivar la asignación. Inténtalo de nuevo.';
                
                // Si el error viene del API con la estructura esperada
                if (error?.response?.data) {
                    const errorData = error.response.data;
                    
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } else if (error?.message) {
                    errorMessage = error.message;
                }
                
                // Mostrar toast de error con Sonner
                showErrorToast(
                    errorMessage,
                    {
                        description: 'No se pudo desactivar la asignación'
                    }
                );

                // Cerrar modal en caso de error también
                setShowDeleteTutorModal(false);
                setTutorToDelete(null);
            }
        });
    };

    const handleCloseDeleteTutorModal = () => {
        if (!deleteAssignmentMutation.isPending) {
            setShowDeleteTutorModal(false);
            setTutorToDelete(null);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header con botón de regreso */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Cargando detalles del docente...</h1>
                </div>
                <DetailsSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Detalles del Docente</h1>
                </div>
                <ErrorState error={error} onRetry={refetch} onBack={handleBack} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con botón de regreso */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-fit"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Detalles del Docente</h1>
                    <p className="text-gray-600 mt-1">Información completa del docente y sus asignaciones</p>
                </div>

                {/* Indicador de actualización */}
                {isFetching && !isLoading && (
                    <div className="flex items-center text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Actualizando...</span>
                    </div>
                )}
            </div>

            {/* Información Básica */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                    <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-purple-600" />
                        <h2 className="text-xl font-semibold text-purple-900">Información Personal</h2>
                        <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${basicInfo?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {basicInfo?.active ? 'Activo' : 'Inactivo'}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Primera fila: Cédula y Nombre Completo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Cédula</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{basicInfo?.id_number}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Nombre Completo</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{basicInfo?.full_name}</p>
                        </div>
                    </div>

                    {/* Segunda fila: Email y Teléfono */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Email</span>
                            </div>
                            <a
                                href={`mailto:${basicInfo?.email}`}
                                className="text-lg font-semibold text-purple-600 hover:text-purple-800 hover:underline break-all block"
                                title={basicInfo?.email}
                            >
                                {basicInfo?.email}
                            </a>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Teléfono</span>
                            </div>
                            <div className="space-y-1">
                                <a
                                    href={`tel:${basicInfo?.phone}`}
                                    className="block text-lg font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                                >
                                    {basicInfo?.phone}
                                </a>
                                {basicInfo?.phone_alt && (
                                    <a
                                        href={`tel:${basicInfo?.phone_alt}`}
                                        className="block text-sm text-gray-600 hover:text-gray-800 hover:underline"
                                    >
                                        Alt: {basicInfo?.phone_alt}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fecha de registro */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Registrado el: {new Date(basicInfo?.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información de Tutoría */}
            {tutorInfo.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                        <div className="flex items-center gap-3">
                            <Users className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900">Cursos como Tutor</h2>
                            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                                {tutorInfo.length} curso{tutorInfo.length !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={() => {
                                    setShowAddTutorCard(true);
                                    setShowEditTutorCard(false);
                                    setEditingTutor(null);
                                }}
                                className="ml-auto inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
                                title="Agregar curso como tutor"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Card editable para agregar curso como tutor */}
                            {showAddTutorCard && (
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                    {/* Header con gradiente similar al diseño base */}
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <BookOpen className="h-6 w-6 text-blue-600" />
                                                <h3 className="text-xl font-semibold text-blue-900">Nuevo Curso como Tutor</h3>
                                            </div>
                                            <button
                                                onClick={handleCancel}
                                                className="p-1 hover:bg-blue-200/50 rounded-md transition-colors"
                                                aria-label="Cerrar"
                                            >
                                                <X className="h-5 w-5 text-blue-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contenido del formulario */}
                                    <div className="p-6">
                                        {/* Fila principal: Aula, Fecha inicio, Fecha fin */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label htmlFor="classroom-select" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Aula
                                                </label>
                                                <select
                                                    id="classroom-select"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                    value={newTutor.classroom_id}
                                                    onChange={e => setNewTutor(nt => ({ ...nt, classroom_id: e.target.value }))}
                                                    required
                                                    disabled={isLoadingClassrooms}
                                                >
                                                    <option value="">
                                                        {isLoadingClassrooms ? 'Cargando aulas...' : 'Seleccionar aula'}
                                                    </option>
                                                    {classroomOptions.map(classroom => (
                                                        <option key={classroom.classroom_id} value={classroom.classroom_id}>
                                                            {classroom.classroom_name} - {classroom.classroom_name_full}
                                                        </option>
                                                    ))}
                                                </select>
                                                {isLoadingClassrooms && (
                                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                        Cargando aulas...
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha inicio
                                                </label>
                                                <input
                                                    id="start-date"
                                                    type="date"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={newTutor.start_date}
                                                    onChange={e => setNewTutor(nt => ({ ...nt, start_date: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha fin
                                                </label>
                                                <input
                                                    id="end-date"
                                                    type="date"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={newTutor.end_date}
                                                    onChange={e => setNewTutor(nt => ({ ...nt, end_date: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Notas - fila completa */}
                                        <div className="mb-6">
                                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                                Notas adicionales (opcional)
                                            </label>
                                            <textarea
                                                id="notes"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                rows={3}
                                                placeholder="Información adicional sobre la asignación..."
                                                value={newTutor.notes}
                                                onChange={e => setNewTutor(nt => ({ ...nt, notes: e.target.value }))}
                                            />
                                        </div>

                                        {/* Mensaje de error */}
                                        {formError && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <div className="flex items-center">
                                                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                                    <span className="text-sm text-red-700">{formError}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Botones de acción */}
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddTutorCard(false);
                                                    setNewTutor({ classroom_id: '', start_date: '', end_date: '', notes: '' });
                                                }}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                onClick={handleSaveTutor}
                                                disabled={!newTutor.classroom_id || !newTutor.start_date || isLoadingClassrooms || assignTutorMutation.isPending}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                                            >
                                                {assignTutorMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                                {assignTutorMutation.isPending ? 'Guardando...' : 'Guardar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Card editable para editar curso como tutor */}
                            {showEditTutorCard && editingTutor && (
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                    {/* Header con gradiente similar al diseño base */}
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100 rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Edit2 className="h-6 w-6 text-amber-600" />
                                                <h3 className="text-xl font-semibold text-amber-900">Editar Curso como Tutor</h3>
                                                <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded text-sm">
                                                    {editingTutor.classroom_full_name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleCancel}
                                                className="p-1 hover:bg-amber-200/50 rounded-md transition-colors"
                                                aria-label="Cerrar"
                                            >
                                                <X className="h-5 w-5 text-amber-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contenido del formulario */}
                                    <div className="p-6">
                                        {/* Fila principal: Aula, Fecha inicio, Fecha fin */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label htmlFor="edit-classroom-select" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Aula
                                                </label>
                                                <select
                                                    id="edit-classroom-select"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                                                    value={newTutor.classroom_id}
                                                    onChange={e => setNewTutor(nt => ({ ...nt, classroom_id: e.target.value }))}
                                                    required
                                                    disabled={isLoadingClassrooms}
                                                >
                                                    <option value="">
                                                        {isLoadingClassrooms ? 'Cargando aulas...' : 'Seleccionar aula'}
                                                    </option>
                                                    {classroomOptions.map(classroom => (
                                                        <option key={classroom.classroom_id} value={classroom.classroom_id}>
                                                            {classroom.classroom_name} - {classroom.classroom_name_full}
                                                        </option>
                                                    ))}
                                                </select>
                                                {isLoadingClassrooms && (
                                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                        Cargando aulas...
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="edit-start-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha inicio
                                                </label>
                                                <input
                                                    id="edit-start-date"
                                                    type="date"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                    value={newTutor.start_date}
                                                    onChange={e => setNewTutor(nt => ({ ...nt, start_date: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="edit-end-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha fin
                                                </label>
                                                <input
                                                    id="edit-end-date"
                                                    type="date"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                    value={newTutor.end_date}
                                                    onChange={e => setNewTutor(nt => ({ ...nt, end_date: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Notas - fila completa */}
                                        <div className="mb-6">
                                            <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-2">
                                                Notas adicionales (opcional)
                                            </label>
                                            <textarea
                                                id="edit-notes"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                                                rows={3}
                                                placeholder="Información adicional sobre la asignación..."
                                                value={newTutor.notes}
                                                onChange={e => setNewTutor(nt => ({ ...nt, notes: e.target.value }))}
                                            />
                                        </div>

                                        {/* Mensaje de error */}
                                        {formError && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <div className="flex items-center">
                                                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                                    <span className="text-sm text-red-700">{formError}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Botones de acción */}
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                onClick={handleUpdateTutor}
                                                disabled={!newTutor.classroom_id || !newTutor.start_date || isLoadingClassrooms || updateAssignmentMutation.isPending}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                                            >
                                                {updateAssignmentMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                                {updateAssignmentMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tabla de cursos como tutor */}
                            {!showAddTutorCard && !showEditTutorCard && (
                                <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                                Aula
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                                Grado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                                Horario
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                                Estudiantes
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tutorInfo.map((tutor, index) => (
                                            <tr key={tutor.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{tutor.classroom_full_name}</div>
                                                    {tutor.notes && (
                                                        <div className="text-xs text-gray-500 mt-1" title={tutor.notes}>
                                                            {tutor.notes.length > 50 ? `${tutor.notes.substring(0, 50)}...` : tutor.notes}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {tutor.grade_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {tutor.schedule}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {tutor.enrolled_students}/{tutor.capacity}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tutor.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {tutor.active ? 'Activo' : 'Inactivo'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEditTutor(tutor)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-md hover:bg-blue-50"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTutor(tutor.id, tutor.classroom_full_name)}
                                                            className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50"
                                                            title="Eliminar"
                                                            disabled={deleteAssignmentMutation.isPending}
                                                        >
                                                            {deleteAssignmentMutation.isPending ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Materias que Imparte */}
            {additionalInfo.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-6 w-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-green-900">Materias que Imparte</h2>
                            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                                {additionalInfo.length} materia{additionalInfo.length !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={() => {
                                    setShowAddSubjectCard(true);
                                    setShowAddTutorCard(false);
                                    setShowEditTutorCard(false);
                                    setEditingTutor(null);
                                }}
                                className="ml-auto inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200"
                                title="Agregar materia que imparte"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                            </button>
                        </div>
                    </div>

                    {/* Card editable para agregar materia */}
                    {showAddSubjectCard && (
                        <div className="p-6 border-b border-gray-200">
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                {/* Header con gradiente similar al diseño base */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="h-6 w-6 text-green-600" />
                                            <h3 className="text-xl font-semibold text-green-900">Nueva Materia</h3>
                                        </div>
                                        <button
                                            onClick={handleCancel}
                                            className="p-1 hover:bg-green-200/50 rounded-md transition-colors"
                                            aria-label="Cerrar"
                                        >
                                            <X className="h-5 w-5 text-green-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Contenido del formulario */}
                                <div className="p-6">
                                    {/* Fila principal: Materia, Fecha inicio, Fecha fin */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-2">
                                                Materia
                                            </label>
                                            <select
                                                id="subject-select"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                                value={newSubject.course_subject_id}
                                                onChange={e => setNewSubject(ns => ({ ...ns, course_subject_id: e.target.value }))}
                                                required
                                                disabled={isLoadingCourseSubjects}
                                            >
                                                <option value="">
                                                    {isLoadingCourseSubjects ? 'Cargando materias...' : 'Seleccionar materia'}
                                                </option>
                                                {courseSubjectOptions.map(subject => (
                                                    <option key={subject.course_subject_id} value={subject.course_subject_id}>
                                                        {subject.classroom_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {isLoadingCourseSubjects && (
                                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                    Cargando materias...
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="subject-start-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                Fecha inicio
                                            </label>
                                            <input
                                                id="subject-start-date"
                                                type="date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                value={newSubject.start_date}
                                                onChange={e => setNewSubject(ns => ({ ...ns, start_date: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="subject-end-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                Fecha fin
                                            </label>
                                            <input
                                                id="subject-end-date"
                                                type="date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                value={newSubject.end_date}
                                                onChange={e => setNewSubject(ns => ({ ...ns, end_date: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Notas - fila completa */}
                                    <div className="mb-6">
                                        <label htmlFor="subject-notes" className="block text-sm font-medium text-gray-700 mb-2">
                                            Notas adicionales (opcional)
                                        </label>
                                        <textarea
                                            id="subject-notes"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                            rows={3}
                                            placeholder="Información adicional sobre la asignación..."
                                            value={newSubject.notes}
                                            onChange={e => setNewSubject(ns => ({ ...ns, notes: e.target.value }))}
                                        />
                                    </div>

                                    {/* Mensaje de error */}
                                    {formError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <div className="flex items-center">
                                                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                                <span className="text-sm text-red-700">{formError}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Botones de acción */}
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            onClick={handleSaveSubject}
                                            disabled={!newSubject.course_subject_id || !newSubject.start_date || isLoadingCourseSubjects || assignSubjectMutation.isPending}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                                        >
                                            {assignSubjectMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                            {assignSubjectMutation.isPending ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card editable para editar materia */}
                    {showEditSubjectCard && (
                        <div className="p-6 border-b border-gray-200">
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                {/* Header con gradiente similar al diseño base */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="h-6 w-6 text-green-600" />
                                            <h3 className="text-xl font-semibold text-green-900">Editar Materia</h3>
                                            {editingSubject && (
                                                <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm">
                                                    {editingSubject.subject_name} - {editingSubject.classroom_name}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleCancel}
                                            className="p-1 hover:bg-green-200/50 rounded-md transition-colors"
                                            aria-label="Cerrar"
                                        >
                                            <X className="h-5 w-5 text-green-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Contenido del formulario */}
                                <div className="p-6">
                                    {/* Fila principal: Materia, Fecha inicio, Fecha fin */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label htmlFor="edit-subject-select" className="block text-sm font-medium text-gray-700 mb-2">
                                                Materia
                                            </label>
                                            <select
                                                id="edit-subject-select"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                                value={newSubject.course_subject_id}
                                                onChange={e => setNewSubject(ns => ({ ...ns, course_subject_id: e.target.value }))}
                                                required
                                                disabled={isLoadingCourseSubjects}
                                            >
                                                <option value="">
                                                    {isLoadingCourseSubjects ? 'Cargando materias...' : 'Selecciona una materia'}
                                                </option>
                                                {courseSubjectOptions?.map((subject) => (
                                                    <option key={subject.course_subject_id || subject.id} value={subject.course_subject_id || subject.id}>
                                                        {subject.classroom_name || subject.subject_name + ' - ' + subject.subject_code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="edit-start-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                Fecha de Inicio
                                            </label>
                                            <input
                                                type="date"
                                                id="edit-start-date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                value={newSubject.start_date}
                                                onChange={e => setNewSubject(ns => ({ ...ns, start_date: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="edit-end-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                Fecha de Fin (opcional)
                                            </label>
                                            <input
                                                type="date"
                                                id="edit-end-date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                value={newSubject.end_date}
                                                onChange={e => setNewSubject(ns => ({ ...ns, end_date: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Fila de notas */}
                                    <div className="mb-6">
                                        <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-2">
                                            Notas (opcional)
                                        </label>
                                        <textarea
                                            id="edit-notes"
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                            placeholder="Agrega notas adicionales sobre esta asignación..."
                                            value={newSubject.notes}
                                            onChange={e => setNewSubject(ns => ({ ...ns, notes: e.target.value }))}
                                        />
                                    </div>

                                    {/* Mensaje de error */}
                                    {formError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700">{formError}</p>
                                        </div>
                                    )}

                                    {/* Botones de acción */}
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            onClick={handleUpdateSubject}
                                            disabled={!newSubject.course_subject_id || !newSubject.start_date || isLoadingCourseSubjects || updateSubjectMutation.isPending}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                                        >
                                            {updateSubjectMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                            {updateSubjectMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-green-50 to-green-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Materia
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Aula
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Horario
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Horas/Semana
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Estudiantes
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {additionalInfo.map((subject, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{subject.subject_name}</div>
                                            {subject.notes && (
                                                <div className="text-xs text-gray-500 mt-1" title={subject.notes}>
                                                    {subject.notes.length > 50 ? `${subject.notes.substring(0, 50)}...` : subject.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {subject.subject_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {subject.classroom_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {subject.schedule}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{subject.hours_per_week}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{subject.total_students}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditSubject(subject)}
                                                    className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-md hover:bg-green-50"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSubject(subject.assignment_id, subject.subject_name)}
                                                    className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mensaje si no hay información adicional */}
            {tutorInfo.length === 0 && !showAddTutorCard && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin asignaciones activas</h3>
                    <p className="text-gray-600 mb-6">
                        📌 Este profesor todavía no tiene cursos asignados como tutor.
                    </p>
                    <button
                        onClick={() => {
                            setShowAddTutorCard(true);
                            setShowEditTutorCard(false);
                            setEditingTutor(null);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar curso como tutor
                    </button>
                </div>
            )}

            {/* Mostrar la card editable cuando no hay datos y se hace clic en agregar */}
            {tutorInfo.length === 0 && showAddTutorCard && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                        <div className="flex items-center gap-3">
                            <Users className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900">Cursos como Tutor</h2>
                            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                                0 cursos
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Card editable para agregar curso como tutor */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                {/* Header con gradiente similar al diseño base */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="h-6 w-6 text-blue-600" />
                                            <h3 className="text-xl font-semibold text-blue-900">Nuevo Curso como Tutor</h3>
                                        </div>
                                        <button
                                            onClick={handleCancel}
                                            className="p-1 hover:bg-blue-200/50 rounded-md transition-colors"
                                            aria-label="Cerrar"
                                        >
                                            <X className="h-5 w-5 text-blue-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Contenido del formulario */}
                                <div className="p-6">
                                    {/* Fila principal: Aula, Fecha inicio, Fecha fin */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label htmlFor="classroom-select" className="block text-sm font-medium text-gray-700 mb-2">
                                                Aula
                                            </label>
                                            <select
                                                id="classroom-select"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                value={newTutor.classroom_id}
                                                onChange={e => setNewTutor(nt => ({ ...nt, classroom_id: e.target.value }))}
                                                required
                                                disabled={isLoadingClassrooms}
                                            >
                                                <option value="">
                                                    {isLoadingClassrooms ? 'Cargando aulas...' : 'Seleccionar aula'}
                                                </option>
                                                {classroomOptions.map(classroom => (
                                                    <option key={classroom.classroom_id} value={classroom.classroom_id}>
                                                        {classroom.classroom_name} - {classroom.schedule}
                                                    </option>
                                                ))}
                                            </select>
                                            {isLoadingClassrooms && (
                                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                    Cargando aulas...
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                Fecha inicio
                                            </label>
                                            <input
                                                id="start-date"
                                                type="date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={newTutor.start_date}
                                                onChange={e => setNewTutor(nt => ({ ...nt, start_date: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                                                Fecha fin
                                            </label>
                                            <input
                                                id="end-date"
                                                type="date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={newTutor.end_date}
                                                onChange={e => setNewTutor(nt => ({ ...nt, end_date: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Notas - fila completa */}
                                    <div className="mb-6">
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                            Notas adicionales (opcional)
                                        </label>
                                        <textarea
                                            id="notes"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            rows={3}
                                            placeholder="Información adicional sobre la asignación..."
                                            value={newTutor.notes}
                                            onChange={e => setNewTutor(nt => ({ ...nt, notes: e.target.value }))}
                                        />
                                    </div>

                                    {/* Mensaje de error */}
                                    {formError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <div className="flex items-center">
                                                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                                <span className="text-sm text-red-700">{formError}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Botones de acción */}
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            onClick={handleSaveTutor}
                                            disabled={!newTutor.classroom_id || !newTutor.start_date || isLoadingClassrooms || assignTutorMutation.isPending}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                                        >
                                            {assignTutorMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                            {assignTutorMutation.isPending ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {additionalInfo.length === 0 && !showAddSubjectCard && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin información adicional</h3>
                    <p className="text-gray-600 mb-6">
                        📌 Este profesor todavía no tiene cursos asignados para dar clases.
                    </p>
                    <button
                        onClick={() => {
                            setShowAddSubjectCard(true);
                            setShowAddTutorCard(false);
                            setShowEditTutorCard(false);
                            setEditingTutor(null);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Asignar curso para clases
                    </button>
                </div>
            )}

            {/* Mostrar la card editable cuando no hay materias y se hace clic en agregar */}
            {additionalInfo.length === 0 && showAddSubjectCard && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-6 w-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-green-900">Materias que Imparte</h2>
                            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                                0 materias
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            {/* Header con gradiente similar al diseño base */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="h-6 w-6 text-green-600" />
                                        <h3 className="text-xl font-semibold text-green-900">Nueva Materia</h3>
                                    </div>
                                    <button
                                        onClick={handleCancel}
                                        className="p-1 hover:bg-green-200/50 rounded-md transition-colors"
                                        aria-label="Cerrar"
                                    >
                                        <X className="h-5 w-5 text-green-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Contenido del formulario */}
                            <div className="p-6">
                                {/* Fila principal: Materia, Fecha inicio, Fecha fin */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="empty-subject-select" className="block text-sm font-medium text-gray-700 mb-2">
                                            Materia
                                        </label>
                                        <select
                                            id="empty-subject-select"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                            value={newSubject.course_subject_id}
                                            onChange={e => setNewSubject(ns => ({ ...ns, course_subject_id: e.target.value }))}
                                            required
                                            disabled={isLoadingCourseSubjects}
                                        >
                                            <option value="">
                                                {isLoadingCourseSubjects ? 'Cargando materias...' : 'Seleccionar materia'}
                                            </option>
                                            {courseSubjectOptions.map(subject => (
                                                <option key={subject.course_subject_id} value={subject.course_subject_id}>
                                                    {subject.classroom_name}
                                                </option>
                                            ))}
                                        </select>
                                        {isLoadingCourseSubjects && (
                                            <div className="flex items-center mt-1 text-sm text-gray-500">
                                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                Cargando materias...
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="empty-subject-start-date" className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha inicio
                                        </label>
                                        <input
                                            id="empty-subject-start-date"
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={newSubject.start_date}
                                            onChange={e => setNewSubject(ns => ({ ...ns, start_date: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="empty-subject-end-date" className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha fin
                                        </label>
                                        <input
                                            id="empty-subject-end-date"
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={newSubject.end_date}
                                            onChange={e => setNewSubject(ns => ({ ...ns, end_date: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Notas - fila completa */}
                                <div className="mb-6">
                                    <label htmlFor="empty-subject-notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas adicionales (opcional)
                                    </label>
                                    <textarea
                                        id="empty-subject-notes"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                        rows={3}
                                        placeholder="Información adicional sobre la asignación..."
                                        value={newSubject.notes}
                                        onChange={e => setNewSubject(ns => ({ ...ns, notes: e.target.value }))}
                                    />
                                </div>

                                {/* Mensaje de error */}
                                {formError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <div className="flex items-center">
                                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                            <span className="text-sm text-red-700">{formError}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Botones de acción */}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleSaveSubject}
                                        disabled={!newSubject.course_subject_id || !newSubject.start_date || isLoadingCourseSubjects || assignSubjectMutation.isPending}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                                    >
                                        {assignSubjectMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                        {assignSubjectMutation.isPending ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para desactivar asignación de tutor */}
            <ConfirmModal
                isOpen={showDeleteTutorModal}
                onClose={handleCloseDeleteTutorModal}
                onConfirm={handleConfirmDeleteTutor}
                title="Desactivar Asignación de Tutor"
                message={
                    tutorToDelete 
                        ? `¿Estás seguro de que deseas desactivar la asignación de tutor para "${tutorToDelete.classroomName}"? Esta acción mantiene el registro en el historial pero lo marca como inactivo.`
                        : 'Confirma la desactivación de la asignación'
                }
                confirmText="Desactivar"
                cancelText="Cancelar"
                type="warning"
                isLoading={deleteAssignmentMutation.isPending}
            />

            {/* Modal de confirmación para desactivar asignación de materia */}
            <ConfirmModal
                isOpen={showDeleteSubjectModal}
                onClose={handleCloseDeleteSubjectModal}
                onConfirm={handleConfirmDeleteSubject}
                title="Desactivar Asignación de Materia"
                message={
                    subjectToDelete 
                        ? `¿Estás seguro de que deseas desactivar la asignación de "${subjectToDelete.name}"? Esta acción mantiene el registro en el historial pero lo marca como inactivo.`
                        : 'Confirma la desactivación de la asignación'
                }
                confirmText="Desactivar"
                cancelText="Cancelar"
                type="warning"
                isLoading={deleteSubjectMutation.isPending}
            />
        </div>
    );
};

export default TeacherDetails;
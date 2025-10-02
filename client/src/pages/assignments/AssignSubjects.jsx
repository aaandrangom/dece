import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, BookOpen, Clock, Users, Loader2, AlertCircle, Edit, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAvailableSubjects, useClassroomSubjects, useCreateSubjectAssignments, useUpdateSubjectAssignment, useDeleteSubjectAssignment } from '../../hooks/useAssignments';
import { showSuccessToast, showErrorToast } from '../../config/toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const AssignSubjects = () => {
    const navigate = useNavigate();
    const { classroomId } = useParams();
    
    // Estados para el formulario
    const [assignments, setAssignments] = useState([
        { subject_id: '', hours_per_week: '' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para edición
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [editForm, setEditForm] = useState({
        subject_id: '',
        hours_per_week: '',
        active: true
    });

    // Estados para eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);

    // Hooks para datos
    const { data: subjectsData, isLoading: subjectsLoading } = useAvailableSubjects();
    const { data: assignedSubjectsData, isLoading: assignedLoading, refetch: refetchAssigned } = useClassroomSubjects(classroomId);
    const createAssignmentsMutation = useCreateSubjectAssignments();
    const updateAssignmentMutation = useUpdateSubjectAssignment();
    const deleteAssignmentMutation = useDeleteSubjectAssignment();

    const availableSubjects = subjectsData?.data || [];
    const assignedSubjects = assignedSubjectsData?.data || [];

    // Obtener IDs de materias ya asignadas para filtrarlas
    const assignedSubjectIds = assignedSubjects.map(subject => subject.id);

    const handleBack = () => {
        navigate('/teachers/assignments');
    };

    // Agregar una nueva fila de asignación
    const addAssignment = () => {
        setAssignments([...assignments, { subject_id: '', hours_per_week: '' }]);
    };

    // Eliminar una fila de asignación
    const removeAssignment = (index) => {
        if (assignments.length > 1) {
            setAssignments(assignments.filter((_, i) => i !== index));
        }
    };

    // Actualizar una asignación específica
    const updateAssignment = (index, field, value) => {
        const updated = assignments.map((assignment, i) => 
            i === index ? { ...assignment, [field]: value } : assignment
        );
        setAssignments(updated);
    };

    // Validar formulario
    const validateForm = () => {
        const errors = [];
        
        // Verificar que todos los campos estén completos
        assignments.forEach((assignment, index) => {
            if (!assignment.subject_id) {
                errors.push(`Selecciona una materia para la fila ${index + 1}`);
            }
            if (!assignment.hours_per_week || assignment.hours_per_week <= 0) {
                errors.push(`Ingresa horas válidas para la fila ${index + 1}`);
            }
        });

        // Verificar que no hay materias duplicadas
        const subjectIds = assignments.map(a => a.subject_id).filter(Boolean);
        const duplicates = subjectIds.filter((id, index) => subjectIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
            errors.push('No puedes asignar la misma materia varias veces');
        }

        return errors;
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (errors.length > 0) {
            showErrorToast('Errores en el formulario', {
                description: errors[0]
            });
            return;
        }

        setIsSubmitting(true);

        // Preparar datos para envío
        const payload = assignments
            .filter(assignment => assignment.subject_id && assignment.hours_per_week)
            .map(assignment => ({
                classroom_id: parseInt(classroomId),
                subject_id: parseInt(assignment.subject_id),
                hours_per_week: parseInt(assignment.hours_per_week)
            }));

        try {
            await createAssignmentsMutation.mutateAsync(payload);
            
            // Limpiar formulario
            setAssignments([{ subject_id: '', hours_per_week: '' }]);
            
            // Refrescar lista de materias asignadas
            await refetchAssigned();
            
            showSuccessToast('Asignaciones creadas correctamente', {
                description: `Se asignaron ${payload.length} materia(s) al aula`
            });
        } catch (error) {
            console.error('Error creating assignments:', error);
            
            let errorMessage = 'Error al crear las asignaciones';
            let errorDescription = 'Verifica los datos e inténtalo nuevamente';

            if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            showErrorToast(errorMessage, {
                description: errorDescription
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Obtener materias disponibles (no asignadas)
    const getAvailableSubjectsForRow = (currentSubjectId) => {
        const selectedInOtherRows = assignments
            .map(a => a.subject_id)
            .filter(id => id && id !== currentSubjectId);
        
        return availableSubjects.filter(subject => 
            !assignedSubjectIds.includes(subject.id) && 
            !selectedInOtherRows.includes(subject.id.toString())
        );
    };

    // Funciones para edición
    const handleEditAssignment = (assignment) => {
        console.log('Assignment data:', assignment); // Para debug
        setEditingAssignment(assignment.course_subject_id);
        setEditForm({
            subject_id: assignment.subject_id?.toString() || assignment.id.toString(),
            hours_per_week: assignment.hours_per_week || assignment.hoursPerWeek || '',
            active: assignment.active !== false
        });
    };

    const handleCancelEdit = () => {
        setEditingAssignment(null);
        setEditForm({
            subject_id: '',
            hours_per_week: '',
            active: true
        });
    };

    const handleUpdateAssignment = async () => {
        if (!editForm.subject_id || !editForm.hours_per_week) {
            showErrorToast('Todos los campos son obligatorios');
            return;
        }

        const payload = {
            subject_id: parseInt(editForm.subject_id),
            hours_per_week: parseInt(editForm.hours_per_week),
            active: editForm.active
        };

        try {
            await updateAssignmentMutation.mutateAsync({
                assignmentId: editingAssignment,
                data: payload
            });

            await refetchAssigned();
            handleCancelEdit();

            showSuccessToast('Asignación actualizada correctamente');
        } catch (error) {
            console.error('Error updating assignment:', error);
            
            let errorMessage = 'Error al actualizar la asignación';
            if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            showErrorToast(errorMessage);
        }
    };

    // Funciones para eliminación
    const handleDeleteClick = (assignment) => {
        setAssignmentToDelete(assignment);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        if (!deleteAssignmentMutation.isPending) {
            setShowDeleteModal(false);
            setAssignmentToDelete(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!assignmentToDelete) return;

        try {
            await deleteAssignmentMutation.mutateAsync(assignmentToDelete.course_subject_id);
            
            setShowDeleteModal(false);
            setAssignmentToDelete(null);
            
            await refetchAssigned();

            showSuccessToast('Materia eliminada de la asignación', {
                description: `La materia ${assignmentToDelete.name} ha sido removida del aula`
            });
        } catch (error) {
            console.error('Error deleting assignment:', error);
            
            setShowDeleteModal(false);
            setAssignmentToDelete(null);

            let errorMessage = 'Error al eliminar la asignación';
            if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            showErrorToast(errorMessage, {
                description: 'Verifica los datos e inténtalo nuevamente'
            });
        }
    };

    if (subjectsLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Asignar Materias</h1>
                        <p className="text-gray-600">Cargando información...</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-blue-900">Asignar Materias</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulario de asignación */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Plus className="h-5 w-5 mr-2 text-blue-500" />
                                Agregar Asignaciones
                            </h2>
                        </div>

                        <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {assignments.map((assignment, index) => (
                                <div key={index} className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg">
                                    {/* Selector de materia */}
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Materia
                                        </label>
                                        <select
                                            value={assignment.subject_id}
                                            onChange={(e) => updateAssignment(index, 'subject_id', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Seleccionar materia</option>
                                            {getAvailableSubjectsForRow(assignment.subject_id).map(subject => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Horas por semana */}
                                    <div className="w-32">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Horas/semana
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="40"
                                            value={assignment.hours_per_week}
                                            onChange={(e) => updateAssignment(index, 'hours_per_week', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                            required
                                        />
                                    </div>

                                    {/* Botón eliminar */}
                                    <button
                                        type="button"
                                        onClick={() => removeAssignment(index)}
                                        disabled={assignments.length === 1}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Eliminar asignación"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Botones de acción */}
                            <div className="flex items-center justify-between pt-4">
                                <button
                                    type="button"
                                    onClick={addAssignment}
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar otra materia
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || createAssignmentsMutation.isPending}
                                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting || createAssignmentsMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Guardar asignaciones
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tabla de materias asignadas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                            Materias Asignadas
                        </h2>
                    </div>

                    <div className="p-6">
                        {assignedLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                            </div>
                        ) : assignedSubjects.length === 0 ? (
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No hay materias asignadas a esta aula</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {assignedSubjects.map((subject) => (
                                    <div key={subject.id} className="p-4 bg-white rounded-lg border border-gray-200">
                                        {editingAssignment === subject.id ? (
                                            // Modo edición
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Edit className="h-4 w-4 text-blue-500" />
                                                    <span className="font-medium text-gray-900">Editando asignación</span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    {/* Selector de materia */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Materia
                                                        </label>
                                                        <select
                                                            value={editForm.subject_id}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, subject_id: e.target.value }))}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value={subject.id}>{subject.name}</option>
                                                            {availableSubjects
                                                                .filter(s => !assignedSubjectIds.includes(s.id) || s.id === subject.id)
                                                                .map(availableSubject => (
                                                                    <option key={availableSubject.id} value={availableSubject.id}>
                                                                        {availableSubject.name}
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>

                                                    {/* Horas por semana */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Horas/semana
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="40"
                                                            value={editForm.hours_per_week}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, hours_per_week: e.target.value }))}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>

                                                    {/* Estado activo */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Estado
                                                        </label>
                                                        <select
                                                            value={editForm.active ? 'true' : 'false'}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, active: e.target.value === 'true' }))}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="true">Activo</option>
                                                            <option value="false">Inactivo</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Botones de acción para edición */}
                                                <div className="flex items-center gap-2 pt-2">
                                                    <button
                                                        onClick={handleUpdateAssignment}
                                                        disabled={updateAssignmentMutation.isPending}
                                                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                    >
                                                        {updateAssignmentMutation.isPending ? (
                                                            <>
                                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                Guardando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="h-3 w-3 mr-1" />
                                                                Guardar
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        disabled={updateAssignmentMutation.isPending}
                                                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                    >
                                                        <X className="h-3 w-3 mr-1" />
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Modo visualización
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            {subject.teacher_name && (
                                                                <p className="text-sm text-gray-600 flex items-center">
                                                                    <Users className="h-3 w-3 mr-1" />
                                                                    {subject.teacher_name}
                                                                </p>
                                                            )}
                                                            {(subject.hours_per_week || subject.hoursPerWeek) && (
                                                                <p className="text-sm text-gray-600 flex items-center">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    {subject.hours_per_week || subject.hoursPerWeek}h/semana
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                        Asignada
                                                    </span>
                                                    {/* Botones de acción */}
                                                    <button
                                                        onClick={() => handleEditAssignment(subject)}
                                                        className="inline-flex items-center p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar asignación"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(subject)}
                                                        className="inline-flex items-center p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar asignación"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>

            {/* Modal de confirmación para eliminar */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Eliminar Asignación"
                message={assignmentToDelete ? `¿Estás seguro de que deseas eliminar la materia "${assignmentToDelete.name}" de esta aula?` : ''}
                description="Esta acción eliminará permanentemente la asignación y no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
                isLoading={deleteAssignmentMutation.isPending}
            />
        </div>
    );
};

export default AssignSubjects;
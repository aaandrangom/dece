import React from 'react';
import { ArrowLeft, BookOpen, Save, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSubjectDetails, useUpdateSubject } from '../../hooks/useSubjects';
import { showSuccessToast, showErrorToast } from '../../config/toast';

// Componente de Loading
const EditSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
            <div className="mt-6">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-24 bg-gray-300 rounded"></div>
            </div>
        </div>
    </div>
);

const EditSubject = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const { data, isLoading, error } = useSubjectDetails(id);
    const updateMutation = useUpdateSubject();

    const [formData, setFormData] = React.useState({
        name: '',
        code: '',
        description: '',
        active: true
    });

    const [formError, setFormError] = React.useState('');
    const [hasChanges, setHasChanges] = React.useState(false);

    // Cargar datos iniciales cuando se obtienen del servidor
    React.useEffect(() => {
        if (data?.data) {
            const subjectData = data.data;
            setFormData({
                name: subjectData.name || '',
                code: subjectData.code || '',
                description: subjectData.description || '',
                active: Boolean(subjectData.active)
            });
        }
    }, [data]);

    const handleBack = () => {
        if (hasChanges) {
            const confirmLeave = window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?');
            if (!confirmLeave) return;
        }
        navigate(`/teachers/subjects/list`);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value
            };
            
            // Verificar si hay cambios comparando con los datos originales
            if (data?.data) {
                const original = data.data;
                const hasDataChanges = 
                    newData.name !== (original.name || '') ||
                    newData.code !== (original.code || '') ||
                    newData.description !== (original.description || '') ||
                    newData.active !== Boolean(original.active);
                
                setHasChanges(hasDataChanges);
            }
            
            return newData;
        });

        if (formError) {
            setFormError('');
        }
    };

    const handleSave = () => {
        setFormError('');

        // Validaciones
        if (!formData.name.trim()) {
            setFormError('El nombre de la materia es obligatorio');
            return;
        }

        if (!formData.code.trim()) {
            setFormError('El código de la materia es obligatorio');
            return;
        }

        // Validar que el código no tenga espacios
        if (formData.code.includes(' ')) {
            setFormError('El código no debe contener espacios');
            return;
        }

        // Preparar payload solo con campos que pueden cambiar
        const payload = {
            subject_id: parseInt(id),
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            description: formData.description.trim() || null,
            active: formData.active ? 1 : 0
        };

        updateMutation.mutate(payload, {
            onSuccess: (response) => {
                showSuccessToast(
                    response?.message || 'Materia actualizada correctamente',
                    {
                        description: 'Los cambios han sido guardados exitosamente'
                    }
                );

                setHasChanges(false);
                navigate(`/teachers/subjects/list/${id}`);
            },
            onError: (error) => {
                console.error('Error al actualizar materia:', error);

                let errorMessage = 'Error al actualizar la materia. Inténtalo de nuevo.';

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

                showErrorToast(errorMessage, {
                    description: 'Verifica los datos e inténtalo nuevamente'
                });

                setFormError(errorMessage);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Editar Materia</h1>
                        <p className="text-gray-600 mt-1">Cargando información...</p>
                    </div>
                </div>
                <EditSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Editar Materia</h1>
                        <p className="text-gray-600 mt-1">Error al cargar la información</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12 px-4">
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la materia</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                        {error?.message || 'Ha ocurrido un error inesperado al cargar la información de la materia.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-fit"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Editar Materia</h1>
                    <p className="text-gray-600 mt-1">Modifica la información de la materia</p>
                </div>
                {hasChanges && (
                    <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                        Cambios sin guardar
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-indigo-900">Información de la Materia</h2>
                        <div className="ml-auto px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Editando
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-gray-400" />
                                    Nombre de la Materia *
                                </div>
                            </label>
                            <input
                                id="name"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Ej: Matemáticas, Historia, Ciencias Naturales"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-gray-400" />
                                    Código de la Materia *
                                </div>
                            </label>
                            <input
                                id="code"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                                value={formData.code}
                                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                placeholder="Ej: MAT, HIST, CCNN"
                                required
                                maxLength="10"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Código único sin espacios (se convertirá a mayúsculas automáticamente)
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-gray-400" />
                                    Descripción
                                </div>
                            </label>
                            <textarea
                                id="description"
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Descripción detallada de la materia (opcional)"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                                checked={formData.active}
                                onChange={(e) => handleInputChange('active', e.target.checked)}
                            />
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                {formData.active ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                Materia activa
                            </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-7">
                            Las materias inactivas no aparecen en las asignaciones nuevas
                        </p>
                    </div>
                </div>
            </div>

            {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{formError}</p>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={updateMutation.isPending || !hasChanges}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                >
                    {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
};

export default EditSubject;
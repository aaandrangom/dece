import React from 'react';
import { ArrowLeft, School, Save, AlertCircle, Loader2, MapPin, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClassroomDetails, useUpdateClassroom } from '../../hooks/useClassrooms';
import { showSuccessToast, showErrorToast } from '../../config/toast';

const EditClassroom = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Estados del formulario
    const [formData, setFormData] = React.useState({
        capacity: '',
        location: '',
        active: true
    });
    const [originalData, setOriginalData] = React.useState({});
    const [formError, setFormError] = React.useState('');

    // Hooks para obtener datos y actualizar
    const { data: classroomData, isLoading, error } = useClassroomDetails(id);
    const updateMutation = useUpdateClassroom();

    // Efecto para cargar datos cuando lleguen del API
    React.useEffect(() => {
        if (classroomData?.success && classroomData?.data) {
            const classroom = classroomData.data;
            const initialData = {
                capacity: classroom.capacity || '',
                location: classroom.location || '',
                active: classroom.active === 1
            };
            setFormData(initialData);
            setOriginalData(initialData);
        }
    }, [classroomData]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Limpiar error cuando el usuario empiece a escribir
        if (formError) {
            setFormError('');
        }
    };

    const getChangedFields = () => {
        const changes = {};
        let hasChanges = false;

        Object.keys(formData).forEach(key => {
            if (formData[key] !== originalData[key]) {
                changes[key] = formData[key];
                hasChanges = true;
            }
        });

        return hasChanges ? changes : null;
    };

    const handleSave = () => {
        setFormError('');

        // Validaciones básicas
        if (!formData.location.trim()) {
            setFormError('La ubicación es obligatoria');
            return;
        }

        if (!formData.capacity || formData.capacity <= 0) {
            setFormError('La capacidad debe ser un número mayor a 0');
            return;
        }

        // Verificar si hay cambios
        const changes = getChangedFields();
        if (!changes) {
            setFormError('No se han realizado cambios para guardar');
            return;
        }

        // Preparar payload con conversiones necesarias
        const payload = {
            classroomId: parseInt(id),
            ...changes
        };

        // Convertir capacity a número si está en los cambios
        if (changes.capacity) {
            payload.capacity = parseInt(changes.capacity);
        }

        updateMutation.mutate(payload, {
            onSuccess: (response) => {
                // Actualizar los datos originales para reflejar los cambios guardados
                setOriginalData(prev => ({ ...prev, ...changes }));
                
                showSuccessToast(
                    response?.message || 'Aula actualizada correctamente',
                    {
                        description: 'Los cambios han sido guardados exitosamente'
                    }
                );
                
                // Ya no navegar, quedarse en la misma página
            },
            onError: (error) => {
                console.error('Error al actualizar aula:', error);

                let errorMessage = 'Error al actualizar el aula. Inténtalo de nuevo.';
                let errorDescription = 'Verifica los datos e inténtalo nuevamente';

                // Manejar errores del backend con estructura específica
                if (error?.response?.data) {
                    const errorData = error.response.data;
                    
                    if (errorData.error) {
                        errorMessage = errorData.error;
                        
                        switch (errorData.code) {
                            case 'VALIDATION_ERROR':
                                errorDescription = 'Por favor corrige los datos del formulario';
                                break;
                            case 'CAPACITY_ERROR':
                                errorDescription = 'La capacidad especificada no es válida';
                                break;
                            case 'LOCATION_EXISTS':
                                errorDescription = 'Ya existe un aula en esta ubicación';
                                break;
                            default:
                                errorDescription = 'Revisa la información ingresada';
                        }
                    }
                } else if (error?.message) {
                    errorMessage = error.message;
                }

                showErrorToast(errorMessage, {
                    description: errorDescription
                });

                setFormError(errorMessage);
            }
        });
    };

    // Componente de carga
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Aula</h1>
                        <p className="text-gray-600 mt-1">Cargando información del aula...</p>
                    </div>
                </div>

                {/* Loading skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                        <div className="flex items-center gap-3">
                            <School className="h-6 w-6 text-green-600" />
                            <div className="h-6 bg-green-200 rounded w-48 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Componente de error
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Aula</h1>
                        <p className="text-gray-600 mt-1">Error al cargar los datos</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12 px-4">
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el aula</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                        {error?.message || 'Ha ocurrido un error inesperado al cargar la información del aula.'}
                    </p>
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    const classroom = classroomData?.data;
    if (!classroom) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Aula</h1>
                        <p className="text-gray-600 mt-1">Aula no encontrada</p>
                    </div>
                </div>
                <div className="text-center py-12">
                    <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aula no encontrada</h3>
                    <p className="text-gray-600">El aula solicitada no existe.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Editar Aula</h1>
                    <p className="text-gray-600 mt-1">
                        Modificar información del aula {classroom.classroom_code}
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center gap-3">
                        <School className="h-6 w-6 text-green-600" />
                        <h2 className="text-xl font-semibold text-green-900">Información Editable</h2>
                        <div className="ml-auto px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Editando
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Información no editable */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Información del Aula (Solo lectura)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Código:</span>
                                <p className="font-mono font-medium text-gray-900">{classroom.classroom_code}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Nombre:</span>
                                <p className="font-medium text-gray-900">{classroom.classroom_name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Horario:</span>
                                <p className="font-medium text-gray-900 capitalize">{classroom.schedule.toLowerCase()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Campos editables */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Capacidad */}
                        <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    Capacidad *
                                </div>
                            </label>
                            <input
                                id="capacity"
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={formData.capacity}
                                onChange={(e) => handleInputChange('capacity', e.target.value)}
                                placeholder="Ej: 50"
                                required
                            />
                        </div>

                        {/* Estado */}
                        <div>
                            <label htmlFor="active" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <School className="h-4 w-4 text-gray-400" />
                                    Estado *
                                </div>
                            </label>
                            <select
                                id="active"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={formData.active ? '1' : '0'}
                                onChange={(e) => handleInputChange('active', e.target.value === '1')}
                                required
                            >
                                <option value="1">Activa</option>
                                <option value="0">Inactiva</option>
                            </select>
                        </div>

                        {/* Ubicación */}
                        <div className="md:col-span-2">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    Ubicación *
                                </div>
                            </label>
                            <input
                                id="location"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="Ej: Planta Baja Edificio Central"
                                required
                            />
                        </div>
                    </div>

                    {/* Mensaje de error */}
                    {formError && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                <span className="text-sm text-red-800">{formError}</span>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditClassroom;
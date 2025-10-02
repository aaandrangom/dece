import React from 'react';
import { ArrowLeft, BookOpen, Save, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateSubject } from '../../hooks/useSubjects';
import { showSuccessToast, showErrorToast } from '../../config/toast';

const CreateSubject = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = React.useState({
        name: '',
        code: '',
        description: '',
        active: true
    });

    const [formError, setFormError] = React.useState('');

    // Hook para crear materia
    const createMutation = useCreateSubject();

    const handleBack = () => {
        navigate(-1);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

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

        // Convertir el código a mayúsculas
        const payload = {
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            description: formData.description.trim() || undefined
        };

        createMutation.mutate(payload, {
            onSuccess: (response) => {
                showSuccessToast(
                    response?.message || 'Materia creada correctamente',
                    {
                        description: 'La materia ha sido registrada exitosamente'
                    }
                );

                navigate('/teachers/subjects/list');
            },
            onError: (error) => {
                console.error('Error al crear materia:', error);

                let errorMessage = 'Error al crear la materia. Inténtalo de nuevo.';

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
                    <h1 className="text-2xl font-bold text-gray-900">Crear Materia</h1>
                    <p className="text-gray-600 mt-1">Registra una nueva materia en el sistema</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-indigo-900">Información de la Materia</h2>
                        <div className="ml-auto px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Nueva
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
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                >
                    {createMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {createMutation.isPending ? 'Creando...' : 'Crear Materia'}
                </button>
            </div>
        </div>
    );
};

export default CreateSubject;
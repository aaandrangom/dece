import React from 'react';
import { ArrowLeft, User, Mail, Phone, IdCard, Save, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeacherBasicInfo, useUpdateTeacher } from '../../hooks/useTeachers';
import { showSuccessToast, showErrorToast } from '../../config/toast';

const EditTeacher = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Estados del formulario
    const [formData, setFormData] = React.useState({
        id_number: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        phone_alt: '',
        active: true
    });
    const [originalData, setOriginalData] = React.useState({});
    const [formError, setFormError] = React.useState('');

    // Hooks para obtener datos y actualizar
    const { data: teacherData, isLoading, error } = useTeacherBasicInfo(id);
    const updateMutation = useUpdateTeacher();

    // Efecto para cargar datos cuando lleguen del API
    React.useEffect(() => {
        if (teacherData?.success && teacherData?.data) {
            const teacher = teacherData.data;
            const initialData = {
                id_number: teacher.id_number || '',
                first_name: teacher.first_name || '',
                last_name: teacher.last_name || '',
                email: teacher.email || '',
                phone: teacher.phone || '',
                phone_alt: teacher.phone_alt || '',
                active: teacher.active === 1
            };
            setFormData(initialData);
            setOriginalData(initialData);
        }
    }, [teacherData]);

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
        const changes = { teacher_id: parseInt(id) };
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
        if (!formData.first_name.trim()) {
            setFormError('El nombre es obligatorio');
            return;
        }

        if (!formData.last_name.trim()) {
            setFormError('El apellido es obligatorio');
            return;
        }

        if (!formData.email.trim()) {
            setFormError('El email es obligatorio');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormError('El formato del email no es válido');
            return;
        }

        // Verificar si hay cambios
        const changedFields = getChangedFields();
        if (!changedFields) {
            showErrorToast('No hay cambios para guardar', {
                description: 'Modifica algún campo antes de guardar'
            });
            return;
        }

        updateMutation.mutate(changedFields, {
            onSuccess: (response) => {
                showSuccessToast(
                    response?.message || 'Docente actualizado correctamente',
                    {
                        description: 'Los cambios se han guardado exitosamente'
                    }
                );

                // Actualizar los datos originales con los nuevos valores
                // para que el formulario refleje el estado actual
                setOriginalData({ ...formData });
            },
            onError: (error) => {
                console.error('Error al actualizar docente:', error);
                
                let errorMessage = 'Error al actualizar el docente. Inténtalo de nuevo.';
                
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
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Cargando información del docente...</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="animate-pulse space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                    <div className="h-10 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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
                    <h1 className="text-2xl font-bold text-gray-900">Error al cargar docente</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar los datos</h3>
                    <p className="text-gray-600 mb-6">
                        {error?.message || 'Ha ocurrido un error inesperado al cargar la información del docente.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const teacher = teacherData?.data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-fit"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Editar Docente</h1>
                    <p className="text-gray-600 mt-1">Modifica la información del docente</p>
                </div>
            </div>

            {/* Formulario de edición */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                    <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-purple-600" />
                        <h2 className="text-xl font-semibold text-purple-900">Información del Docente</h2>
                        {teacher && (
                            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                                teacher.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {teacher.active ? 'Activo' : 'Inactivo'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cédula */}
                        <div>
                            <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <IdCard className="h-4 w-4 text-gray-400" />
                                    Cédula
                                </div>
                            </label>
                            <input
                                id="id_number"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={formData.id_number}
                                onChange={(e) => handleInputChange('id_number', e.target.value)}
                                placeholder="Ingresa la cédula"
                            />
                        </div>

                        {/* Nombres */}
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    Nombres *
                                </div>
                            </label>
                            <input
                                id="first_name"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={formData.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                placeholder="Ingresa los nombres"
                                required
                            />
                        </div>

                        {/* Apellidos */}
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    Apellidos *
                                </div>
                            </label>
                            <input
                                id="last_name"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={formData.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                placeholder="Ingresa los apellidos"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    Email *
                                </div>
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>

                        {/* Teléfono principal */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    Teléfono Principal
                                </div>
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="0987654321"
                            />
                        </div>

                        {/* Teléfono alternativo */}
                        <div>
                            <label htmlFor="phone_alt" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    Teléfono Alternativo
                                </div>
                            </label>
                            <input
                                id="phone_alt"
                                type="tel"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={formData.phone_alt}
                                onChange={(e) => handleInputChange('phone_alt', e.target.value)}
                                placeholder="0987654321"
                            />
                        </div>
                    </div>

                    {/* Estado activo */}
                    <div className="mt-6">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                checked={formData.active}
                                onChange={(e) => handleInputChange('active', e.target.checked)}
                            />
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                {formData.active ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                Docente activo
                            </span>
                        </label>
                    </div>

                    {/* Mensaje de error */}
                    {formError && (
                        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{formError}</p>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
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
            </div>
        </div>
    );
};

export default EditTeacher;

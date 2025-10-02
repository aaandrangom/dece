import React from 'react';
import { ArrowLeft, School, Save, AlertCircle, MapPin, Users, Hash, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateClassroom, useGrades, useParallels } from '../../hooks/useClassrooms';
import { showSuccessToast, showErrorToast } from '../../config/toast';

const CreateClassroom = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = React.useState({
        grade_id: '',
        parallel_id: '',
        capacity: '',
        classroom_code: '', // Se generará automáticamente
        location: '',
        schedule: 'MATUTINA'
    });

    const [formError, setFormError] = React.useState('');

    // Hooks para obtener datos
    const createMutation = useCreateClassroom();
    const { data: gradesData, isLoading: gradesLoading, error: gradesError } = useGrades();
    const { data: parallelsData, isLoading: parallelsLoading, error: parallelsError } = useParallels();

    // Extraer datos de las respuestas
    const grades = gradesData?.data || [];
    const parallels = parallelsData?.data || [];

    // Generar código automáticamente cuando cambie grado, paralelo o horario
    React.useEffect(() => {
        if (formData.grade_id && formData.parallel_id && formData.schedule) {
            const selectedGrade = grades.find(g => g.id === parseInt(formData.grade_id));
            const selectedParallel = parallels.find(p => p.id === parseInt(formData.parallel_id));
            
            if (selectedGrade && selectedParallel) {
                // Mapear horarios a letras
                const scheduleMap = {
                    'MATUTINA': 'M',
                    'VESPERTINA': 'V', 
                    'NOCTURNA': 'N'
                };

                // Extraer el número del grado (ej: "9no" -> "9", "1ro BGU" -> "1")
                const gradeNumber = selectedGrade.name_short.match(/\d+/)?.[0] || '';
                const parallelLetter = selectedParallel.name;
                const scheduleLetter = scheduleMap[formData.schedule];

                const generatedCode = `AUL-${gradeNumber}${parallelLetter}${scheduleLetter}`;
                
                setFormData(prev => ({
                    ...prev,
                    classroom_code: generatedCode
                }));
            }
        }
    }, [formData.grade_id, formData.parallel_id, formData.schedule, grades, parallels]);

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

    const validateForm = () => {
        if (!formData.grade_id) {
            setFormError('Debe seleccionar un grado');
            return false;
        }

        if (!formData.parallel_id) {
            setFormError('Debe seleccionar un paralelo');
            return false;
        }

        if (!formData.capacity || formData.capacity <= 0) {
            setFormError('La capacidad debe ser un número mayor a 0');
            return false;
        }

        if (!formData.location.trim()) {
            setFormError('La ubicación del aula es obligatoria');
            return false;
        }

        return true;
    };

    const handleSave = () => {
        setFormError('');

        if (!validateForm()) {
            return;
        }

        // Convertir los valores numéricos
        const payload = {
            ...formData,
            grade_id: parseInt(formData.grade_id),
            parallel_id: parseInt(formData.parallel_id),
            capacity: parseInt(formData.capacity)
        };

        createMutation.mutate(payload, {
            onSuccess: (response) => {
                showSuccessToast(
                    response?.message || 'Aula creada correctamente',
                    {
                        description: 'El aula ha sido registrada exitosamente'
                    }
                );

                navigate('/teachers/classes/list');
            },
            onError: (error) => {
                console.error('Error al crear aula:', error.response);

                let errorMessage = 'Error al crear el aula. Inténtalo de nuevo.';
                let errorDescription = 'Verifica los datos e inténtalo nuevamente';

                // Manejar errores del backend con estructura específica
                if (error?.response?.data) {
                    const errorData = error.response.data;
                    
                    // Usar el mensaje específico del backend si existe
                    if (errorData.error) {
                        errorMessage = errorData.error;
                        
                        // Personalizar descripciones según el tipo de error
                        switch (errorData.code) {
                            case 'VALIDATION_ERROR':
                                errorDescription = 'Por favor corrige los datos del formulario';
                                break;
                            case 'DUPLICATE_ERROR':
                                errorDescription = 'Ya existe un aula con estos datos';
                                break;
                            case 'CAPACITY_ERROR':
                                errorDescription = 'La capacidad especificada no es válida';
                                break;
                            default:
                                errorDescription = 'Revisa la información ingresada';
                        }
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-fit"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Crear Aula</h1>
                    <p className="text-gray-600 mt-1">Registra una nueva aula en el sistema</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center gap-3">
                        <School className="h-6 w-6 text-green-600" />
                        <h2 className="text-xl font-semibold text-green-900">Información del Aula</h2>
                        <div className="ml-auto px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Nueva
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Grado */}
                        <div>
                            <label htmlFor="grade_id" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <School className="h-4 w-4 text-gray-400" />
                                    Grado *
                                </div>
                            </label>
                            {gradesLoading ? (
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm text-gray-500">Cargando grados...</span>
                                </div>
                            ) : gradesError ? (
                                <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 flex items-center">
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                                    <span className="text-sm text-red-600">
                                        {gradesError?.message || 'Error al cargar grados'}
                                    </span>
                                </div>
                            ) : (
                                <select
                                    id="grade_id"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={formData.grade_id}
                                    onChange={(e) => handleInputChange('grade_id', e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar grado</option>
                                    {grades.map((grade) => (
                                        <option key={grade.id} value={grade.id}>
                                            {grade.name_short}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Paralelo */}
                        <div>
                            <label htmlFor="parallel_id" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <School className="h-4 w-4 text-gray-400" />
                                    Paralelo *
                                </div>
                            </label>
                            {parallelsLoading ? (
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm text-gray-500">Cargando paralelos...</span>
                                </div>
                            ) : parallelsError ? (
                                <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 flex items-center">
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                                    <span className="text-sm text-red-600">
                                        {parallelsError?.message || 'Error al cargar paralelos'}
                                    </span>
                                </div>
                            ) : (
                                <select
                                    id="parallel_id"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={formData.parallel_id}
                                    onChange={(e) => handleInputChange('parallel_id', e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar paralelo</option>
                                    {parallels.map((parallel) => (
                                        <option key={parallel.id} value={parallel.id}>
                                            {parallel.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Horario */}
                        <div>
                            <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    Horario *
                                </div>
                            </label>
                            <select
                                id="schedule"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={formData.schedule}
                                onChange={(e) => handleInputChange('schedule', e.target.value)}
                                required
                            >
                                <option value="MATUTINA">Matutina</option>
                                <option value="VESPERTINA">Vespertina</option>
                                <option value="NOCTURNA">Nocturna</option>
                            </select>
                        </div>

                        {/* Ubicación */}
                        <div>
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

                        {/* Código del Aula (Generado Automáticamente) */}
                        <div>
                            <label htmlFor="classroom_code" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-gray-400" />
                                    Código del Aula (Automático)
                                </div>
                            </label>
                            <input
                                id="classroom_code"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
                                value={formData.classroom_code}
                                placeholder="Se genera automáticamente"
                                readOnly
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Formato: AUL-[Grado][Paralelo][Jornada] (ej: AUL-9CM para 9no C Matutina)
                            </p>
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
                            disabled={createMutation.isPending}
                            className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Aula
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateClassroom;
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Heart, Camera, AlertCircle } from 'lucide-react';

const PhysicalMedicalStep = ({ data, updateData, onNext, onBack, isFirstStep, isLastStep }) => {
    const [formData, setFormData] = useState({
        blood_type: data.blood_type || '',
        weight: data.weight || '',
        height: data.height || '',
        photo: data.photo || ''
    });

    const [errors, setErrors] = useState({});

    // Sincronizar datos cuando sea necesario
    const syncDataToParent = useCallback(() => {
        updateData(formData);
    }, [formData, updateData]);

    // Sincronizar datos cuando se monta el componente
    useEffect(() => {
        syncDataToParent();
    }, []);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error del campo cuando el usuario empiece a escribir
        setErrors(prev => {
            if (prev[field]) {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            }
            return prev;
        });
    }, []);

    const validateForm = () => {
        const newErrors = {};

        // Validaciones opcionales pero con formato
        if (formData.weight && (isNaN(formData.weight) || parseFloat(formData.weight) <= 0 || parseFloat(formData.weight) > 200)) {
            newErrors.weight = 'El peso debe ser un número válido entre 1 y 200 kg';
        }

        if (formData.height && (isNaN(formData.height) || parseFloat(formData.height) <= 0 || parseFloat(formData.height) > 250)) {
            newErrors.height = 'La altura debe ser un número válido entre 1 y 250 cm';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            syncDataToParent();
            onNext();
        }
    };

    const bloodTypes = [
        { value: '', label: 'Seleccionar tipo de sangre' },
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' }
    ];

    return (
        <div className="space-y-8">
            {/* Sección: Información Médica */}
            <div className="space-y-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                <div className="flex items-center space-x-3 pb-4 border-b border-red-200">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                        <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Información Médica</h3>
                        <p className="text-sm text-gray-600">Datos médicos básicos del estudiante</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
                            Tipo de Sangre
                        </label>
                        <select
                            id="blood_type"
                            name="blood_type"
                            value={formData.blood_type || ''}
                            onChange={(e) => handleInputChange('blood_type', e.target.value)}
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.blood_type ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        >
                            {bloodTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">Información importante para emergencias médicas</p>
                        {errors.blood_type && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.blood_type}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                            Peso (kg)
                        </label>
                        <input
                            type="number"
                            id="weight"
                            name="weight"
                            value={formData.weight || ''}
                            onChange={(e) => handleInputChange('weight', e.target.value)}
                            placeholder="ej: 45.5"
                            min="1"
                            max="200"
                            step="0.1"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.weight ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        <p className="text-xs text-gray-500">Peso en kilogramos (opcional)</p>
                        {errors.weight && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.weight}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                            Altura (cm)
                        </label>
                        <input
                            type="number"
                            id="height"
                            name="height"
                            value={formData.height || ''}
                            onChange={(e) => handleInputChange('height', e.target.value)}
                            placeholder="ej: 165"
                            min="1"
                            max="250"
                            step="0.1"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.height ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        <p className="text-xs text-gray-500">Altura en centímetros (opcional)</p>
                        {errors.height && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.height}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Sección: Fotografía */}
            <div className="space-y-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <div className="flex items-center space-x-3 pb-4 border-b border-indigo-200">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg">
                        <Camera className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Fotografía del Estudiante</h3>
                        <p className="text-sm text-gray-600">Foto para identificación del estudiante</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                            Archivo de Foto
                        </label>
                        <input
                            type="file"
                            id="photo"
                            name="photo"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    // En un caso real, aquí subirías el archivo al servidor
                                    // Por ahora solo guardamos el nombre del archivo
                                    handleInputChange('photo', file.name);
                                }
                            }}
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.photo ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        <p className="text-xs text-gray-500">Formatos permitidos: JPG, PNG, GIF (máximo 5MB)</p>
                        {formData.photo && (
                            <p className="text-xs text-green-600">
                                ✓ Archivo seleccionado: {formData.photo}
                            </p>
                        )}
                        {errors.photo && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.photo}
                            </p>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-blue-900">Recomendaciones para la fotografía</h4>
                                <div className="mt-2 text-sm text-blue-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Foto tipo carnet, fondo claro</li>
                                        <li>Rostro visible y centrado</li>
                                        <li>Buena iluminación y calidad</li>
                                        <li>Sin objetos que obstruyan el rostro</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                    onClick={() => {
                        syncDataToParent();
                        onBack();
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                </button>

                <button
                    onClick={handleNext}
                    className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                </button>
            </div>
        </div>
    );
};

export default PhysicalMedicalStep;
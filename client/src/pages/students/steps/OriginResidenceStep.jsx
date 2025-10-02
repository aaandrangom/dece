import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Globe, MapPin, AlertCircle, Upload, Image } from 'lucide-react';

const OriginResidenceStep = ({ data, updateData, onNext, onBack, isFirstStep, isLastStep }) => {
    const [formData, setFormData] = useState({
        nationality: data.nationality || 'Ecuatoriana',
        foreign_student: data.foreign_student || false,
        country_origin: data.country_origin || '',
        passport_dni: data.passport_dni || '',
        province_origin: data.province_origin || '',
        canton_origin: data.canton_origin || '',
        address: data.address || '',
        map_file: data.map_file || null,
        parents_together: data.parents_together !== undefined ? data.parents_together : null
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

        // Validaciones básicas
        if (!formData.nationality.trim()) {
            newErrors.nationality = 'La nacionalidad es obligatoria';
        }

        // Validaciones para estudiantes extranjeros
        if (formData.foreign_student) {
            if (!formData.country_origin.trim()) {
                newErrors.country_origin = 'El país de origen es obligatorio para estudiantes extranjeros';
            }
            if (!formData.passport_dni.trim()) {
                newErrors.passport_dni = 'El pasaporte/DNI es obligatorio para estudiantes extranjeros';
            }
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

    return (
        <div className="space-y-8">
            {/* Sección: Nacionalidad y Origen */}
            <div className="space-y-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3 pb-4 border-b border-blue-200">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                        <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Nacionalidad y Origen</h3>
                        <p className="text-sm text-gray-600">Información sobre nacionalidad y procedencia</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1">
                        <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                            Nacionalidad
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            id="nationality"
                            name="nationality"
                            value={formData.nationality || ''}
                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                            placeholder="Selecciona o escribe la nacionalidad"
                            list="nationality-options"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.nationality ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        <datalist id="nationality-options">
                            <option value="Ecuatoriana" />
                            <option value="Colombiana" />
                            <option value="Peruana" />
                            <option value="Venezolana" />
                            <option value="Argentina" />
                            <option value="Brasileña" />
                            <option value="Chilena" />
                            <option value="Estadounidense" />
                            <option value="Española" />
                            <option value="Mexicana" />
                            <option value="Francesa" />
                            <option value="Alemana" />
                            <option value="Italiana" />
                            <option value="Canadiense" />
                        </datalist>
                        {errors.nationality && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.nationality}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">Puedes seleccionar de la lista o escribir otra nacionalidad</p>
                    </div>

                    <div className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            id="foreign_student"
                            name="foreign_student"
                            checked={formData.foreign_student || false}
                            onChange={(e) => handleInputChange('foreign_student', e.target.checked)}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                            <label htmlFor="foreign_student" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Estudiante Extranjero
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                                Marque esta opción si el estudiante no es de nacionalidad ecuatoriana o requiere documentación especial
                            </p>
                        </div>
                    </div>

                    {formData.foreign_student && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                            <div className="space-y-1">
                                <label htmlFor="country_origin" className="block text-sm font-medium text-gray-700">
                                    País de Origen
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="country_origin"
                                    name="country_origin"
                                    value={formData.country_origin || ''}
                                    onChange={(e) => handleInputChange('country_origin', e.target.value)}
                                    placeholder="País de procedencia"
                                    className={`
                                        w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                        ${errors.country_origin ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                                    `}
                                />
                                {errors.country_origin && (
                                    <p className="text-xs text-red-600 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors.country_origin}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="passport_dni" className="block text-sm font-medium text-gray-700">
                                    Pasaporte/DNI
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="passport_dni"
                                    name="passport_dni"
                                    value={formData.passport_dni || ''}
                                    onChange={(e) => handleInputChange('passport_dni', e.target.value)}
                                    placeholder="Número de pasaporte o DNI"
                                    className={`
                                        w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                        ${errors.passport_dni ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                                    `}
                                />
                                <p className="text-xs text-gray-500">Documento de identificación del país de origen</p>
                                {errors.passport_dni && (
                                    <p className="text-xs text-red-600 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors.passport_dni}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sección: Información de Residencia */}
            <div className="space-y-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-center space-x-3 pb-4 border-b border-green-200">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Información de Residencia</h3>
                        <p className="text-sm text-gray-600">Lugar de procedencia y datos de ubicación actual</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label htmlFor="province_origin" className="block text-sm font-medium text-gray-700">
                            Provincia de Origen
                        </label>
                        <input
                            type="text"
                            id="province_origin"
                            name="province_origin"
                            value={formData.province_origin || ''}
                            onChange={(e) => handleInputChange('province_origin', e.target.value)}
                            placeholder="Provincia donde nació o reside"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.province_origin ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        {errors.province_origin && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.province_origin}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="canton_origin" className="block text-sm font-medium text-gray-700">
                            Cantón de Origen
                        </label>
                        <input
                            type="text"
                            id="canton_origin"
                            name="canton_origin"
                            value={formData.canton_origin || ''}
                            onChange={(e) => handleInputChange('canton_origin', e.target.value)}
                            placeholder="Cantón donde nació o reside"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.canton_origin ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        {errors.canton_origin && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.canton_origin}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Dirección de Residencia
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Dirección completa donde reside actualmente"
                        rows={3}
                        className={`
                            w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none
                            ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                        `}
                    />
                    <p className="text-xs text-gray-500">Incluya calle, número, barrio, ciudad</p>
                    {errors.address && (
                        <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.address}
                        </p>
                    )}
                </div>

                {/* Campo para Croquis de la Dirección */}
                <div className="space-y-1">
                    <label htmlFor="map_file" className="block text-sm font-medium text-gray-700">
                        Croquis de la Dirección
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            id="map_file"
                            name="map_file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                handleInputChange('map_file', file);
                            }}
                            className="hidden"
                        />
                        <label
                            htmlFor="map_file"
                            className={`
                                flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                                ${formData.map_file 
                                    ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {formData.map_file ? (
                                    <>
                                        <Image className="w-8 h-8 mb-2 text-green-500" />
                                        <p className="mb-2 text-sm text-green-700">
                                            <span className="font-semibold">Archivo seleccionado:</span>
                                        </p>
                                        <p className="text-xs text-green-600 truncate max-w-xs">
                                            {formData.map_file.name}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Haz clic para subir</span> el croquis
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                    <p className="text-xs text-gray-500">
                        Sube una imagen o dibujo que muestre cómo llegar a la dirección de residencia del estudiante
                    </p>
                    {errors.map_file && (
                        <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.map_file}
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Situación Familiar
                        </label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    id="parents_together_yes"
                                    name="parents_together"
                                    checked={formData.parents_together === true}
                                    onChange={() => handleInputChange('parents_together', true)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                />
                                <label htmlFor="parents_together_yes" className="text-sm text-gray-700 cursor-pointer">
                                    Los padres viven juntos
                                </label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    id="parents_together_no"
                                    name="parents_together"
                                    checked={formData.parents_together === false}
                                    onChange={() => handleInputChange('parents_together', false)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                />
                                <label htmlFor="parents_together_no" className="text-sm text-gray-700 cursor-pointer">
                                    Los padres viven separados
                                </label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    id="parents_together_unknown"
                                    name="parents_together"
                                    checked={formData.parents_together === null}
                                    onChange={() => handleInputChange('parents_together', null)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                />
                                <label htmlFor="parents_together_unknown" className="text-sm text-gray-700 cursor-pointer">
                                    No especificar / No aplica
                                </label>
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

export default OriginResidenceStep;
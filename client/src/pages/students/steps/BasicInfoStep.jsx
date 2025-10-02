import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, User, Phone, AlertCircle } from 'lucide-react';

const BasicInfoStep = ({ data, updateData, onNext, onBack, isFirstStep, isLastStep }) => {
    const [formData, setFormData] = useState({
        id_number: data.id_number || '',
        last_name: data.last_name || '',
        first_name: data.first_name || '',
        email: data.email || '',
        birth_date: data.birth_date || '',
        phone: data.phone || '',
        phone_alt: data.phone_alt || ''
    });

    const [errors, setErrors] = useState({});
    const [age, setAge] = useState(null);

    // Calcular edad cuando cambia la fecha de nacimiento
    useEffect(() => {
        if (formData.birth_date) {
            const birthDate = new Date(formData.birth_date);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            
            setAge(calculatedAge >= 0 ? calculatedAge : null);
        } else {
            setAge(null);
        }
    }, [formData.birth_date]);

    // Sincronizar datos cuando sea necesario
    const syncDataToParent = useCallback(() => {
        updateData({ ...formData, age });
    }, [formData, age]);

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

        // Validaciones requeridas
        if (!formData.id_number.trim()) {
            newErrors.id_number = 'El número de identificación es obligatorio';
        } else if (formData.id_number.length < 10) {
            newErrors.id_number = 'El número de identificación debe tener al menos 10 caracteres';
        }

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'Los nombres son obligatorios';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Los apellidos son obligatorios';
        }

        if (!formData.birth_date) {
            newErrors.birth_date = 'La fecha de nacimiento es obligatoria';
        } else if (age !== null && (age < 3 || age > 25)) {
            newErrors.birth_date = 'La edad debe estar entre 3 y 25 años';
        }

        // Validación de email si se proporciona
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El formato del email no es válido';
        }

        // Validación de teléfonos si se proporcionan
        const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            newErrors.phone = 'El formato del teléfono no es válido';
        }

        if (formData.phone_alt && !phoneRegex.test(formData.phone_alt)) {
            newErrors.phone_alt = 'El formato del teléfono alternativo no es válido';
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
            {/* Sección: Información Personal */}
            <div className="space-y-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-center space-x-3 pb-4 border-b border-purple-200">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                        <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                        <p className="text-sm text-gray-600">Datos básicos de identificación del estudiante</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label htmlFor="id_number" className="block text-sm font-medium text-gray-700">
                            Número de Identificación
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            id="id_number"
                            name="id_number"
                            value={formData.id_number || ''}
                            onChange={(e) => handleInputChange('id_number', e.target.value)}
                            placeholder="Ingrese cédula, pasaporte o documento"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.id_number ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        <p className="text-xs text-gray-500">Cédula de identidad, pasaporte o documento de identificación</p>
                        {errors.id_number && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.id_number}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                            Fecha de Nacimiento
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="date"
                            id="birth_date"
                            name="birth_date"
                            value={formData.birth_date || ''}
                            onChange={(e) => handleInputChange('birth_date', e.target.value)}
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.birth_date ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        {errors.birth_date && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.birth_date}
                            </p>
                        )}
                    </div>
                    
                    {age !== null && (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Edad</label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
                                {age} años
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                            Nombres
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name || ''}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            placeholder="Nombres completos"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        {errors.first_name && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.first_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                            Apellidos
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name || ''}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                            placeholder="Apellidos completos"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        {errors.last_name && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.last_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="estudiante@email.com (opcional)"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        <p className="text-xs text-gray-500">Correo electrónico del estudiante (opcional)</p>
                        {errors.email && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.email}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Sección: Información de Contacto */}
            <div className="space-y-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3 pb-4 border-b border-blue-200">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                        <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
                        <p className="text-sm text-gray-600">Teléfonos y medios de contacto del estudiante</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Teléfono Principal
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="0999123456"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        <p className="text-xs text-gray-500">Número principal de contacto</p>
                        {errors.phone && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="phone_alt" className="block text-sm font-medium text-gray-700">
                            Teléfono Alternativo
                        </label>
                        <input
                            type="tel"
                            id="phone_alt"
                            name="phone_alt"
                            value={formData.phone_alt || ''}
                            onChange={(e) => handleInputChange('phone_alt', e.target.value)}
                            placeholder="0987654321 (opcional)"
                            className={`
                                w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors
                                ${errors.phone_alt ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                            `}
                        />
                        <p className="text-xs text-gray-500">Número secundario de contacto (opcional)</p>
                        {errors.phone_alt && (
                            <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.phone_alt}
                            </p>
                        )}
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
                    {isFirstStep ? 'Cancelar' : 'Anterior'}
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

export default BasicInfoStep;
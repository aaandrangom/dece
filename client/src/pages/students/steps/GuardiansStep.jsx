import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, Plus, Trash2, Users, AlertCircle, Edit, X, User } from 'lucide-react';

const GuardiansStep = ({ data, updateData, onNext, onBack, isFirstStep, isLastStep }) => {
    const [formData, setFormData] = useState({
        guardians: data.guardians || [
            {
                type: 'FATHER',
                id_number: '',
                first_name: '',
                last_name: '',
                birth_date: '',
                education: '',
                profession: '',
                workplace: '',
                phone: '',
                phone_alt: '',
                relationship: 'Padre',
                legal_document: '',
                lives_with_student: true
            },
            {
                type: 'MOTHER',
                id_number: '',
                first_name: '',
                last_name: '',
                birth_date: '',
                education: '',
                profession: '',
                workplace: '',
                phone: '',
                phone_alt: '',
                relationship: 'Madre',
                legal_document: '',
                lives_with_student: true
            }
        ]
    });

    const [errors, setErrors] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);

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

    const addGuardian = () => {
        const newGuardian = {
            type: 'LEGAL_REPRESENTATIVE',
            id_number: '',
            first_name: '',
            last_name: '',
            birth_date: '',
            education: '',
            profession: '',
            workplace: '',
            phone: '',
            phone_alt: '',
            relationship: 'Representante Legal',
            legal_document: '',
            lives_with_student: false
        };
        
        setFormData(prev => ({
            ...prev,
            guardians: [...prev.guardians, newGuardian]
        }));
    };

    const removeGuardian = (index) => {
        if (formData.guardians.length > 1) {
            setFormData(prev => ({
                ...prev,
                guardians: prev.guardians.filter((_, i) => i !== index)
            }));
            setEditingIndex(null);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let hasValidGuardian = false;

        formData.guardians.forEach((guardian, index) => {
            // Al menos un guardian debe tener información básica
            const hasBasicInfo = guardian.first_name.trim() || guardian.last_name.trim() || guardian.phone.trim();
            
            if (hasBasicInfo) {
                hasValidGuardian = true;
                
                // Si tiene información básica, validar campos requeridos
                if (!guardian.first_name.trim()) {
                    newErrors[`${index}.first_name`] = 'Los nombres son obligatorios';
                }
                if (!guardian.last_name.trim()) {
                    newErrors[`${index}.last_name`] = 'Los apellidos son obligatorios';
                }
                if (!guardian.phone.trim()) {
                    newErrors[`${index}.phone`] = 'El teléfono es obligatorio';
                }
                if (!guardian.relationship.trim()) {
                    newErrors[`${index}.relationship`] = 'La relación es obligatoria';
                }
            }
        });

        if (!hasValidGuardian) {
            newErrors.general = 'Debe registrar al menos un representante/tutor con información básica';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            syncDataToParent();
            // Aquí se implementaría el envío final del formulario completo
            console.log('Formulario completo:', { ...data, ...formData });
            alert('¡Estudiante registrado exitosamente! (Esta es una simulación)');
        }
    };

    const getGuardianTypeLabel = (type) => {
        const types = {
            'FATHER': 'Padre',
            'MOTHER': 'Madre',
            'LEGAL_REPRESENTATIVE': 'Representante Legal'
        };
        return types[type] || type;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                        <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Representantes y Tutores Legales</h2>
                        <p className="text-sm text-gray-600">Información de padres y representantes del estudiante</p>
                    </div>
                </div>

                {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {errors.general}
                        </p>
                    </div>
                )}
            </div>

            {/* Guardians List */}
            <div className="space-y-6">
                {formData.guardians.map((guardian, index) => {
                    const isEditing = editingIndex === index;
                    const hasData = guardian.first_name || guardian.last_name || guardian.phone;

                    return (
                        <div key={`guardian-${index}`} className={`p-6 rounded-lg border-2 transition-all ${
                            hasData 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 bg-gray-50'
                        }`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                                        hasData ? 'bg-green-100' : 'bg-gray-100'
                                    }`}>
                                        <User className={`h-5 w-5 ${hasData ? 'text-green-600' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {getGuardianTypeLabel(guardian.type)}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {hasData ? `${guardian.first_name} ${guardian.last_name}`.trim() || 'Sin nombre' : 'Sin información'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setEditingIndex(isEditing ? null : index)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isEditing 
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                        }`}
                                    >
                                        {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                                    </button>
                                    {formData.guardians.length > 2 && (
                                        <button
                                            onClick={() => removeGuardian(index)}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    {/* Información básica */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_first_name`} className="block text-sm font-medium text-gray-700">
                                                Nombres
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id={`guardian_${index}_first_name`}
                                                name={`guardian_${index}_first_name`}
                                                value={guardian.first_name || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        first_name: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                    
                                                    // Limpiar error
                                                    const errorKey = `${index}.first_name`;
                                                    if (errors[errorKey]) {
                                                        setErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors[errorKey];
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                placeholder="Nombres completos"
                                                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                                                    errors[`${index}.first_name`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                            {errors[`${index}.first_name`] && (
                                                <p className="text-xs text-red-600 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors[`${index}.first_name`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_last_name`} className="block text-sm font-medium text-gray-700">
                                                Apellidos
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id={`guardian_${index}_last_name`}
                                                name={`guardian_${index}_last_name`}
                                                value={guardian.last_name || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        last_name: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                    
                                                    // Limpiar error
                                                    const errorKey = `${index}.last_name`;
                                                    if (errors[errorKey]) {
                                                        setErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors[errorKey];
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                placeholder="Apellidos completos"
                                                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                                                    errors[`${index}.last_name`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                            {errors[`${index}.last_name`] && (
                                                <p className="text-xs text-red-600 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors[`${index}.last_name`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_id_number`} className="block text-sm font-medium text-gray-700">
                                                Cédula/ID
                                            </label>
                                            <input
                                                type="text"
                                                id={`guardian_${index}_id_number`}
                                                name={`guardian_${index}_id_number`}
                                                value={guardian.id_number || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        id_number: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                }}
                                                placeholder="Número de identificación"
                                                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_birth_date`} className="block text-sm font-medium text-gray-700">
                                                Fecha de Nacimiento
                                            </label>
                                            <input
                                                type="date"
                                                id={`guardian_${index}_birth_date`}
                                                name={`guardian_${index}_birth_date`}
                                                value={guardian.birth_date || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        birth_date: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_phone`} className="block text-sm font-medium text-gray-700">
                                                Teléfono
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id={`guardian_${index}_phone`}
                                                name={`guardian_${index}_phone`}
                                                value={guardian.phone || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        phone: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                    
                                                    // Limpiar error
                                                    const errorKey = `${index}.phone`;
                                                    if (errors[errorKey]) {
                                                        setErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors[errorKey];
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                placeholder="0999123456"
                                                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                                                    errors[`${index}.phone`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                            {errors[`${index}.phone`] && (
                                                <p className="text-xs text-red-600 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors[`${index}.phone`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_phone_alt`} className="block text-sm font-medium text-gray-700">
                                                Teléfono Alternativo
                                            </label>
                                            <input
                                                type="tel"
                                                id={`guardian_${index}_phone_alt`}
                                                name={`guardian_${index}_phone_alt`}
                                                value={guardian.phone_alt || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        phone_alt: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                }}
                                                placeholder="0987654321"
                                                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_relationship`} className="block text-sm font-medium text-gray-700">
                                                Relación
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id={`guardian_${index}_relationship`}
                                                name={`guardian_${index}_relationship`}
                                                value={guardian.relationship || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        relationship: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                    
                                                    // Limpiar error
                                                    const errorKey = `${index}.relationship`;
                                                    if (errors[errorKey]) {
                                                        setErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors[errorKey];
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                placeholder="ej: Padre, Madre, Tío, Abuela"
                                                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                                                    errors[`${index}.relationship`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                            {errors[`${index}.relationship`] && (
                                                <p className="text-xs text-red-600 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors[`${index}.relationship`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_education`} className="block text-sm font-medium text-gray-700">
                                                Educación
                                            </label>
                                            <input
                                                type="text"
                                                id={`guardian_${index}_education`}
                                                name={`guardian_${index}_education`}
                                                value={guardian.education || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        education: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                }}
                                                placeholder="ej: Primaria, Secundaria, Superior"
                                                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_profession`} className="block text-sm font-medium text-gray-700">
                                                Profesión
                                            </label>
                                            <input
                                                type="text"
                                                id={`guardian_${index}_profession`}
                                                name={`guardian_${index}_profession`}
                                                value={guardian.profession || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        profession: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                }}
                                                placeholder="ej: Docente, Comerciante, Empleado"
                                                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_workplace`} className="block text-sm font-medium text-gray-700">
                                                Lugar de Trabajo
                                            </label>
                                            <input
                                                type="text"
                                                id={`guardian_${index}_workplace`}
                                                name={`guardian_${index}_workplace`}
                                                value={guardian.workplace || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        workplace: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                }}
                                                placeholder="Empresa o lugar donde trabaja"
                                                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor={`guardian_${index}_legal_document`} className="block text-sm font-medium text-gray-700">
                                                Documento Legal
                                            </label>
                                            <input
                                                type="text"
                                                id={`guardian_${index}_legal_document`}
                                                name={`guardian_${index}_legal_document`}
                                                value={guardian.legal_document || ''}
                                                onChange={(e) => {
                                                    const newGuardians = [...formData.guardians];
                                                    newGuardians[index] = {
                                                        ...newGuardians[index],
                                                        legal_document: e.target.value
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        guardians: newGuardians
                                                    }));
                                                }}
                                                placeholder="Documento que acredita la tutela"
                                                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id={`lives_with_student_${index}`}
                                            name={`guardian_${index}_lives_with_student`}
                                            checked={guardian.lives_with_student || false}
                                            onChange={(e) => {
                                                const newGuardians = [...formData.guardians];
                                                newGuardians[index] = {
                                                    ...newGuardians[index],
                                                    lives_with_student: e.target.checked
                                                };
                                                setFormData(prev => ({
                                                    ...prev,
                                                    guardians: newGuardians
                                                }));
                                            }}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`lives_with_student_${index}`} className="text-sm text-gray-700 cursor-pointer">
                                            Vive con el estudiante
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600">
                                    {hasData ? (
                                        <div className="space-y-1">
                                            {guardian.phone && <p><strong>Teléfono:</strong> {guardian.phone}</p>}
                                            {guardian.relationship && <p><strong>Relación:</strong> {guardian.relationship}</p>}
                                            {guardian.profession && <p><strong>Profesión:</strong> {guardian.profession}</p>}
                                            <p><strong>Vive con estudiante:</strong> {guardian.lives_with_student ? 'Sí' : 'No'}</p>
                                        </div>
                                    ) : (
                                        <p className="italic">Haga clic en editar para agregar información</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Guardian Button */}
            <div className="flex justify-center">
                <button
                    onClick={addGuardian}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Representante Legal
                </button>
            </div>

            {/* Navigation Buttons */}
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
                    onClick={handleSubmit}
                    className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                    <Check className="h-4 w-4 mr-2" />
                    Registrar Estudiante
                </button>
            </div>
        </div>
    );
};

export default GuardiansStep;
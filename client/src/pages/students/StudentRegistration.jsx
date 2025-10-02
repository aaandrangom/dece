import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check, Users, FileText, Phone, MapPin, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BasicInfoStep from './steps/BasicInfoStep';
import OriginResidenceStep from './steps/OriginResidenceStep';
import PhysicalMedicalStep from './steps/PhysicalMedicalStep';
import GuardiansStep from './steps/GuardiansStep';

// Configuración de los steps
const STEPS = [
    {
        id: 1,
        title: 'Información Personal',
        subtitle: 'Datos básicos y contacto del estudiante',
        icon: Users,
        component: BasicInfoStep
    },
    {
        id: 2,
        title: 'Origen y Residencia',
        subtitle: 'Nacionalidad, ubicación y dirección',
        icon: MapPin,
        component: OriginResidenceStep
    },
    {
        id: 3,
        title: 'Información Física',
        subtitle: 'Datos médicos y características físicas',
        icon: Heart,
        component: PhysicalMedicalStep
    },
    {
        id: 4,
        title: 'Representantes Legales',
        subtitle: 'Padres y tutores del estudiante',
        icon: Users,
        component: GuardiansStep
    }
];

const StudentRegistration = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Información Personal y Contacto
        id_number: '',
        last_name: '',
        first_name: '',
        email: '',
        birth_date: '',
        phone: '',
        phone_alt: '',
        
        // Step 2: Origen y Residencia
        nationality: '',
        foreign_student: false,
        country_origin: '',
        passport_dni: '',
        province_origin: '',
        canton_origin: '',
        address: '',
        map_file: '',
        parents_together: null,
        
        // Step 3: Información Física y Médica
        blood_type: '',
        weight: '',
        height: '',
        photo: '',
        
        // Step 4: Representantes/Tutores
        guardians: [
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

    const currentStepConfig = STEPS.find(step => step.id === currentStep);
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === STEPS.length;

    const handleBack = () => {
        if (isFirstStep) {
            navigate('/students/management'); // Navegar de vuelta a la página principal
        } else {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleStepClick = (stepId) => {
        // Permitir navegar solo a steps anteriores o al siguiente inmediato
        if (stepId <= currentStep) {
            setCurrentStep(stepId);
        }
    };

    const updateFormData = useCallback((stepData) => {
        setFormData(prev => ({
            ...prev,
            ...stepData
        }));
    }, []);

    const handleSubmit = () => {
        // Aquí se implementará el envío final del formulario
        console.log('Datos finales:', formData);
        // Implementar lógica de envío
    };

    const StepComponent = currentStepConfig?.component;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {isFirstStep ? 'Volver' : 'Anterior'}
                            </button>
                            
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Registro de Estudiante
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {currentStepConfig?.subtitle}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                Paso {currentStep} de {STEPS.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <div className="flex items-center justify-between">
                            {STEPS.map((step, index) => {
                                const isActive = step.id === currentStep;
                                const isCompleted = step.id < currentStep;
                                const isClickable = step.id <= currentStep;
                                const IconComponent = step.icon;

                                return (
                                    <React.Fragment key={step.id}>
                                        <div className="flex flex-col items-center flex-1">
                                            <button
                                                onClick={() => handleStepClick(step.id)}
                                                disabled={!isClickable}
                                                className={`
                                                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                                                    ${isActive 
                                                        ? 'bg-purple-600 border-purple-600 text-white' 
                                                        : isCompleted 
                                                        ? 'bg-green-500 border-green-500 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-400'
                                                    }
                                                    ${isClickable && !isActive ? 'hover:border-purple-400 hover:text-purple-600 cursor-pointer' : ''}
                                                    ${!isClickable ? 'cursor-not-allowed' : ''}
                                                `}
                                            >
                                                {isCompleted ? (
                                                    <Check className="h-5 w-5" />
                                                ) : (
                                                    <IconComponent className="h-5 w-5" />
                                                )}
                                            </button>
                                            
                                            <div className="mt-2 text-center">
                                                <p className={`text-xs font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {step.title}
                                                </p>
                                            </div>
                                        </div>

                                        {index < STEPS.length - 1 && (
                                            <div className="flex-1 mx-4">
                                                <div className={`h-0.5 ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                                <currentStepConfig.icon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {currentStepConfig?.title}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {currentStepConfig?.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {StepComponent ? (
                            <StepComponent
                                data={formData}
                                updateData={updateFormData}
                                onNext={handleNext}
                                onBack={handleBack}
                                isFirstStep={isFirstStep}
                                isLastStep={isLastStep}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <currentStepConfig.icon className="h-12 w-12 mx-auto" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {currentStepConfig?.title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Este paso está en desarrollo y se implementará próximamente.
                                </p>
                                <div className="flex justify-center space-x-4">
                                    {!isFirstStep && (
                                        <button
                                            onClick={handleBack}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Anterior
                                        </button>
                                    )}
                                    {!isLastStep && (
                                        <button
                                            onClick={handleNext}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Siguiente
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRegistration;
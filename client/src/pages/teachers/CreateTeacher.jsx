import React from 'react';
import { ArrowLeft, User, Mail, Phone, IdCard, Save, AlertCircle, Loader2, CheckCircle, XCircle, Upload, Download, FileSpreadsheet, Info, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateTeacher, useValidateExcel, useImportValidatedTeachers } from '../../hooks/useTeachers';
import { showSuccessToast, showErrorToast } from '../../config/toast';

const CreateTeacher = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = React.useState({
        id_number: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        phone_alt: '',
        active: true
    });

    // Estados para importación de Excel
    const [importMode, setImportMode] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [importError, setImportError] = React.useState('');
    const [validationResult, setValidationResult] = React.useState(null);
    const [isProcessingFile, setIsProcessingFile] = React.useState(false);

    const [formError, setFormError] = React.useState('');

    // Hooks para datos y mutación
    const createMutation = useCreateTeacher();
    const validateExcelMutation = useValidateExcel();
    const importTeachersMutation = useImportValidatedTeachers();

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

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'cedula': '1234567890',
                'nombres': 'Juan Carlos',
                'apellidos': 'Pérez González',
                'email': 'juan.perez@ejemplo.com',
                'telefono': '0987654321',
                'convencional': '042123456'
            },
            {
                'cedula': '0987654321',
                'nombres': 'María Elena',
                'apellidos': 'García López',
                'email': 'maria.garcia@ejemplo.com',
                'telefono': '0912345678',
                'convencional': '042123457'
            }
        ];

        const headers = Object.keys(templateData[0]);
        const csvContent = [
            headers.join(','),
            ...templateData.map(row =>
                headers.map(header => {
                    const value = row[header];
                    return value.includes(',') || value.includes(' ') ? `"${value}"` : value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'plantilla_docentes.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImportError('');
            setValidationResult(null);
            validateFile(file);
        }
    };

    // Función para validar el archivo con el backend
    const validateFile = async (file) => {
        setIsProcessingFile(true);
        setImportError('');

        try {
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
                throw new Error('Formato de archivo no válido. Solo se permiten archivos CSV, XLSX o XLS.');
            }

            // Llamar al endpoint de validación
            const result = await validateExcelMutation.mutateAsync({
                file: file,
                institutionId: 1
            });

            console.log('📋 Resultado de validación:', result);

            // El backend siempre retorna la estructura con success y data
            if (result.data) {
                setValidationResult(result.data);

                // Si hay errores, mostrar mensaje informativo (no como error)
                if (result.data.summary.canImport === false) {
                    setImportError(''); // Limpiar error, no es realmente un error sino información
                } else {
                    setImportError(''); // Archivo completamente válido
                }
            }

        } catch (error) {
            console.error('Error validating file:', error);

            // Verificar si el error tiene response data (status 400 con datos de validación)
            if (error?.response?.status === 400 && error?.response?.data?.data) {
                // Es un response 400 con datos de validación, no un error real
                console.log('📋 Validación con errores (400):', error.response.data);
                setValidationResult(error.response.data.data);
                setImportError(''); // No mostrar como error
            } else {
                // Es un error real (network, server 500, etc.)
                let errorMessage = 'Error al validar el archivo. Inténtalo de nuevo.';

                if (error?.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error?.message) {
                    errorMessage = error.message;
                }

                setImportError(errorMessage);
                setValidationResult(null);
            }
        } finally {
            setIsProcessingFile(false);
        }
    };

    // Función para limpiar la importación
    const handleClearImport = () => {
        setSelectedFile(null);
        setValidationResult(null);
        setImportError('');
        const fileInput = document.getElementById('excel-file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    };const handleSave = () => {
    setFormError('');

    if (importMode) {
        // Modo de importación masiva
        if (!validationResult?.validTeachers || validationResult.validTeachers.length === 0) {
            setFormError('No hay registros válidos para importar. Por favor selecciona un archivo válido.');
            return;
        }

        if (validationResult.summary.canImport === false) {
            setFormError('El archivo contiene errores que deben corregirse antes de importar.');
            return;
        }

        // Procesar importación masiva
        console.log('📦 Importando docentes:', validationResult.validTeachers);

        importTeachersMutation.mutate({
            validTeachers: validationResult.validTeachers,
            institutionId: 1
        }, {
            onSuccess: (response) => {
                showSuccessToast(
                    `Se importaron ${validationResult.validTeachers.length} docentes exitosamente`,
                    {
                        description: 'Todos los docentes han sido registrados en el sistema'
                    }
                );

                // Navegar de vuelta a la lista de docentes
                navigate('/teachers/list');
            },
            onError: (error) => {
                console.error('Error al importar docentes:', error);

                let errorMessage = 'Error al importar los docentes. Inténtalo de nuevo.';

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

    } else {

        if (!formData.id_number.trim()) {
            setFormError('La cédula es obligatoria');
            return;
        }

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

        if (!formData.phone.trim()) {
            setFormError('El teléfono es obligatorio');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormError('El formato del email no es válido');
            return;
        }

        const payload = {
            institution_id: 1,
            ...formData
        };

        createMutation.mutate(payload, {
            onSuccess: (response) => {
                showSuccessToast(
                    response?.message || 'Docente creado correctamente',
                    {
                        description: 'El docente ha sido registrado exitosamente'
                    }
                );

                navigate('/teachers/list');
            },
            onError: (error) => {
                console.error('Error al crear docente:', error);

                let errorMessage = 'Error al crear el docente. Inténtalo de nuevo.';

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
    }
};

return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-fit"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
            </button>
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Crear Docente</h1>
                <p className="text-gray-600 mt-1">Registra un nuevo docente en el sistema</p>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-semibold text-purple-900">Información del Docente</h2>
                    <div className="ml-auto px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Nuevo
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <IdCard className="h-4 w-4 text-gray-400" />
                                Cédula *
                            </div>
                        </label>
                        <input
                            id="id_number"
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value={formData.id_number}
                            onChange={(e) => handleInputChange('id_number', e.target.value)}
                            placeholder="Ingresa la cédula"
                            required
                        />
                    </div>

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

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                Teléfono Principal *
                            </div>
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="0987654321"
                            required
                        />
                    </div>

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
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-indigo-900">Modo de Creación</h2>
                    <div className="ml-auto flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="creationMode"
                                className="w-4 h-4 text-indigo-600"
                                checked={!importMode}
                                onChange={() => setImportMode(false)}
                            />
                            <span className="text-sm font-medium text-indigo-900">Individual</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="creationMode"
                                className="w-4 h-4 text-indigo-600"
                                checked={importMode}
                                onChange={() => setImportMode(true)}
                            />
                            <span className="text-sm font-medium text-indigo-900">Importar Excel</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {importMode && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Upload className="h-6 w-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-green-900">Importar Docentes desde Excel</h2>
                        </div>
                        <button
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                            title="Descargar plantilla de ejemplo"
                        >
                            <Download className="h-4 w-4" />
                            Descargar Plantilla
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900 mb-2">Instrucciones para la importación:</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Descarga la plantilla haciendo clic en "Descargar Plantilla"</li>
                                    <li>• Llena los datos de los docentes en las columnas correspondientes</li>
                                    <li>• Guarda el archivo como CSV (separado por comas) o Excel (XLSX)</li>
                                    <li>• Los campos obligatorios son: cedula, nombres, apellidos, email, telefono</li>
                                    <li>• El campo convencional (teléfono fijo) es opcional</li>
                                    <li>• No modifiques los nombres de las columnas en el archivo</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <div className="text-center">
                            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                                <label htmlFor="excel-file-input" className="cursor-pointer">
                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                        Selecciona un archivo CSV o Excel
                                    </span>
                                    <span className="mt-1 block text-sm text-gray-500">
                                        Formatos soportados: CSV, XLSX, XLS
                                    </span>
                                </label>
                                <input
                                    id="excel-file-input"
                                    type="file"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileSelect}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('excel-file-input').click()}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
                                >
                                    <Upload className="h-4 w-4" />
                                    Seleccionar Archivo
                                </button>
                            </div>
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClearImport}
                                    className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                                    title="Quitar archivo"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {isProcessingFile && (
                        <div className="flex items-center justify-center py-6">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                <span className="text-gray-700">Procesando archivo...</span>
                            </div>
                        </div>
                    )}

                    {/* Mensaje de éxito cuando el archivo es completamente válido */}
                    {validationResult && validationResult.summary.canImport === true && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-green-900">Archivo válido y listo para importar</h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        Todos los registros han pasado la validación. Puedes proceder con la importación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensaje informativo cuando hay errores de validación */}
                    {validationResult && validationResult.summary.canImport === false && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-amber-900">Archivo procesado con observaciones</h4>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Se encontraron algunos errores que deben corregirse antes de importar.
                                        Revisa los detalles a continuación y corrige el archivo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error de importación (errores técnicos reales) */}
                    {importError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-900">Error técnico</h4>
                                    <p className="text-sm text-red-700 mt-1">{importError}</p>
                                </div>
                            </div>
                        </div>
                    )}                        {/* Resultados de validación */}
                    {validationResult && (
                        <div className="space-y-6">
                            {/* Resumen de validación */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-lg font-medium text-gray-900">Resumen de Validación</h4>
                                    {validationResult.summary.canImport ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Listo para importar
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Requiere correcciones
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-100 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{validationResult.totalRows}</div>
                                        <div className="text-sm text-blue-800">Total filas</div>
                                    </div>
                                    <div className="bg-green-100 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-green-600">{validationResult.validRows}</div>
                                        <div className="text-sm text-green-800">Registros válidos</div>
                                    </div>
                                    <div className="bg-red-100 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-red-600">{validationResult.errorRows}</div>
                                        <div className="text-sm text-red-800">Con errores</div>
                                    </div>
                                    <div className="bg-amber-100 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-amber-600">{validationResult.summary.duplicatesInExcel}</div>
                                        <div className="text-sm text-amber-800">Duplicados</div>
                                    </div>
                                </div>
                            </div>

                            {/* Errores de validación mejorados */}
                            {validationResult.errors && validationResult.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <h4 className="text-xl font-medium text-red-900 mb-2">
                                                Errores encontrados ({validationResult.errors.length} filas con problemas)
                                            </h4>
                                            <p className="text-sm text-red-700">
                                                Corrige los siguientes errores en tu archivo Excel y vuelve a subirlo:
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {validationResult.errors.map((errorItem, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-red-400 shadow-sm">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Fila {errorItem.row}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {errorItem.errors.length} error{errorItem.errors.length !== 1 ? 'es' : ''}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {errorItem.errors.map((error, errorIndex) => (
                                                        <div key={errorIndex} className="bg-gray-50 rounded-md p-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Columna {error.column}
                                                                        </span>
                                                                        <span className="text-xs font-medium text-gray-600 uppercase">
                                                                            {error.field}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        <span className="text-gray-600">Valor actual:</span>
                                                                        <span className="ml-1 font-medium text-gray-900 bg-yellow-100 px-1 rounded">
                                                                            "{error.value}"
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div className="mb-2">
                                                                        <span className="text-xs font-medium text-red-600 uppercase">Problema:</span>
                                                                        <p className="text-sm text-red-700 mt-1">{error.error}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-xs font-medium text-green-600 uppercase">Solución:</span>
                                                                        <p className="text-sm text-green-700 mt-1">{error.suggestion}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <strong>Tip:</strong> Una vez corregidos todos los errores, vuelve a subir el archivo.
                                                Los {validationResult.validRows} registros válidos se importarán automáticamente.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}

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
                disabled={importMode
                    ? (importTeachersMutation.isPending || !validationResult?.summary?.canImport)
                    : createMutation.isPending
                }
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
            >
                {importMode
                    ? (importTeachersMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    ))
                    : (createMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    ))
                }
                {importMode
                    ? (importTeachersMutation.isPending ? 'Importando...' : 'Importar Docentes')
                    : (createMutation.isPending ? 'Creando...' : 'Crear Docente')
                }
            </button>
        </div>
    </div>
);
};

export default CreateTeacher;
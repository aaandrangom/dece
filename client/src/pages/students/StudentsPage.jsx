import React from 'react';
import { Plus, Users, BookOpen, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentsPage = () => {
    const navigate = useNavigate();

    const handleCreateStudent = () => {
        navigate('/students/management/register');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Users className="h-7 w-7 text-purple-600 mr-3" />
                                Gestión de Estudiantes
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Administrar el registro y listado de estudiantes de la institución
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Registro de Estudiantes */}
                    <div 
                        onClick={handleCreateStudent}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6 hover:shadow-md hover:from-purple-100 hover:to-purple-150 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <Plus className="h-6 w-6 text-purple-600" />
                            </div>
                            <span className="text-xs text-purple-600 font-medium uppercase tracking-wide">
                                Nuevo
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Registro de Estudiante
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Registrar un nuevo estudiante con información completa en pasos guiados
                        </p>
                        <div className="flex items-center text-purple-600 text-sm font-medium">
                            Comenzar registro
                            <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Listado de Estudiantes */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all cursor-pointer group opacity-60">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                                <Search className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                Próximamente
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Listado de Estudiantes
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Buscar, filtrar y gestionar todos los estudiantes registrados
                        </p>
                        <div className="flex items-center text-gray-400 text-sm font-medium">
                            En desarrollo...
                        </div>
                    </div>

                    {/* Reportes */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6 hover:shadow-md transition-all cursor-pointer group opacity-60">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                Próximamente
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Reportes y Estadísticas
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Generar reportes y ver estadísticas de estudiantes
                        </p>
                        <div className="flex items-center text-gray-400 text-sm font-medium">
                            En desarrollo...
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Sistema de Registro por Pasos
                            </h3>
                            <p className="text-gray-600 mb-4">
                                El nuevo sistema de registro de estudiantes está diseñado con una interfaz intuitiva 
                                dividida en pasos para facilitar el ingreso de información completa y organizada.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                    <div className="text-xs font-medium text-purple-900">Información Personal</div>
                                    <div className="text-xs text-purple-600">Paso 1</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="h-6 w-6 text-blue-600 mx-auto mb-2 flex items-center justify-center">🌍</div>
                                    <div className="text-xs font-medium text-blue-900">Origen y Residencia</div>
                                    <div className="text-xs text-blue-600">Paso 2</div>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <div className="h-6 w-6 text-red-600 mx-auto mb-2 flex items-center justify-center">❤️</div>
                                    <div className="text-xs font-medium text-red-900">Información Física</div>
                                    <div className="text-xs text-red-600">Paso 3</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                    <div className="text-xs font-medium text-green-900">Representantes</div>
                                    <div className="text-xs text-green-600">Paso 4</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentsPage;
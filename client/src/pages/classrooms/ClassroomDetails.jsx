import React from 'react';
import { ArrowLeft, School, MapPin, Users, Hash, Clock, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useClassroomDetails } from '../../hooks/useClassrooms';
import { useNavigate, useParams } from "react-router-dom";

// Componente de Loading Skeleton
const DetailsSkeleton = () => (
    <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
            <div className="h-8 bg-green-200 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 bg-green-200 rounded w-1/2"></div>
                        <div className="h-6 bg-green-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* Cards skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-300 rounded w-full"></div>
                ))}
            </div>
        </div>
    </div>
);

// Componente de Error
const ErrorState = ({ error, onRetry, onBack }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar los detalles</h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
            {error?.message || 'Ha ocurrido un error inesperado al cargar la información del aula.'}
        </p>
        <div className="flex gap-3">
            <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
            </button>
            <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
            </button>
        </div>
    </div>
);

// Componente principal
const ClassroomDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data, isLoading, error, refetch, isFetching } = useClassroomDetails(id);

    // Forzar restauración del scroll al montar el componente
    React.useEffect(() => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    }, []);

    const classroomData = data?.data;

    const handleBack = () => {
        navigate(-1);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detalles del Aula</h1>
                        <p className="text-gray-600 mt-1">Cargando información...</p>
                    </div>
                </div>
                <DetailsSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detalles del Aula</h1>
                        <p className="text-gray-600 mt-1">Error al cargar los datos</p>
                    </div>
                </div>
                <ErrorState error={error} onRetry={refetch} onBack={handleBack} />
            </div>
        );
    }

    if (!classroomData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detalles del Aula</h1>
                        <p className="text-gray-600 mt-1">Aula no encontrada</p>
                    </div>
                </div>
                <div className="text-center py-12">
                    <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aula no encontrada</h3>
                    <p className="text-gray-600">El aula solicitada no existe o no tienes permisos para verla.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detalles del Aula</h1>
                </div>
            </div>

            {/* Indicador de carga */}
            {isFetching && !isLoading && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center text-green-600">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Actualizando información del aula...</span>
                    </div>
                </div>
            )}

            {/* Información básica del aula */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center gap-3">
                        <School className="h-6 w-6 text-green-600" />
                        <h2 className="text-xl font-semibold text-green-900">Información del Aula</h2>
                        <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                            classroomData.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {classroomData.active ? 'Activa' : 'Inactiva'}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Código del aula */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Hash className="h-4 w-4 text-gray-400" />
                                Código del Aula
                            </label>
                            <p className="text-lg font-semibold text-gray-900 font-mono">
                                {classroomData.classroom_code}
                            </p>
                        </div>

                        {/* Nombre del aula */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <School className="h-4 w-4 text-gray-400" />
                                Nombre del Aula
                            </label>
                            <p className="text-lg text-gray-900">
                                {classroomData.classroom_name}
                            </p>
                        </div>

                        {/* Nombre completo */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <School className="h-4 w-4 text-gray-400" />
                                Nivel Académico
                            </label>
                            <p className="text-lg text-gray-900">
                                {classroomData.classroom_name_full}
                            </p>
                        </div>

                        {/* Capacidad */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Users className="h-4 w-4 text-gray-400" />
                                Capacidad
                            </label>
                            <p className="text-lg text-gray-900">
                                {classroomData.capacity} estudiantes
                            </p>
                        </div>

                        {/* Ubicación */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                Ubicación
                            </label>
                            <p className="text-lg text-gray-900">
                                {classroomData.location}
                            </p>
                        </div>

                        {/* Horario */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Clock className="h-4 w-4 text-gray-400" />
                                Horario
                            </label>
                            <p className="text-lg text-gray-900 capitalize">
                                {classroomData.schedule.toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-blue-900">Estadísticas</h2>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Estudiantes matriculados */}
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {classroomData.enrolled_students}
                            </div>
                            <div className="text-sm text-blue-800 font-medium">
                                Estudiantes Matriculados
                            </div>
                        </div>

                        {/* Capacidad disponible */}
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {classroomData.capacity - classroomData.enrolled_students}
                            </div>
                            <div className="text-sm text-green-800 font-medium">
                                Cupos Disponibles
                            </div>
                        </div>

                        {/* Porcentaje de ocupación */}
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-3xl font-bold text-yellow-600 mb-2">
                                {Math.round((classroomData.enrolled_students / classroomData.capacity) * 100)}%
                            </div>
                            <div className="text-sm text-yellow-800 font-medium">
                                Ocupación
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomDetails;
import React from 'react';
import { ArrowLeft, BookOpen, AlertCircle, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSubjectDetails } from '../../hooks/useSubjects';

// Componente de Loading Skeleton
const DetailsSkeleton = () => (
    <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-6">
            <div className="h-8 bg-indigo-200 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
                        <div className="h-6 bg-indigo-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* Card skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
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
            {error?.message || 'Ha ocurrido un error inesperado al cargar la información de la materia.'}
        </p>
        <div className="flex gap-3">
            <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
            </button>
            <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
            </button>
        </div>
    </div>
);

// Componente principal
const SubjectDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data, isLoading, error, refetch, isFetching } = useSubjectDetails(id);

    // Forzar restauración del scroll al montar el componente
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.body.style.overflow = '';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const subjectData = data?.data;

    const handleBack = () => {
        navigate('/teachers/subjects/list');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Detalles de la Materia</h1>
                        <p className="text-gray-600 mt-1">Información detallada de la materia</p>
                    </div>
                </div>
                <DetailsSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Detalles de la Materia</h1>
                        <p className="text-gray-600 mt-1">Error al cargar la información</p>
                    </div>
                </div>
                <ErrorState error={error} onRetry={refetch} onBack={handleBack} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con indicador de carga */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-fit"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Detalles de la Materia</h1>
                        {isFetching && (
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        )}
                    </div>
                    <p className="text-gray-600 mt-1">Información detallada de la materia</p>
                </div>
            </div>

            {/* Información de la Materia */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-indigo-900">Información de la Materia</h2>
                        <div className="ml-auto">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                subjectData?.active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {subjectData?.active ? (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                ) : (
                                    <XCircle className="w-4 h-4 mr-1" />
                                )}
                                {subjectData?.active ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                                Nombre de la Materia
                            </label>
                            <div className="text-lg font-semibold text-gray-900">{subjectData?.name}</div>
                        </div>

                        {/* Código */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                                Código
                            </label>
                            <div className="text-lg font-semibold text-indigo-600">{subjectData?.code}</div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="mt-8">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            Descripción
                        </label>
                        <div className="text-gray-900">
                            {subjectData?.description ? (
                                <p className="whitespace-pre-wrap">{subjectData.description}</p>
                            ) : (
                                <p className="text-gray-500 italic">Sin descripción disponible</p>
                            )}
                        </div>
                    </div>

                    {/* Notas adicionales */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Información sobre la materia:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Esta materia puede ser asignada a diferentes cursos y grados</li>
                                    <li>• El código debe ser único en el sistema</li>
                                    <li>• Las materias inactivas no aparecen en las asignaciones nuevas</li>
                                    <li>• La información se actualiza automáticamente desde el sistema</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectDetails;
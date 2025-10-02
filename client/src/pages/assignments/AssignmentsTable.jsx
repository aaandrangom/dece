import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, BookOpen, Loader2, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { useAssignmentClassrooms, useSearchAssignmentClassrooms } from '../../hooks/useAssignments';
import { useNavigate } from "react-router-dom";

// Componente de Loading Skeleton
const TableSkeleton = () => (
    <div className="animate-pulse">
        {[...Array(5)].map((_, index) => (
            <div key={index} className="border-b border-gray-200">
                <div className="px-6 py-4 flex space-x-4">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
            </div>
        ))}
    </div>
);

// Componente de Error
const ErrorState = ({ error, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar las aulas</h3>
        <p className="text-gray-600 text-center mb-4">
            {error?.message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'}
        </p>
        <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
        </button>
    </div>
);

// Componente de Estado Vacío
const EmptyState = ({ hasSearchTerm }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {hasSearchTerm ? 'No se encontraron resultados' : 'No se encontraron aulas'}
        </h3>
        <p className="text-gray-600 text-center">
            {hasSearchTerm
                ? 'No hay aulas que coincidan con los criterios de búsqueda.'
                : 'No hay aulas disponibles para asignaciones.'
            }
        </p>
    </div>
);

// Componente principal de la tabla
const AssignmentsTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    // Manejar cambio de búsqueda con debounce
    const [debouncedSearch, setDebouncedSearch] = useState('');

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(debouncedSearch);
        }, 500);

        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    // Resetear página cuando cambie el término de búsqueda
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    // Opciones para las consultas
    const queryOptions = useMemo(() => ({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { q: searchTerm })
    }), [currentPage, itemsPerPage, searchTerm]);

    // Decidir qué hook usar basado en si hay término de búsqueda
    const shouldUseSearch = searchTerm && searchTerm.trim().length > 0;

    // Hook para obtener todas las aulas (sin búsqueda)
    const allClassroomsQuery = useAssignmentClassrooms(
        shouldUseSearch ? {} : queryOptions,
        { enabled: !shouldUseSearch }
    );

    // Hook para buscar aulas específicas
    const searchClassroomsQuery = useSearchAssignmentClassrooms(
        shouldUseSearch ? queryOptions : {},
        { enabled: !!shouldUseSearch }
    );

    // Seleccionar la consulta activa
    const activeQuery = shouldUseSearch ? searchClassroomsQuery : allClassroomsQuery;
    const { data, isLoading, error, refetch, isFetching } = activeQuery;

    // Extraer correctamente los datos según la estructura de la respuesta
    const classrooms = Array.isArray(data?.data?.classrooms) 
        ? data.data.classrooms 
        : [];
        
    const totalItems = data?.data?.pagination?.totalItems || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Crear objeto pagination
    const pagination = {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleItemsPerPageChange = (newLimit) => {
        setItemsPerPage(Number(newLimit));
        setCurrentPage(1);
    };

    // Limpiar búsqueda
    const handleClearSearch = () => {
        setDebouncedSearch('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Navegar a asignar materias
    const handleAssignSubjects = (classroom) => {
        navigate(`/teachers/assignments/assign/${classroom.classroom_id}`);
    };

    // Generar números de páginas para la paginación
    const getPageNumbers = () => {
        const totalPages = pagination.totalPages || 1;
        const current = currentPage;
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
            range.push(i);
        }

        if (current - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (current + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };



    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header con título, búsqueda y controles */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-blue-900">Asignaciones</h2>
                        <p className="text-sm text-blue-700 mt-1">
                            {pagination.totalItems ? (
                                searchTerm ?
                                    `${pagination.totalItems} aulas encontradas para "${searchTerm}"` :
                                    `${pagination.totalItems} aulas encontradas`
                            ) : 'Gestiona las asignaciones de materias por aula'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Buscador */}
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por código o nombre de aula"
                                value={debouncedSearch}
                                onChange={(e) => setDebouncedSearch(e.target.value)}
                                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            />
                            {debouncedSearch && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Limpiar búsqueda"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Selector de elementos por página */}
                        <select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value={5}>5 por página</option>
                            <option value={10}>10 por página</option>
                            <option value={20}>20 por página</option>
                            <option value={50}>50 por página</option>
                        </select>
                    </div>
                </div>

                {/* Indicador de búsqueda activa */}
                {searchTerm && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                            Búsqueda: {searchTerm}
                        </span>
                        <button
                            onClick={handleClearSearch}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            Limpiar
                        </button>
                    </div>
                )}
            </div>

            {/* Indicador de carga */}
            {isFetching && !isLoading && (
                <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">
                            {searchTerm ? 'Buscando aulas...' : 'Actualizando datos...'}
                        </span>
                    </div>
                </div>
            )}

            {/* Contenido de la tabla */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <TableSkeleton />
                ) : error ? (
                    <ErrorState error={error} onRetry={refetch} />
                ) : classrooms.length === 0 ? (
                    <EmptyState hasSearchTerm={!!searchTerm} />
                ) : (
                    <>
                        {/* Tabla */}
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        Nombre del Aula
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        Jornada
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {classrooms.map((classroom) => (
                                    <tr key={classroom.classroom_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {classroom.classroom_code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{classroom.classroom_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                classroom.schedule === 'MATUTINA' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : classroom.schedule === 'VESPERTINA'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {classroom.schedule}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center justify-center space-x-2">
                                                {/* Botón Asignar materias */}
                                                <button
                                                    onClick={() => handleAssignSubjects(classroom)}
                                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                                    title="Asignar materias"
                                                >
                                                    <Settings className="h-4 w-4 mr-1" />
                                                    Asignar materias
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Paginación */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    {/* Información de la página */}
                                    <div className="text-sm text-gray-700">
                                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, pagination.totalItems)} de {pagination.totalItems} resultados
                                        {searchTerm && <span className="font-medium"> para "{searchTerm}"</span>}
                                    </div>

                                    {/* Controles de paginación */}
                                    <div className="flex items-center space-x-1">
                                        {/* Botón anterior */}
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={!pagination.hasPreviousPage}
                                            className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="sr-only">Anterior</span>
                                        </button>

                                        {/* Números de página */}
                                        {getPageNumbers().map((pageNumber, index) => (
                                            <React.Fragment key={index}>
                                                {pageNumber === '...' ? (
                                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePageChange(pageNumber)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                                                            pageNumber === currentPage
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                )}
                                            </React.Fragment>
                                        ))}

                                        {/* Botón siguiente */}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={!pagination.hasNextPage}
                                            className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Siguiente</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignmentsTable;
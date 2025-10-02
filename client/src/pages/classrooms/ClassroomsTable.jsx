import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, School, Loader2, AlertCircle, RefreshCw, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { useClassrooms, useSearchClassrooms, useDeleteClassroom } from '../../hooks/useClassrooms';
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from '../../config/toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

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
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
        </button>
    </div>
);

// Componente de Estado Vacío
const EmptyState = ({ hasSearchTerm }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <School className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {hasSearchTerm ? 'No se encontraron resultados' : 'No se encontraron aulas'}
        </h3>
        <p className="text-gray-600 text-center">
            {hasSearchTerm
                ? 'No hay aulas que coincidan con los criterios de búsqueda.'
                : 'No hay aulas registradas en la institución.'
            }
        </p>
    </div>
);

// Componente principal de la tabla
const ClassroomsTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    // Estados para el modal de confirmación de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [classroomToDelete, setClassroomToDelete] = useState(null);
    const deleteClassroomMutation = useDeleteClassroom();

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
        ...(searchTerm && { search: searchTerm })
    }), [currentPage, itemsPerPage, searchTerm]);

    // Decidir qué hook usar basado en si hay término de búsqueda
    const shouldUseSearch = searchTerm && searchTerm.trim().length > 0;

    // Hook para obtener todas las aulas (sin búsqueda)
    const allClassroomsQuery = useClassrooms(
        shouldUseSearch ? {} : queryOptions,
        { enabled: !shouldUseSearch }
    );

    // Hook para buscar aulas específicas
    const searchClassroomsQuery = useSearchClassrooms(
        shouldUseSearch ? queryOptions : {},
        { enabled: !!shouldUseSearch }
    );

    // Seleccionar la consulta activa
    const activeQuery = shouldUseSearch ? searchClassroomsQuery : allClassroomsQuery;
    const { data, isLoading, error, refetch, isFetching } = activeQuery;

    // Extraer correctamente los datos según la estructura de la respuesta
    const classrooms = Array.isArray(data?.data?.classrooms) 
        ? data.data.classrooms 
        : Array.isArray(data?.data) 
        ? data.data 
        : [];
        
    const totalItems = data?.data?.pagination?.totalItems || data?.total || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Crear objeto pagination similar al de teachers
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

    // Funciones para manejar el modal de eliminación
    const handleDeleteClick = (classroom) => {
        setClassroomToDelete(classroom);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        if (!deleteClassroomMutation.isPending) {
            setShowDeleteModal(false);
            setClassroomToDelete(null);
        }
    };

    const handleConfirmDelete = () => {
        if (!classroomToDelete) return;

        deleteClassroomMutation.mutate(classroomToDelete.classroom_id, {
            onSuccess: (response) => {
                setShowDeleteModal(false);
                setClassroomToDelete(null);
                
                // Refrescar la tabla
                refetch();
                
                setTimeout(() => {
                    showSuccessToast(
                        response?.message || 'Aula eliminada correctamente',
                        {
                            description: `El aula ${classroomToDelete.classroom_code} ha sido desactivada`
                        }
                    );
                }, 100);
            },
            onError: (error) => {
                console.error('Error al eliminar aula:', error);
                
                setShowDeleteModal(false);
                setClassroomToDelete(null);
                
                let errorMessage = 'Error al eliminar el aula. Inténtalo de nuevo.';
                let errorDescription = 'Verifica los datos e inténtalo nuevamente';

                if (error?.response?.data) {
                    const errorData = error.response.data;
                    if (errorData.error) {
                        errorMessage = errorData.error;
                        
                        switch (errorData.code) {
                            case 'CLASSROOM_IN_USE':
                                errorDescription = 'El aula tiene estudiantes asignados';
                                break;
                            case 'PERMISSION_DENIED':
                                errorDescription = 'No tienes permisos para eliminar esta aula';
                                break;
                            default:
                                errorDescription = 'Revisa la información e inténtalo nuevamente';
                        }
                    }
                }
                
                setTimeout(() => {
                    showErrorToast(errorMessage, {
                        description: errorDescription
                    });
                }, 100);
            }
        });
    };

    const handleViewDetails = (classroom) => {
        navigate(`/teachers/classes/list/${classroom.classroom_id}`);
    };

    const handleEdit = (classroom) => {
        navigate(`/teachers/classes/edit/${classroom.classroom_id}`);
    };

    const handleCreateClassroom = () => {
        navigate('/teachers/classes/create');
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
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-green-900">Aulas</h2>
                        <p className="text-sm text-green-700 mt-1">
                            {pagination.totalItems ? (
                                searchTerm ?
                                    `${pagination.totalItems} aulas encontradas para "${searchTerm}"` :
                                    `${pagination.totalItems} aulas encontradas`
                            ) : 'Gestiona las aulas de la institución'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Buscador */}
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por código, nombre o ubicación"
                                value={debouncedSearch}
                                onChange={(e) => setDebouncedSearch(e.target.value)}
                                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
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
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value={5}>5 por página</option>
                            <option value={10}>10 por página</option>
                            <option value={20}>20 por página</option>
                            <option value={50}>50 por página</option>
                        </select>

                        {/* Botón Crear aula */}
                        <button
                            onClick={handleCreateClassroom}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm"
                            title="Crear nueva aula"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Crear aula</span>
                        </button>
                    </div>
                </div>

                {/* Indicador de búsqueda activa */}
                {searchTerm && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                            Búsqueda: {searchTerm}
                        </span>
                        <button
                            onClick={handleClearSearch}
                            className="text-xs text-green-600 hover:text-green-800 hover:underline"
                        >
                            Limpiar
                        </button>
                    </div>
                )}
            </div>

            {/* Indicador de carga */}
            {isFetching && !isLoading && (
                <div className="px-6 py-2 bg-green-50 border-b border-green-200">
                    <div className="flex items-center text-green-600">
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
                            <thead className="bg-gradient-to-r from-green-50 to-green-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Ubicación
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                        Jornada
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
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
                                            <div className="text-sm text-gray-900">{classroom.location || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {classroom.schedule || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center justify-center space-x-2">
                                                {/* Botón Ver detalles */}
                                                <button
                                                    onClick={() => handleViewDetails(classroom)}
                                                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                {/* Botón Editar */}
                                                <button
                                                    onClick={() => handleEdit(classroom)}
                                                    className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                                    title="Editar aula"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>

                                                {/* Botón Eliminar */}
                                                <button
                                                    onClick={() => handleDeleteClick(classroom)}
                                                    className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                    title="Eliminar aula"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            {/* Paginación */}
            {!isLoading && !error && classrooms.length > 0 && pagination.totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Información de la página */}
                        <div className="text-sm text-gray-700">
                            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, pagination.totalItems)} de {pagination.totalItems} resultados
                            {searchTerm && <span className="font-medium"> para "{searchTerm}"</span>}
                        </div>

                        {/* Controles de paginación */}
                        <div className="flex items-center space-x-2">
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
                            {getPageNumbers().map((page, index) => (
                                <React.Fragment key={index}>
                                    {page === '...' ? (
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handlePageChange(page)}
                                            className={`relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                page === currentPage
                                                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
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

            {/* Modal de confirmación para eliminar */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Eliminar Aula"
                message={classroomToDelete ? `¿Estás seguro de que deseas eliminar el aula "${classroomToDelete.classroom_code}"?` : ''}
                description="Esta acción desactivará el aula y no podrá ser utilizada para nuevas asignaciones."
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
                isLoading={deleteClassroomMutation.isPending}
            />
        </div>
    );
};

export default ClassroomsTable;
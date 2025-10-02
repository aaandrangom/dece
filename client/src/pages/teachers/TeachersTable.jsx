import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Users, Loader2, AlertCircle, RefreshCw, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { useTeachers, useSearchTeachers, useDeleteTeacher } from '../../hooks/useTeachers';
import TeacherDetails from './TeacherDetails'; // Importa el componente de detalles
import { useNavigate } from "react-router-dom";
import ConfirmModal from '../../components/ui/ConfirmModal';
import { showSuccessToast, showErrorToast } from '../../config/toast';

// Componente de Loading Skeleton
const TableSkeleton = () => (
    <div className="animate-pulse">
        {[...Array(5)].map((_, index) => (
            <div key={index} className="border-b border-gray-200">
                <div className="px-6 py-4 flex space-x-4">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                    <div className="h-4 bg-gray-300 rounded w-56"></div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar los docentes</h3>
        <p className="text-gray-600 text-center mb-4">
            {error?.message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'}
        </p>
        <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
        </button>
    </div>
);

// Componente de Estado Vacío
const EmptyState = ({ hasSearchTerm }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <Users className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {hasSearchTerm ? 'No se encontraron resultados' : 'No se encontraron docentes'}
        </h3>
        <p className="text-gray-600 text-center">
            {hasSearchTerm
                ? 'No hay docentes que coincidan con los criterios de búsqueda.'
                : 'No hay docentes registrados en la institución.'
            }
        </p>
    </div>
);

// Componente principal de la tabla
const TeachersTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    // Estados para el modal de confirmación de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);

    // Hook para eliminar docente
    const deleteTeacherMutation = useDeleteTeacher();

    const handleViewDetails = (teacher) => {
        navigate(`/teachers/list/${teacher.id}`);
    };
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

    // Hook para obtener todos los docentes (sin búsqueda)
    const allTeachersQuery = useTeachers(
        shouldUseSearch ? {} : queryOptions,
        { enabled: !shouldUseSearch }
    );

    // Hook para buscar docentes específicos
    const searchTeachersQuery = useSearchTeachers(
        shouldUseSearch ? queryOptions : {},
        { enabled: shouldUseSearch }
    );

    // Seleccionar la consulta activa
    const activeQuery = shouldUseSearch ? searchTeachersQuery : allTeachersQuery;
    const { data, isLoading, error, refetch, isFetching } = activeQuery;

    const teachers = data?.data?.teachers || [];
    const pagination = data?.data?.pagination || {};

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

    const handleEdit = (teacher) => {
        navigate(`/teachers/edit/${teacher.id}`);
    };

    const handleCreateTeacher = () => {
        navigate('/teachers/create');
    };

    const handleDelete = (teacher) => {
        setTeacherToDelete(teacher);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (!teacherToDelete) return;

        deleteTeacherMutation.mutate(teacherToDelete.id, {
            onSuccess: (response) => {
                // Cerrar modal INMEDIATAMENTE para evitar problemas de scroll
                setShowDeleteModal(false);
                
                // Usar setTimeout para asegurar que el modal se cierre completamente
                // antes de mostrar el toast y permitir que React Query actualice
                setTimeout(() => {
                    showSuccessToast(
                        response?.message || 'Docente eliminado correctamente',
                        {
                            description: `El docente ${teacherToDelete.full_name} ha sido desactivado`
                        }
                    );
                    
                    // Limpiar estado después del toast
                    setTeacherToDelete(null);
                }, 100);
            },
            onError: (error) => {
                console.error('Error al eliminar docente:', error);
                
                // Cerrar modal inmediatamente también en caso de error
                setShowDeleteModal(false);
                
                let errorMessage = 'Error al eliminar el docente. Inténtalo de nuevo.';
                
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
                
                // Usar setTimeout para el error también
                setTimeout(() => {
                    showErrorToast(errorMessage, {
                        description: 'Verifica los datos e inténtalo nuevamente'
                    });
                    
                    setTeacherToDelete(null);
                }, 100);
            }
        });
    };

    const handleCloseDeleteModal = () => {
        if (!deleteTeacherMutation.isPending) {
            setShowDeleteModal(false);
            setTeacherToDelete(null);
        }
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
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-purple-900">Docentes</h2>
                        <p className="text-sm text-purple-700 mt-1">
                            {pagination.totalItems ? (
                                searchTerm ?
                                    `${pagination.totalItems} docentes encontrados para "${searchTerm}"` :
                                    `${pagination.totalItems} docentes encontrados`
                            ) : 'Gestiona los docentes de la institución'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Buscador */}
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por cédula, nombres o apellidos"
                                value={debouncedSearch}
                                onChange={(e) => setDebouncedSearch(e.target.value)}
                                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
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
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        >
                            <option value={5}>5 por página</option>
                            <option value={10}>10 por página</option>
                            <option value={20}>20 por página</option>
                            <option value={50}>50 por página</option>
                        </select>

                        {/* Botón Crear docente */}
                        <button
                            onClick={handleCreateTeacher}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-sm"
                            title="Crear nuevo docente"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Crear docente</span>
                        </button>
                    </div>
                </div>

                {/* Indicador de búsqueda activa */}
                {searchTerm && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-200 text-purple-800">
                            Búsqueda: {searchTerm}
                        </span>
                        <button
                            onClick={handleClearSearch}
                            className="text-xs text-purple-600 hover:text-purple-800 hover:underline"
                        >
                            Limpiar
                        </button>
                    </div>
                )}
            </div>

            {/* Indicador de carga */}
            {isFetching && !isLoading && (
                <div className="px-6 py-2 bg-purple-50 border-b border-purple-200">
                    <div className="flex items-center text-purple-600">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">
                            {searchTerm ? 'Buscando docentes...' : 'Actualizando datos...'}
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
                ) : teachers.length === 0 ? (
                    <EmptyState hasSearchTerm={!!searchTerm} />
                ) : (
                    <>
                        {/* Tabla */}
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                                        Cédula
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                                        Nombre Completo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                                        Teléfono
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-purple-800 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {teacher.id_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{teacher.full_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a
                                                href={`mailto:${teacher.email}`}
                                                className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                                            >
                                                {teacher.email}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <a
                                                href={`tel:${teacher.phone}`}
                                                className="hover:text-gray-700 hover:underline"
                                            >
                                                {teacher.phone}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center justify-center space-x-2">
                                                {/* Botón Ver detalles */}
                                                <button
                                                    onClick={() => handleViewDetails(teacher)}
                                                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                {/* Botón Editar */}
                                                <button
                                                    onClick={() => handleEdit(teacher)}
                                                    className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                                                    title="Editar docente"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>

                                                {/* Botón Eliminar */}
                                                <button
                                                    onClick={() => handleDelete(teacher)}
                                                    className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                    title="Eliminar docente"
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
            {!isLoading && !error && teachers.length > 0 && pagination.totalPages > 1 && (
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
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors ${currentPage === page
                                                ? 'z-10 bg-purple-100 border-purple-500 text-purple-700 shadow-sm'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
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

            {/* Modal de confirmación para eliminar docente */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Eliminar Docente"
                message={
                    teacherToDelete 
                        ? `¿Estás seguro de que deseas eliminar al docente "${teacherToDelete.full_name}"? Esta acción desactivará al docente y no podrá ser revertida fácilmente.`
                        : 'Confirma la eliminación del docente'
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
                isLoading={deleteTeacherMutation.isPending}
            />
        </div>
    );
};

export default TeachersTable;
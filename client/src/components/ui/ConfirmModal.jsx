import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

let modalCount = 0;
let savedScrollPosition = 0;

const forceRestoreScroll = () => {
    modalCount = 0;
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    document.body.style.height = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Restaurar posición de scroll
    if (savedScrollPosition > 0) {
        window.scrollTo(0, savedScrollPosition);
        savedScrollPosition = 0;
    }
    
    console.log('🔧 Scroll restaurado forzadamente');
};

if (typeof window !== 'undefined') {
    window.forceRestoreScroll = forceRestoreScroll;
}

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar acción',
    message = '¿Estás seguro de que deseas continuar?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning', // 'warning', 'danger', 'info'
    isLoading = false,
    icon: CustomIcon
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        warning: {
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-600',
            buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
            icon: AlertTriangle
        },
        danger: {
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600',
            buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            icon: AlertTriangle
        },
        info: {
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
            buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            icon: AlertTriangle
        }
    };

    const config = typeConfig[type] || typeConfig.warning;
    const IconComponent = CustomIcon || config.icon;

    React.useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && !isLoading) {
                onClose();
                // Asegurar que el scroll se restaure después de presionar Escape
                setTimeout(() => {
                    if (modalCount <= 1) {
                        forceRestoreScroll();
                    }
                }, 100);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen, onClose, isLoading]);

    React.useEffect(() => {
        if (isOpen) {
            modalCount++;

            if (modalCount === 1) {
                // Guardar la posición actual del scroll
                savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                
                // Aplicar estilos para prevenir el scroll
                document.body.classList.add('modal-open');
                document.body.style.position = 'fixed';
                document.body.style.top = `-${savedScrollPosition}px`;
                document.body.style.width = '100%';
                document.body.style.overflow = 'hidden';
            }

            return () => {
                modalCount--;

                if (modalCount <= 0) {
                    modalCount = 0;
                    document.body.classList.remove('modal-open');
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    document.body.style.overflow = '';
                    
                    // Restaurar la posición del scroll
                    if (savedScrollPosition > 0) {
                        window.scrollTo(0, savedScrollPosition);
                        savedScrollPosition = 0;
                    }
                }
            };
        }
    }, [isOpen]);

    React.useEffect(() => {
        return () => {
            const oldCount = modalCount;
            modalCount = Math.max(0, modalCount - 1);

            if (modalCount === 0) {
                document.body.classList.remove('modal-open');
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                
                // Restaurar la posición del scroll
                if (savedScrollPosition > 0) {
                    window.scrollTo(0, savedScrollPosition);
                    savedScrollPosition = 0;
                }
            }
        };
    }, []);

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && !isLoading) {
            onClose();
            // Asegurar que el scroll se restaure después de hacer clic en el overlay
            setTimeout(() => {
                if (modalCount <= 1) {
                    forceRestoreScroll();
                }
            }, 100);
        }
    };

    const handleConfirm = () => {
        if (!isLoading) {
            // Asegurar que el scroll se restaure después de confirmar
            onConfirm();
            // Pequeño delay para asegurar que la operación async termine
            setTimeout(() => {
                if (modalCount <= 1) {
                    forceRestoreScroll();
                }
            }, 100);
        }
    };

    const handleCancel = () => {
        if (!isLoading) {
            onClose();
            // Asegurar que el scroll se restaure después de cancelar
            setTimeout(() => {
                if (modalCount <= 1) {
                    forceRestoreScroll();
                }
            }, 100);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300">
                <div className="absolute top-4 right-4">
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Ícono y título */}
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} ${config.borderColor} border flex items-center justify-center`}>
                            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonColor}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
import { toast } from 'sonner';

export const showSuccessToast = (message, options = {}) => {
    return toast.success(message, {
        duration: 4000,
        ...options
    });
};

export const showErrorToast = (message, options = {}) => {
    return toast.error(message, {
        duration: 5000,
        ...options
    });
};

export const showInfoToast = (message, options = {}) => {
    return toast.info(message, {
        duration: 3000,
        ...options
    });
};

export const showWarningToast = (message, options = {}) => {
    return toast.warning(message, {
        duration: 4000,
        ...options
    });
};

export const showLoadingToast = (message, options = {}) => {
    return toast.loading(message, {
        ...options
    });
};

export const dismissToast = (toastId) => {
    return toast.dismiss(toastId);
};

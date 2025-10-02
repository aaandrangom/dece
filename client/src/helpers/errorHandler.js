const handleApiError = (error, operation) => {
    const message = error.response?.data?.message || error.message || `Error en ${operation}`
    console.error(`Error in ${operation}:`, message)
    throw new Error(message)
}

export default handleApiError

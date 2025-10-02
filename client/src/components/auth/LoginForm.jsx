import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'

const LoginForm = ({ onSubmit, isLoading, error }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})

    const validateForm = () => {
        const errors = {}

        if (!formData.email) {
            errors.email = 'El email es requerido'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'El formato del email no es válido'
        }

        if (!formData.password) {
            errors.password = 'La contraseña es requerida'
        } else if (formData.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Limpiar error de validación al escribir
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (validateForm()) {
            onSubmit(formData.email, formData.password)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#6743a5' }}>
                    Correo Electrónico
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${validationErrors.email
                                ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
                                : 'border-gray-300 focus:border-purple-300 focus:ring-purple-200'
                            }`}
                        placeholder="correo@ejemplo.com"
                        disabled={isLoading}
                    />
                </div>
                {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
            </div>

            {/* Campo Contraseña */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#6743a5' }}>
                    Contraseña
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${validationErrors.password
                                ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
                                : 'border-gray-300 focus:border-purple-300 focus:ring-purple-200'
                            }`}
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                        )}
                    </button>
                </div>
                {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
            </div>

            {/* Error general */}
            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Botón de envío */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{
                    backgroundColor: isLoading ? '#8d71bb' : '#6743a5',
                    ':hover': { backgroundColor: '#5a3791' }
                }}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Iniciando sesión...
                    </>
                ) : (
                    'Iniciar Sesión'
                )}
            </button>

            {/* Credenciales de demo */}
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs font-medium mb-2" style={{ color: '#6743a5' }}>
                    Credenciales de demo:
                </p>
                <p className="text-xs text-gray-600">
                    Email: <span className="font-mono bg-white px-1 rounded">admin@dashboard.com</span>
                </p>
                <p className="text-xs text-gray-600">
                    Contraseña: <span className="font-mono bg-white px-1 rounded">123456</span>
                </p>
            </div>
        </form>
    )
}

export default LoginForm

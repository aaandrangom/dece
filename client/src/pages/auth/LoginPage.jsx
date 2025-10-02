import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoginForm from '../../components/auth/LoginForm'
import Logo from '../../components/ui/Logo'
import { Shield, Users, BarChart3 } from 'lucide-react'

const LoginPage = () => {
    const navigate = useNavigate()
    const { login, isLoading, error, setError } = useAuth()

    const handleLogin = async (email, password) => {
        const result = await login(email, password)
        if (result.success) {
            navigate('/')
        }
    }

    const features = [
        {
            icon: BarChart3,
            title: 'Analytics Avanzados',
            description: 'Métricas en tiempo real y reportes detallados para tomar mejores decisiones.'
        },
        {
            icon: Users,
            title: 'Gestión de Usuarios',
            description: 'Control completo de usuarios y permisos con interfaz intuitiva.'
        },
        {
            icon: Shield,
            title: 'Seguridad Robusta',
            description: 'Autenticación segura y protección de datos de nivel empresarial.'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex">
            {/* Panel izquierdo - Información */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-center px-12 py-12">
                <div className="max-w-md">
                    {/* Logo */}
                    <Logo size="xlarge" className="mb-8" />

                    {/* Título principal */}
                    <h1 className="text-4xl font-bold mb-4" style={{ color: '#6743a5' }}>
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        Accede a tu panel de control y gestiona tu aplicación con las herramientas
                        más avanzadas y una interfaz diseñada para la productividad.
                    </p>

                    {/* Características */}
                    <div className="space-y-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <div key={index} className="flex items-start space-x-4">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: '#d9cde8' }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: '#6743a5' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Panel derecho - Formulario de Login */}
            <div className="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Logo móvil */}
                    <div className="lg:hidden text-center mb-8">
                        <Logo size="large" className="justify-center" />
                    </div>

                    {/* Card del formulario */}
                    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold" style={{ color: '#6743a5' }}>
                                Iniciar Sesión
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Ingresa tus credenciales para acceder
                            </p>
                        </div>

                        <LoginForm
                            onSubmit={handleLogin}
                            isLoading={isLoading}
                            error={error}
                        />

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                ¿Problemas para acceder?{' '}
                                <button
                                    className="font-medium hover:underline transition-colors"
                                    style={{ color: '#6743a5' }}
                                    onClick={() => setError('')}
                                >
                                    Contacta al administrador
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            © 2025 Dashboard Company. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage

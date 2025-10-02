import {
    Home,
    Users,
    UserPlus,
    Search,
    FileText,
    Activity,
    HeartPulse,
    Stethoscope,
    Baby,
    BabyIcon,
    Shield,
    GraduationCap,
    BookOpen,
    UserSquare2,
    AlertTriangle,
    FileWarning,
    Calendar,
    Bell,
    ClipboardList,
    Users2,
    Building,
    MapPin,
    Briefcase,
    Settings,
    ShieldCheck,
    UserCog,
    Database,
    Wrench,
    Layers2,
    Shuffle
} from 'lucide-react'

export const menuItems = [
    {
        id: 'students',
        label: 'Estudiantes',
        icon: Users,
        path: '/students',
        subItems: [
            {
                id: 'students-registry',
                label: 'Registro y Listado',
                icon: FileText,
                path: '/students/management',
                subItems: [
                    { id: 'students-new', label: 'Registrar estudiante nuevo', icon: UserPlus, path: '/students/new' },
                    { id: 'students-list', label: 'Listado general', icon: Users2, path: '/students/list' },
                    { id: 'students-search', label: 'Buscar estudiante', icon: Search, path: '/students/search' }
                ]
            },
            {
                id: 'students-profile',
                label: 'Ficha Personal',
                icon: UserSquare2,
                path: '/students/profile',
                subItems: [
                    { id: 'students-data', label: 'Datos personales', icon: FileText, path: '/students/personal' },
                    { id: 'students-health', label: 'Salud y condiciones especiales', icon: HeartPulse, path: '/students/health' },
                    { id: 'students-disability', label: 'Discapacidad', icon: Activity, path: '/students/disability' },
                    { id: 'students-eval', label: 'Evaluación psicopedagógica', icon: Stethoscope, path: '/students/evaluation' },
                    { id: 'students-medical', label: 'Historial médico', icon: ClipboardList, path: '/students/medical' },
                    {
                        id: 'students-gender', label: 'Según género', icon: Baby, path: '/students/gender', subItems: [
                            { id: 'students-woman', label: 'Mujer → embarazo, maternidad, lactancia', icon: BabyIcon, path: '/students/woman' },
                            { id: 'students-man', label: 'Hombre → paternidad', icon: BabyIcon, path: '/students/man' }
                        ]
                    }
                ]
            },
            {
                id: 'students-family',
                label: 'Familia y Representantes',
                icon: Users2,
                path: '/students/family',
                subItems: [
                    { id: 'students-parents', label: 'Información de padres', icon: Users, path: '/students/parents' },
                    { id: 'students-legal', label: 'Representante legal', icon: ShieldCheck, path: '/students/legal' },
                    { id: 'students-liveswith', label: 'Con quién vive', icon: Home, path: '/students/liveswith' },
                    { id: 'students-household', label: 'Personas en el hogar', icon: Users2, path: '/students/household' },
                    { id: 'students-siblings', label: 'Hermanos en la institución', icon: GraduationCap, path: '/students/siblings' }
                ]
            },
            {
                id: 'students-academic',
                label: 'Académico',
                icon: BookOpen,
                path: '/students/academic',
                subItems: [
                    { id: 'students-grade', label: 'Grado / curso / paralelo / jornada', icon: GraduationCap, path: '/students/grade' },
                    { id: 'students-teacher', label: 'Docente tutor', icon: UserSquare2, path: '/students/tutor' },
                    { id: 'students-subjects', label: 'Docentes de área', icon: BookOpen, path: '/students/subjects' },
                    { id: 'students-repeat', label: 'Repetición de años', icon: AlertTriangle, path: '/students/repeat' },
                    { id: 'students-preferences', label: 'Materias preferidas', icon: BookOpen, path: '/students/preferences' },
                    { id: 'students-activities', label: 'Actividades extracurriculares', icon: Activity, path: '/students/activities' }
                ]
            },
            {
                id: 'students-discipline',
                label: 'Disciplina',
                icon: Shield,
                path: '/students/discipline',
                subItems: [
                    { id: 'students-warnings', label: 'Llamados de atención', icon: AlertTriangle, path: '/students/warnings' },
                    { id: 'students-acts', label: 'Actas de compromiso', icon: FileWarning, path: '/students/acts' },
                    { id: 'students-measures', label: 'Medidas disciplinarias', icon: ShieldCheck, path: '/students/measures' }
                ]
            }
        ]
    },
    {
        id: 'teachers',
        label: 'Docentes',
        icon: UserSquare2,
        path: '/teachers',
        subItems: [
            { id: 'teachers-list', label: 'Nómina', icon: ClipboardList, path: '/teachers/list' },
            { id: 'teachers-subjects', label: 'Materias', icon: BookOpen, path: '/teachers/subjects/list' },
            { id: 'teachers-classes', label: 'Aulas', icon: Users2, path: '/teachers/classes/list' },
            { id: 'teachers-assignments', label: 'Asignaciones', icon: Shuffle, path: '/teachers/assignments' },
        ]
    },
    {
        id: 'cases',
        label: 'Casos',
        icon: AlertTriangle,
        path: '/cases',
        subItems: [
            { id: 'cases-report', label: 'Reporte de violencia sexual', icon: FileWarning, path: '/cases/report' },
            { id: 'cases-derivation', label: 'Derivación', icon: ShieldCheck, path: '/cases/derivation' },
            { id: 'cases-date', label: 'Fecha de detección', icon: Calendar, path: '/cases/date' },
            { id: 'cases-status', label: 'Estado del caso', icon: ClipboardList, path: '/cases/status' }
        ]
    },
    {
        id: 'appointments',
        label: 'Citas',
        icon: Calendar,
        path: '/appointments',
        subItems: [
            { id: 'appointments-new', label: 'Registrar nueva cita', icon: UserPlus, path: '/appointments/new' },
            { id: 'appointments-list', label: 'Listado de citas', icon: ClipboardList, path: '/appointments/list' },
            { id: 'appointments-notifications', label: 'Notificaciones automáticas', icon: Bell, path: '/appointments/notifications' }
        ]
    },
    {
        id: 'training',
        label: 'Capacitaciones',
        icon: GraduationCap,
        path: '/training',
        subItems: [
            { id: 'training-new', label: 'Registrar capacitación', icon: FileText, path: '/training/new' },
            { id: 'training-list', label: 'Listado de capacitaciones', icon: ClipboardList, path: '/training/list' },
            { id: 'training-participants', label: 'Participantes', icon: Users, path: '/training/participants' },
            { id: 'training-beneficiaries', label: 'Beneficiarios', icon: Users2, path: '/training/beneficiaries' },
            { id: 'training-attendance', label: 'Registro de asistencia', icon: ClipboardList, path: '/training/attendance' }
        ]
    },
    {
        id: 'institution',
        label: 'Institución',
        icon: Building,
        path: '/institution',
        subItems: [
            { id: 'institution-data', label: 'Datos generales', icon: FileText, path: '/institution/data' },
            { id: 'institution-name', label: 'Nombre institución', icon: Building, path: '/institution/name' },
            { id: 'institution-code', label: 'Código AMIE', icon: ClipboardList, path: '/institution/code' },
            { id: 'institution-location', label: 'Ubicación', icon: MapPin, path: '/institution/location' }
        ]
    },
    {
        id: 'authorities',
        label: 'Autoridades',
        icon: Briefcase,
        path: '/authorities',
        subItems: [
            { id: 'authorities-rector', label: 'Rector', icon: UserCog, path: '/authorities/rector' },
            { id: 'authorities-subdirector', label: 'Subdirector', icon: Users2, path: '/authorities/subdirector' },
            { id: 'authorities-inspector', label: 'Inspector general', icon: Shield, path: '/authorities/inspector' },
            { id: 'authorities-subinspector', label: 'Subinspector', icon: ShieldCheck, path: '/authorities/subinspector' },
            { id: 'authorities-dece', label: 'DECE', icon: Users, path: '/authorities/dece' }
        ]
    },
    {
        id: 'settings',
        label: 'Configuración',
        icon: Settings,
        path: '/settings',
        subItems: [
            { id: 'settings-users', label: 'Gestión de usuarios', icon: UserCog, path: '/settings/users' },
            { id: 'settings-roles', label: 'Roles y permisos', icon: ShieldCheck, path: '/settings/roles' },
            { id: 'settings-backup', label: 'Copia de seguridad de datos', icon: Database, path: '/settings/backup' },
            { id: 'settings-system', label: 'Ajustes del sistema', icon: Wrench, path: '/settings/system' }
        ]
    }
]


export const user = {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    avatar: 'JP'
}

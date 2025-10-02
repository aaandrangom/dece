# Gestión de Docentes - Componentes Modularizados

Este módulo contiene todos los componentes necesarios para la gestión completa de docentes en el sistema educativo.

## Estructura de Archivos

```
src/
├── data/
│   └── teachersData.js          # Datos quemados para demo
├── components/
│   └── teachers/
│       ├── index.js             # Exportaciones de componentes
│       ├── TeachersTable.jsx    # Tabla principal con filtros y paginación
│       ├── TeacherDetailsModal.jsx # Modal para ver detalles completos
│       ├── TeacherFormModal.jsx # Modal para agregar/editar docentes
│       └── DeleteConfirmationModal.jsx # Modal de confirmación para eliminar
└── pages/
    └── teachers/
        ├── index.js             # Exportaciones de páginas
        └── TeachersListPage.jsx # Página principal que integra todos los componentes
```

## Características Implementadas

### ✅ Gestión Completa de Docentes
- **Listado**: Tabla responsive con información completa
- **Búsqueda**: Por nombre, email o especialización
- **Filtros**: Por estado (Activo, Inactivo, Licencia, Vacaciones)
- **Paginación**: Manejo de grandes cantidades de datos
- **Exportación**: Botón preparado para exportar datos

### ✅ Operaciones CRUD
- **Crear**: Formulario completo para agregar nuevos docentes
- **Leer**: Vista detallada con toda la información del docente
- **Actualizar**: Edición completa de información existente
- **Eliminar**: Con confirmación de seguridad

### ✅ Información Completa del Docente
- **Datos Personales**: Nombre, documento, fecha nacimiento, dirección
- **Contacto**: Email, teléfono, contacto de emergencia
- **Académico**: Especialización, educación, materias que enseña
- **Laboral**: Fecha contratación, estado, carga laboral, salario, grados asignados

### ✅ Características de UX/UI
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Validaciones**: Formularios con validación en tiempo real
- **Estados visuales**: Colores distintivos para diferentes estados
- **Modales**: Interfaces limpias y enfocadas
- **Iconografía**: Uso de Lucide React para iconos consistentes

## Uso Básico

### 1. Importar la Página Principal
```jsx
import { TeachersListPage } from './pages/teachers';

// En tu componente de enrutamiento
<Route path="/teachers/list" element={<TeachersListPage />} />
```

### 2. Usar Componentes Individuales
```jsx
import { 
  TeachersTable, 
  TeacherDetailsModal, 
  TeacherFormModal 
} from './components/teachers';

// Usar en tu componente personalizado
<TeachersTable 
  teachers={teachers}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAdd={handleAdd}
/>
```

### 3. Datos Quemados
```jsx
import { teachersData, subjectsData, gradesData } from './data/teachersData';

// Usar los datos en tu estado
const [teachers, setTeachers] = useState(teachersData);
```

## Configuración de Rutas

Para integrar completamente el sistema, puedes usar el archivo `AppWithRouting.jsx` como ejemplo:

```jsx
import { TeachersListPage } from './pages';

<Routes>
  <Route path="/teachers/list" element={<TeachersListPage />} />
  <Route path="/teachers/subjects" element={<ComingSoon title="Materias" />} />
  <Route path="/teachers/classes" element={<ComingSoon title="Clases" />} />
</Routes>
```

## Datos de Ejemplo

El sistema incluye 6 docentes de ejemplo con información completa:
- María González (Matemáticas)
- Carlos Rodríguez (Ciencias Naturales)
- Ana Martínez (Idiomas)
- Pedro López (Educación Física)
- Laura Hernández (Arte)
- Roberto Jiménez (Historia)

## Dependencias Utilizadas

- **React 19+**: Framework principal
- **React Router DOM**: Enrutamiento
- **Lucide React**: Iconografía
- **Tailwind CSS**: Estilos y diseño responsive

## Próximos Pasos

Para conectar con una API real:

1. Reemplazar `teachersData` con llamadas a API
2. Implementar servicios en `src/services/teachersService.js`
3. Agregar manejo de estado global (Context API o Redux)
4. Implementar autenticación y autorización
5. Agregar validaciones del lado del servidor

## Integración con el Sidebar

El sistema está diseñado para funcionar con el sidebar existente. La ruta `/teachers/list` corresponde a la primera subopción del menú "Docentes" en `src/constants/menuItems.js`.

La página se carga cuando el usuario hace clic en "Listado de docentes" en el sidebar.

import React from 'react'
import { Menu, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { menuItems } from '../../constants/menuItems'

const Header = ({ toggleSidebar }) => {
  const location = useLocation()

  const getCurrentPageTitle = () => {
    const pathname = location.pathname

    // Buscar en items principales
    const mainItem = menuItems.find(item => item.path === pathname)
    if (mainItem) return mainItem.label

    // Buscar en subitems
    for (const item of menuItems) {
      if (item.subItems) {
        const subItem = item.subItems.find(sub => sub.path === pathname)
        if (subItem) return `${item.label} > ${subItem.label}`

        // Buscar en sub-subitems (para casos anidados)
        for (const subItem of item.subItems) {
          if (subItem.subItems) {
            const subSubItem = subItem.subItems.find(subSub => subSub.path === pathname)
            if (subSubItem) return `${item.label} > ${subItem.label} > ${subSubItem.label}`
          }
        }
      }
    }

    if (pathname.startsWith('/teachers/')) {
      const teachersItem = menuItems.find(item => item.id === 'teachers')
      if (teachersItem) {
        if (pathname === '/teachers/create') {
          return `${teachersItem.label} > Agregar Docente`
        }
        if (pathname.startsWith('/teachers/edit/')) {
          return `${teachersItem.label} > Editar Docente`
        }
        if (pathname.startsWith('/teachers/view/')) {
          return `${teachersItem.label} > Ver Docente`
        }
        if (pathname.startsWith('/teachers/list/')) {
          return `${teachersItem.label} > Detalle Docente`
        }
        if (pathname.startsWith('/teachers/deactivated')) {
          return `${teachersItem.label} > Docentes Desactivados`
        }

        if (pathname.startsWith('/teachers/subjects/')) {
          const subjectsItem = teachersItem.subItems.find(item => item.id === 'teachers-subjects')
          if (subjectsItem) {
            if (pathname === '/teachers/subjects/create') {
              return `${subjectsItem.label} > Crear Materia`
            }
            if (pathname.startsWith('/teachers/subjects/edit/')) {
              return `${subjectsItem.label} > Editar Materia`
            }
            if (pathname.startsWith('/teachers/subjects/view/')) {
              return `${subjectsItem.label} > Ver Materia`
            }
            if (pathname.startsWith('/teachers/subjects/list/')) {
              return `${subjectsItem.label} > Detalle Materia`
            }
          }
        }

        if (pathname.startsWith('/teachers/classes/')) {
          const classesItem = teachersItem.subItems.find(item => item.id === 'teachers-classes')
          if (classesItem) {
            if (pathname === '/teachers/classes/create') {
              return `${classesItem.label} > Crear Aula`
            }
            if (pathname.startsWith('/teachers/classes/edit/')) {
              return `${classesItem.label} > Editar Aula`
            }
            if (pathname.startsWith('/teachers/classes/view/')) {
              return `${classesItem.label} > Ver Aula`
            }
            if (pathname.startsWith('/teachers/classes/list/')) {
              return `Docentes > ${classesItem.label} > Detalle Aula`
            }
          }
        }

        if (pathname.startsWith('/teachers/assignments/')) {
          const assignmentsItem = teachersItem.subItems.find(item => item.id === 'teachers-assignments')
          if (assignmentsItem) {
            if (pathname.startsWith('/teachers/assignments/assign')) {

              return `${assignmentsItem.label} > Asignar Materias`
            }
          }
        }

        return teachersItem.label
      }
    }

    // Manejar otras secciones similares
    if (pathname.startsWith('/students/')) {
      const studentsItem = menuItems.find(item => item.id === 'students')
      if (studentsItem) {
        if (pathname === '/students/management/register') {
          return `${studentsItem.label} > Registro y Listado > Agregar Estudiante`
        }
        return studentsItem.label
      }
    }

    if (pathname.startsWith('/cases/')) {
      const casesItem = menuItems.find(item => item.id === 'cases')
      if (casesItem) {
        if (pathname === '/cases/new') {
          return `${casesItem.label} > Nuevo Caso`
        }
        return casesItem.label
      }
    }

    if (pathname.startsWith('/appointments/')) {
      const appointmentsItem = menuItems.find(item => item.id === 'appointments')
      if (appointmentsItem) {
        if (pathname === '/appointments/new') {
          return `${appointmentsItem.label} > Nueva Cita`
        }
        return appointmentsItem.label
      }
    }

    if (pathname.startsWith('/training/')) {
      const trainingItem = menuItems.find(item => item.id === 'training')
      if (trainingItem) {
        if (pathname === '/training/new') {
          return `${trainingItem.label} > Nueva Capacitación`
        }
        return trainingItem.label
      }
    }

    return 'Dashboard'
  }

  return (
    <header className="bg-white shadow-sm border-b border-purple-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Menu className="w-5 h-5" style={{ color: '#6743a5' }} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: '#6743a5' }}>
            {getCurrentPageTitle()}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-purple-100 transition-colors">
            <Bell className="w-5 h-5" style={{ color: '#6743a5' }} />
          </button>
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#b39fd2' }}></div>
        </div>
      </div>
    </header>
  )
}

export default Header

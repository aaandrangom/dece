import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components';
import TeacherTable from './pages/teachers/TeachersTable';
import LoginPage from './pages/auth/LoginPage';
import './App.css'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import TeacherDetails from './pages/teachers/TeacherDetails';
import EditTeacher from './pages/teachers/EditTeacher';
import CreateTeacher from './pages/teachers/CreateTeacher';
import { SubjectsTable, CreateSubject, EditSubject, SubjectDetails } from './pages/subjects';
import { ClassroomsTable, CreateClassroom, ClassroomDetails, EditClassroom } from './pages/classrooms';
import { AssignmentsTable, AssignSubjects } from './pages/assignments';
import { StudentsPage, StudentRegistration } from './pages/students';

// Componente temporal para otras rutas
const ComingSoon = ({ title }) => (
  <div className="p-6">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600">Esta página está en desarrollo...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de login sin layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas principales con layout */}
        <Route path="/" element={<MainLayout />}>
          {/* Ruta principal - redirige a docentes por ahora */}
          <Route index element={<Navigate to="/teachers/list" replace />} />

          {/* Rutas de Estudiantes */}
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/management" element={<StudentsPage />} />
          <Route path="students/management/register" element={<StudentRegistration />} />
          <Route path="students/new" element={<StudentRegistration />} />
          <Route path="students/list" element={<ComingSoon title="Listado General de Estudiantes" />} />
          <Route path="students/search" element={<ComingSoon title="Buscar Estudiante" />} />
          <Route path="students/medical" element={<ComingSoon title="Información Médica" />} />
          <Route path="students/medical/allergies" element={<ComingSoon title="Alergias" />} />
          <Route path="students/medical/medications" element={<ComingSoon title="Medicamentos" />} />
          <Route path="students/medical/conditions" element={<ComingSoon title="Condiciones Médicas" />} />
          <Route path="students/academic" element={<ComingSoon title="Información Académica" />} />
          <Route path="students/discipline" element={<ComingSoon title="Información Disciplinaria" />} />
          <Route path="students/warnings" element={<ComingSoon title="Llamados de Atención" />} />
          <Route path="students/acts" element={<ComingSoon title="Actas de Compromiso" />} />
          <Route path="students/measures" element={<ComingSoon title="Medidas Disciplinarias" />} />

          {/* Rutas de Docentes */}
          <Route path="teachers/list" element={<TeacherTable />} />
          <Route path="/teachers/list/:id" element={<TeacherDetails />} />
          <Route path="teachers/add" element={<ComingSoon />} />
          <Route path="teachers/create" element={<CreateTeacher />} />
          <Route path="teachers/edit/:id" element={<EditTeacher />} />
          <Route path="teachers/subjects" element={<ComingSoon title="Materias" />} />
          <Route path="teachers/classes/list" element={<ClassroomsTable />} />
          <Route path="teachers/classes/create" element={<CreateClassroom />} />
          <Route path="teachers/classes/list/:id" element={<ClassroomDetails />} />
          <Route path="teachers/classes/edit/:id" element={<EditClassroom />} />

          {/* Rutas de Asignaciones */}
          <Route path="teachers/assignments" element={<AssignmentsTable />} />
          <Route path="teachers/assignments/assign/:classroomId" element={<AssignSubjects />} />

          {/* Rutas de Materias */}
          <Route path="teachers/subjects/list" element={<SubjectsTable />} />
          <Route path="teachers/subjects/list/:id" element={<SubjectDetails />} />
          <Route path="teachers/subjects/create" element={<CreateSubject />} />
          <Route path="teachers/subjects/edit/:id" element={<EditSubject />} />

          {/* Rutas de Casos */}
          <Route path="cases/report" element={<ComingSoon title="Reporte de Violencia Sexual" />} />
          <Route path="cases/derivation" element={<ComingSoon title="Derivación" />} />
          <Route path="cases/date" element={<ComingSoon title="Fecha de Detección" />} />
          <Route path="cases/status" element={<ComingSoon title="Estado del Caso" />} />

          {/* Rutas de Citas */}
          <Route path="appointments/new" element={<ComingSoon title="Registrar Nueva Cita" />} />
          <Route path="appointments/list" element={<ComingSoon title="Listado de Citas" />} />
          <Route path="appointments/notifications" element={<ComingSoon title="Notificaciones Automáticas" />} />

          {/* Rutas de Capacitaciones */}
          <Route path="training/new" element={<ComingSoon title="Registrar Capacitación" />} />
          <Route path="training/list" element={<ComingSoon title="Listado de Capacitaciones" />} />
          <Route path="training/participants" element={<ComingSoon title="Participantes" />} />
          <Route path="training/certificates" element={<ComingSoon title="Certificados" />} />

          {/* Rutas de Reportes */}
          <Route path="reports/student-academic" element={<ComingSoon title="Reporte Académico de Estudiantes" />} />
          <Route path="reports/student-medical" element={<ComingSoon title="Reporte Médico de Estudiantes" />} />
          <Route path="reports/cases" element={<ComingSoon title="Reporte de Casos" />} />
          <Route path="reports/appointments" element={<ComingSoon title="Reporte de Citas" />} />
          <Route path="reports/training" element={<ComingSoon title="Reporte de Capacitaciones" />} />

          {/* Rutas de Configuración */}
          <Route path="settings/users" element={<ComingSoon title="Gestión de Usuarios" />} />
          <Route path="settings/roles" element={<ComingSoon title="Roles y Permisos" />} />
          <Route path="settings/system" element={<ComingSoon title="Configuración del Sistema" />} />
          <Route path="settings/backup" element={<ComingSoon title="Respaldo y Restauración" />} />
          <Route path="settings/maintenance" element={<ComingSoon title="Mantenimiento" />} />

          {/* Ruta 404 */}
          <Route path="*" element={<ComingSoon title="Página no encontrada" />} />
        </Route>
      </Routes>
      <ReactQueryDevtools initialIsOpen={true} />
    </Router>
  );
}

export default App

import express from 'express';
import { CourseSubjectController } from '../controllers/cCourseSubject.js';

const router = express.Router();

router.post('/', CourseSubjectController.createCourseSubject);

router.get('/classrooms', CourseSubjectController.getClassrooms);
router.get('/subjects', CourseSubjectController.getSubjects);

// Additional routes can be added here as needed
//router.get('/institution', CourseSubjectController.getAll);
//router.get('/:courseSubjectId', CourseSubjectController.getDetailsById);
//router.get('/institution/search', CourseSubjectController.searchCourseSubject);

router.put('/:courseSubjectId', CourseSubjectController.updateCourseSubject);
router.delete('/:courseSubjectId', CourseSubjectController.deleteCourseSubject);

// Ruta para obtener las materias asignadas a una clase específica
router.get('/classroom/:classroomId/subjects', CourseSubjectController.getSubjectsByClassroom);

// Ruta para buscar aulas por código y nombre
router.get('/classrooms/search', CourseSubjectController.searchClassroom);

export default router;  
import express from 'express';
import teacherRoutes from './rTeacher.js';
import subjectRoutes from './rSubject.js';
import classroomRoutes from './rClassroom.js';
import courseSubjectRoutes from './rCourseSubject.js';


const router = express.Router();

router.use('/teachers', teacherRoutes);
router.use('/course-subjects', courseSubjectRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/subjects', subjectRoutes);

export default router;

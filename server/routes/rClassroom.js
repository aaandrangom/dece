import express from 'express';
import { ClassroomController } from '../controllers/cClassroom.js';

const router = express.Router();

router.post('/', ClassroomController.createClassroom);

router.get('/institution', ClassroomController.getAll);
router.get('/grades', ClassroomController.getGrades);
router.get('/parallels', ClassroomController.getParallels);
router.get('/:classroomId', ClassroomController.getDetailsById);
router.get('/institution/search', ClassroomController.searchClassroom);

router.put('/:classroomId', ClassroomController.updateClassroom);

export default router;
``
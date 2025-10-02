import express from 'express';
import { SubjectController } from '../controllers/cSubject.js';

const router = express.Router();

router.post('/', SubjectController.create);

router.get('/', SubjectController.getAll);
router.get('/details/:subjectId', SubjectController.getDetailsById);
router.get('/search', SubjectController.searchSubject);

router.put('/', SubjectController.updateSubject);

export default router;
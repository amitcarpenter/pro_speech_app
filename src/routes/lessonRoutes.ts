import express from 'express';
import * as lessonController from '../controllers/lessonController';
import { authenticateUser } from '../middlewares/auth';

const router = express.Router();

router.post('/', lessonController.createLesson);
router.get('/', lessonController.getAllLessons);
router.get('/:id', lessonController.getLessonById);
router.get('/:id', lessonController.getLessonById);

router.get('/module-id/:id', authenticateUser, lessonController.getLessonByModuleId);

router.put('/:id', lessonController.updateLessonById);
router.delete('/:id', lessonController.deleteLessonById);

export default router;

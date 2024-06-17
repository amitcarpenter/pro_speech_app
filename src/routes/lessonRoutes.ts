import express from 'express';
import * as lessonController from '../controllers/lessonController';
import { authenticateUser } from '../middlewares/auth';

const router = express.Router();

router.post('/',authenticateUser, lessonController.createLesson);
router.get('/',authenticateUser, lessonController.getAllLessons);
router.get('/:id',authenticateUser, lessonController.getLessonById);
router.get('/:id',authenticateUser, lessonController.getLessonById);

router.get('/module-id/:id', authenticateUser, lessonController.getLessonByModuleId);

router.put('/:id',authenticateUser, lessonController.updateLessonById);
router.delete('/:id',authenticateUser, lessonController.deleteLessonById);

export default router;

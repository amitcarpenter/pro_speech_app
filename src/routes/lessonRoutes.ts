import express from 'express';
import * as lessonController from '../controllers/lessonController';

const router = express.Router();

router.post('/', lessonController.createLesson);
router.get('/', lessonController.getAllLessons);
router.get('/:id', lessonController.getLessonById);
router.put('/:id', lessonController.updateLessonById);
router.delete('/:id', lessonController.deleteLessonById);

export default router;

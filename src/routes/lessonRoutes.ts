import express from 'express';
import * as lessonController from '../controllers/lessonController';
import { authenticateUser, isAdmin } from '../middlewares/auth';

const router = express.Router();


//==================================== Routes for User ==============================

router.get('/',authenticateUser, lessonController.getAllLessons);
router.get('/:id',authenticateUser, lessonController.getLessonById);
router.get('/:id',authenticateUser, lessonController.getLessonById);
router.get('/module-id/:id', authenticateUser, lessonController.getLessonByModuleId);

//==================================== Routes for ADMIN ==============================

router.post('/',authenticateUser,isAdmin, lessonController.createLesson);
router.put('/:id',authenticateUser,isAdmin, lessonController.updateLessonById);
router.delete('/:id',authenticateUser,isAdmin, lessonController.deleteLessonById);

export default router;

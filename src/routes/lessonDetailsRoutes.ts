import express from 'express';
import * as lessonDetailsController from '../controllers/lessonDetailsController';
import { authenticateUser } from '../middlewares/auth';
import { upload } from '../services/uploadImage';

const router = express.Router();

router.post('/create', authenticateUser, upload.fields([
    { name: 'lesson_image', maxCount: 1 },
    { name: 'lesson_video', maxCount: 1 },
    { name: 'lesson_voice', maxCount: 1 }
]), lessonDetailsController.createLessonDetails);


router.get("/lessonId/:id", lessonDetailsController.getLessonDetailsByLessonId)


router.put('/update/:id', authenticateUser, upload.fields([
    { name: 'lesson_image', maxCount: 1 },
    { name: 'lesson_video', maxCount: 1 },
    { name: 'lesson_voice', maxCount: 1 }
]), lessonDetailsController.updateLessonDetailsById);


export default router;

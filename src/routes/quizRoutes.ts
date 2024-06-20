import express from 'express';
import * as quizController from '../controllers/quizController';
import { authenticateUser, isAdmin } from '../middlewares/auth';

const router = express.Router();

//==================================== Routes for User ==============================

router.get('/', authenticateUser, quizController.getAllQuizzes);
router.get('/:id', authenticateUser, quizController.getQuizById);
router.delete('/:id', authenticateUser, quizController.deleteQuizById);
router.post('/check-answer', authenticateUser, quizController.check_quiz);
router.get('/lesson-id/:id', authenticateUser, quizController.getQuizByLessonId);
router.post('/submit-quiz', authenticateUser, quizController.submit_quiz);


//==================================== Routes for User ==============================
router.post('/', authenticateUser, isAdmin, quizController.createQuiz);
router.put('/:id', authenticateUser, isAdmin, quizController.updateQuizById);
router.put('/:id', authenticateUser, isAdmin, quizController.updateQuizById);


export default router;

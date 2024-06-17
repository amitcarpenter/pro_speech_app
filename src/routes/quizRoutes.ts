import express from 'express';
import * as quizController from '../controllers/quizController';
import { authenticateUser } from '../middlewares/auth';

const router = express.Router();

router.post('/', authenticateUser, quizController.createQuiz);
router.get('/', authenticateUser, quizController.getAllQuizzes);
router.get('/:id', authenticateUser, quizController.getQuizById);
router.put('/:id', authenticateUser, quizController.updateQuizById);
router.delete('/:id', authenticateUser, quizController.deleteQuizById);


router.post('/check-answer', authenticateUser, quizController.check_quiz);

router.get('/lesson-id/:id', authenticateUser, quizController.getQuizByLessonId);

router.post('/submit-quiz', authenticateUser, quizController.submit_quiz);

export default router;

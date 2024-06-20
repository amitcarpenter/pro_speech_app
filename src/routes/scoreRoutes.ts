import express from 'express';
import * as scoreController from '../controllers/scoreController';
import { authenticateUser } from '../middlewares/auth';

const router = express.Router();

//==================================== Routes for User ==============================
router.get('/leaderboard', authenticateUser, scoreController.get_score_leaderboard);

export default router;

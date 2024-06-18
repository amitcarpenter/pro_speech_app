// src/index.ts

import express from 'express';
import { getQuizInfo, getQuizResultInfo, getQuizQuestions, submitQuizResults } from './qsmApi';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/quiz/:id', async (req, res) => {
    try {
        const quizInfo = await getQuizInfo(req.params.id);
        res.json(quizInfo);
    } catch (error) {
        res.status(500).send('Error fetching quiz info');
    }
}); 

app.get('/quiz-result/:id', async (req, res) => {
    try {
        const quizResultInfo = await getQuizResultInfo(req.params.id);
        res.json(quizResultInfo);
    } catch (error) {
        res.status(500).send('Error fetching quiz result info');
    }
});

app.get('/quiz-questions/:quizId', async (req, res) => {
    try {
        const quizQuestions = await getQuizQuestions(req.params.quizId);
        res.json(quizQuestions);
    } catch (error) {
        res.status(500).send('Error fetching quiz questions');
    }
});

app.post('/submit-quiz', async (req, res) => {
    try {
        const { quizId, questionList, totalQuestions, answers, timer, currentTime, currentTimeZone } = req.body;
        const result = await submitQuizResults(quizId, questionList, totalQuestions, answers, timer, currentTime, currentTimeZone);
        res.json(result);
    } catch (error) {
        res.status(500).send('Error submitting quiz results');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

import { Request, Response } from 'express';
import Joi from 'joi';

import Quiz from '../models/Quiz';

// Create a new quiz
export const createQuiz = async (req: Request, res: Response) => {
    const quizSchema = Joi.object({
        quiz_name: Joi.string().required(),
        questions: Joi.array().items(
            Joi.object({
                text: Joi.string().required(),
                options: Joi.array().items(Joi.string().required()).required(),
                correctOption: Joi.string().required(),
            })
        ).required(),
        lesson_id: Joi.string().required(),
    });
    const { error } = quizSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.details[0].message,
        });
    }
    try {
        const { quiz_name, questions, lesson_id } = req.body;

        const newQuiz = new Quiz({
            quiz_name,
            questions,
            lesson_id,
        });

        const savedQuiz = await newQuiz.save();
        return res.status(201).json({
            success: true,
            meessage: "quiz created successfully",
            status: 201, quiz: savedQuiz
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500, error: error.message
        });
    }
};

// Get all quizzes
export const getAllQuizzes = async (req: Request, res: Response) => {
    try {
        const quizzes = await Quiz.find();
        return res.status(200).json({
            success: true,
            status: 200, quizzes
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500, error: error.message
        });
    }
};

// Get a single quiz by ID
export const getQuizById = async (req: Request, res: Response) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                status: 404, message: 'Quiz not found'
            });
        }
        return res.json({
            success: true,
            status: 200, quiz
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500, error: error.message
        });
    }
};

// Update a quiz by ID
export const updateQuizById = async (req: Request, res: Response) => {
    const updateQuizSchema = Joi.object({
        quiz_name: Joi.string().optional(),
        questions: Joi.array().items(
            Joi.object({
                text: Joi.string().required(),
                options: Joi.array().items(Joi.string().required()).required(),
                correctOption: Joi.string().required(),
            })
        ).optional(),
    });
    const { error } = updateQuizSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.details[0].message,
        });
    }
    try {
        const { quiz_name, questions } = req.body;
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            {
                quiz_name,
                questions,
            },
            { new: true }
        );

        if (!updatedQuiz) {
            return res.status(404).json({
                success: false,
                status: 404, message: 'Quiz not found'
            });
        }
        return res.status(200).json({
            success: true,
            meessage: "quiz updated successfully",
            status: 200, updatedQuiz
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500, error: error.message
        });
    }
};

// Delete a quiz by ID
export const deleteQuizById = async (req: Request, res: Response) => {
    const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/).required();
    const { error } = idSchema.validate(req.params.id);
    if (error) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: 'Invalid quiz ID',
        });
    }
    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!deletedQuiz) {
            return res.status(404).json({
                success: false,
                status: 404, message: 'Quiz not found'
            });
        }
        return res.status(200).json({
            success: true,
            status: 200, message: 'Quiz deleted successfully'
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500, error: error.message
        });
    }
};

// Check currect answer
// export const check_quiz = async (req: Request, res: Response) => {
//     try {
//         const { questionId, selectedOption } = req.body;
//         const quiz = await Quiz.findOne({ "questions._id": questionId });
//         console.log(quiz)

//         if (!quiz) {
//             return res.status(404).json({ message: 'Question not found' });
//         }

//         const question = quiz.questions

//         if (!question) {
//             return res.status(404).json({ message: 'Question not found' });
//         }

//         // const isCorrect = question.correctOption === selectedAnswer;

//         return res.json({ question });
//         // return res.json({ isCorrect, correctAnswer: question.correctOption });
//     } catch (error: any) {
//         return res.status(500).json({
//             success: false,
//             status: 500,
//             error: error.message,
//         });
//     }
// };


export const check_quiz = async (req: Request, res: Response) => {
    try {
        const { questionId, selectedOption } = req.body;
        const quiz = await Quiz.findOne({ "questions._id": questionId });
        
        if (!quiz) {
            return res.status(404).json({ message: 'Question not found' });
        }
        const question = quiz.questions.find((q: any) => q._id.toString() === questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        const isCorrect = question.correctOption === selectedOption;
        return res.json({ isCorrect, correctAnswer: question.correctOption });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
};
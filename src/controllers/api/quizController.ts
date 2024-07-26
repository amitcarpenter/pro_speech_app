import Joi from 'joi';
import Quiz from '../../models/Quiz';
import Score from '../../models/Score';
import { Request, Response } from 'express';
import User, { IUser } from '../../models/User';
import mongoose, { Document, Schema, model, Types } from 'mongoose';


const APP_URL = process.env.APP_URL as string

interface IQuestion extends Document {
    _id: mongoose.Types.ObjectId;
    text: string;
    options: string[];
    correctOption: string;
}

interface IQuiz extends Document {
    quiz_name: string;
    questions: IQuestion[];
    lesson_id: Types.ObjectId;
}



// Update the IQuestion interface to extend Document
interface IQuestion extends Document {
    text: string;
    options: string[];
    correctOption: string;
}

// Define a type for the processed question
type ProcessedQuestion = {
    _id: mongoose.Types.ObjectId;
    text: string;
    options: string[];
    correctOption: string;
};


//==================================== Controller for User side ==============================

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

// Check currect answer
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

// Get Quiz by lesson id
// export const getQuizByLessonId = async (req: Request, res: Response) => {
//     try {
//         const lessonId = req.params.id;
//         console.log(lessonId)
//         const quiz = await Quiz.find({ lesson_id: lessonId });

//         if (!quiz.length) {
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: 'No quiz found for the given lesson ID.',
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             data: quiz,
//         });
//     } catch (error: any) {
//         return res.status(500).json({
//             success: false,
//             status: 500,
//             message: error.message,
//         });
//     }
// };

// Submit Quiz
export const submit_quiz = async (req: Request, res: Response) => {
    try {
        const submitQuizSchema = Joi.object({
            score: Joi.string().required(),
            quizId: Joi.string().required(),
            question_count: Joi.string().required()
        });


        const { error } = submitQuizSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: error.message
            });
        }

        const { score, quizId, question_count } = req.body;
        const user_req = req.user as IUser;
        const user = await User.findById(user_req.id);
        const quiz = await Quiz.findOne({ _id: quizId });

        if (!user) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "User not found"
            });
        }

        if (!quiz) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Quiz not found"
            });
        }


        if (user.completed_lessons.includes(quiz.lesson_id)) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "You have already submitted this Quiz"
            });
        }

        user.completed_lessons.push(quiz.lesson_id);
        const newScore = new Score({
            score_number: score,
            total_question: question_count,
            quizId: quizId,
            lessonId: quiz.lesson_id,
            userId: user._id
        });

        const savedScore = await newScore.save();
        const savedUser = await user.save();
        return res.status(200).json({
            success: true,
            status: 200,
            savedScore,
            savedUser
        });
    } catch (error: any) {
        console.error('Error submitting quiz:', error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message,
        });
    }
};


interface IQuizDocument extends Document {
    questions: Types.DocumentArray<IQuestionDocument>;
}

interface IQuestionDocument extends Document {
    _id: Types.ObjectId;
    text: string;
    options: string[];
    correctOption: string | number;
}

export const getQuizByLessonId = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.id;
        console.log(lessonId);
        const quizzes = await Quiz.find({ lesson_id: lessonId });

        if (!quizzes.length) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No quiz found for the given lesson ID.',
            });
        }
        const processedQuizzes = quizzes.map((quizDoc) => {
            const quiz = quizDoc.toObject() as unknown as IQuiz;
            const processedQuestions = quiz.questions.map((question) => {
                return {
                    _id: question._id,
                    text: question.text,
                    options: question.options.map(option =>
                        typeof option === 'string' && option.includes('.') ? `${APP_URL}${option}` : option
                    ),
                    correctOption: typeof question.correctOption === 'string' && question.correctOption.includes('.')
                        ? `${APP_URL}${question.correctOption}`
                        : question.correctOption
                };
            });
            return {
                ...quiz,
                questions: processedQuestions
            };
        });

        return res.status(200).json({
            success: true,
            status: 200,
            data: processedQuizzes,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message,
        });
    }
};



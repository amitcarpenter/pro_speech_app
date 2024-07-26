import Joi from 'joi';
import Quiz from '../../models/Quiz';
import { Request, Response } from 'express';
import { sendResponse } from "../../utils/responseHandle"
import mongoose, { Document, Schema, model, Types } from 'mongoose';

const APP_URL = process.env.APP_URL as string

interface MulterRequest extends Request {
    files: {
        [fieldname: string]: Express.Multer.File[];
    };
}

interface ICreateQuestion {
    text: string;
    options: string[];
    correctOption: string;
}

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

interface IQuestion extends Document {
    text: string;
    options: string[];
    correctOption: string;
}

type ProcessedQuestion = {
    _id: mongoose.Types.ObjectId;
    text: string;
    options: string[];
    correctOption: string;
};


//==================================== Controller for ADMIN side ==============================

// Create a new quiz
export const createQuiz = async (req: Request, res: Response) => {
    const quizSchema = Joi.object({
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
            message: "quiz created successfully",
            status: 201, quiz: savedQuiz
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
            message: "quiz updated successfully",
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

// Delete questino by quiz id 
export const deleteQuestionById = async (req: Request, res: Response) => {
    const { quizId, questionId } = req.params;
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                status: 404, message: "Quiz not found"
            });
        }
        const questionIndex = quiz.questions.findIndex(
            (question) => question._id.toString() === questionId
        );

        if (questionIndex === -1) {
            return res.status(404).json({
                success: false,
                status: 404, message: "Question not found"
            });
        }
        quiz.questions.splice(questionIndex, 1);
        await quiz.save();
        return res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500, error: error.message
        });
    }
};

// update question by  quiz id and question id
export const updateQuestionById = async (req: Request, res: Response) => {
    const update_question = Joi.object({
        options: Joi.array().items(Joi.string().required()).optional(),
        text: Joi.string().optional(),
        correctOption: Joi.string().optional().allow(""),
    });

    const { error } = update_question.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.details[0].message,
        });
    }
    const { quizId, questionId } = req.params;
    const { text, correctOption, options: textOptions } = req.body;
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return sendResponse(res, 404, false, "Quiz not found");
        }
        const questionIndex = quiz.questions.findIndex(
            (question) => question._id.toString() === questionId
        );

        if (questionIndex === -1) {
            return sendResponse(res, 404, false, "Question not found");
        }
        const question = quiz.questions[questionIndex];
        if (text) {
            question.text = text;
        }
        const options: string[] = [];
        if ((req as MulterRequest).files) {
            const files = (req as MulterRequest).files;
            const optionsFiles = files['options'];
            const correctOptionFile = files['correctOption']?.[0];

            if (optionsFiles && optionsFiles.length > 0) {
                optionsFiles.forEach((file: Express.Multer.File) => {
                    options.push(`${file.filename}`);
                });
            }

            if (correctOptionFile) {
                question.correctOption = `${correctOptionFile.filename}`;
            } else if (correctOption) {
                question.correctOption = correctOption;
            }
        }

        if (textOptions) {
            if (typeof textOptions === 'string') {
                if (textOptions.startsWith('http') || textOptions.startsWith('https')) {
                    const replacedOption = textOptions.replace(APP_URL, '');
                    options.push(replacedOption);
                } else {
                    options.push(textOptions);
                }
            } else if (Array.isArray(textOptions)) {
                textOptions.forEach((option) => {
                    if (option.startsWith('http') || option.startsWith('https')) {
                        const replacedOption = option.replace(APP_URL, '');
                        options.push(replacedOption);
                    } else {
                        options.push(option);
                    }
                });
            }
        }
        question.options = options;
        await quiz.save();
        return sendResponse(res, 200, true, "Question updated successfully", question);
    } catch (error) {
        return sendResponse(res, 500, false, "Server error", error);
    }
};

// Create question by quiz id
export const createQuestion = async (req: Request, res: Response) => {
    const create_question = Joi.object({
        options: Joi.array().items(Joi.string().required()).optional(),
        text: Joi.string().optional(),
        correctOption: Joi.string().optional().allow(""),
    });

    const { error } = create_question.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.details[0].message,
        });
    }

    const { lessonId } = req.params;

    let { text, correctOption, options: textOptions } = req.body;

    try {
        const quiz = await Quiz.findOne({ lesson_id: lessonId });
        if (!quiz) {
            return sendResponse(res, 404, false, "Quiz not found");
        }

        const options: string[] = [];

        if ((req as MulterRequest).files) {
            const files = (req as MulterRequest).files;
            const optionsFiles = files['options'];
            const correctOptionFile = files['correctOption']?.[0];

            if (optionsFiles && optionsFiles.length > 0) {
                optionsFiles.forEach((file: Express.Multer.File) => {
                    options.push(`${file.filename}`);
                });
            }
            if (correctOptionFile) {
                correctOption = correctOptionFile.filename;
            }
        }
        if (textOptions) {
            if (typeof textOptions === 'string') {
                options.push(textOptions);
            } else if (Array.isArray(textOptions)) {
                options.push(...textOptions);
            }
        }

        // Ensure text and correctOption are provided
        if (!text) {
            return sendResponse(res, 400, false, "Text is required");
        }
        if (!correctOption) {
            return sendResponse(res, 400, false, "Correct option is required");
        }

        const newQuestion: ICreateQuestion = {
            text,
            options,
            correctOption: correctOption
        };

        quiz.questions.push(newQuestion);
        await quiz.save();

        return sendResponse(res, 201, true, "Question created successfully", newQuestion);
    } catch (error) {
        return sendResponse(res, 500, false, "Server error", error);
    }
};

// Get question by quiz id and question id
export const getQuestionById = async (req: Request, res: Response) => {
    const { quizId, questionId } = req.params;
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return sendResponse(res, 404, false, "Quiz not found");
        }
        const question = (quiz as IQuiz).questions.find(q => q._id.toString() === questionId);
        if (!question) {
            return sendResponse(res, 404, false, "Question not found");
        } const questionWithBaseUrl = {
            _id: question._id,
            text: question.text,
            options: question.options.map((option: string) =>
                option.includes('.') ? `${APP_URL}${option}` : option
            ),
            correctOption: question.correctOption.includes('.')
                ? `${APP_URL}${question.correctOption}`
                : question.correctOption
        };

        return sendResponse(res, 200, true, "Question retrieved successfully", questionWithBaseUrl);
    } catch (error) {
        console.error('Error in getQuestionById:', error);
        return sendResponse(res, 500, false, "Server error", { message: (error as Error).message });
    }
};

// Get all questin by quiz id 
export const getAllQuestionsByQuizId = async (req: Request, res: Response) => {
    const { quizId } = req.params;
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return sendResponse(res, 404, false, "Quiz not found");
        }
        const processedQuestions: ProcessedQuestion[] = (quiz as IQuiz).questions.map((question: IQuestion) => {
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

        sendResponse(res, 200, true, "Questions retrieved successfully", processedQuestions);
    } catch (error) {
        console.error('Error in getAllQuestionsByQuizId:', error);
        sendResponse(res, 500, false, "Server error", { message: (error as Error).message });
    }
};
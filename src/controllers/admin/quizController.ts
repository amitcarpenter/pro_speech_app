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
// export const updateQuestionById = async (req: Request, res: Response) => {
//     const update_question = Joi.object({
//         // options: Joi.array().items(Joi.string().required()).optional(),
//         options: Joi.alternatives().try(
//             Joi.string().allow(''),
//             Joi.array().items(Joi.string().allow(''))
//         ).optional(),
//         text: Joi.string().optional(),
//         correctOption: Joi.string().optional().allow(""),
//     });

//     const { error } = update_question.validate(req.body);
//     if (error) {
//         return res.status(400).json({
//             success: false,
//             status: 400,
//             message: error.details[0].message,
//         });
//     }
//     const { quizId, questionId } = req.params;
//     const { text, correctOption, options: textOptions } = req.body;
//     try {
//         const quiz = await Quiz.findById(quizId);
//         if (!quiz) {
//             return sendResponse(res, 404, false, "Quiz not found");
//         }
//         const questionIndex = quiz.questions.findIndex(
//             (question) => question._id.toString() === questionId
//         );

//         if (questionIndex === -1) {
//             return sendResponse(res, 404, false, "Question not found");
//         }
//         const question = quiz.questions[questionIndex];
//         if (text) {
//             question.text = text;
//         }
//         const options: string[] = [];
//         if ((req as MulterRequest).files) {
//             const files = (req as MulterRequest).files;
//             const optionsFiles = files['options'];
//             const correctOptionFile = files['correctOption']?.[0];

//             if (optionsFiles && optionsFiles.length > 0) {
//                 optionsFiles.forEach((file: Express.Multer.File) => {
//                     options.push(`${file.filename}`);
//                 });
//             }

//             if (correctOptionFile) {
//                 question.correctOption = `${correctOptionFile.filename}`;
//                 console.log("image 111111111111111111111")
//             } else if (correctOption) {
//                 if (typeof correctOption === 'string' && (correctOption.startsWith('http') || correctOption.startsWith('https'))) {
//                     console.log("2222222222222222222222222")
//                     const correctOption1 = correctOption.replace(APP_URL, '');
//                     question.correctOption = correctOption1;
//                 } else {
//                     question.correctOption = correctOption;
//                 }
//             }
//         }

//         if (textOptions) {
//             if (typeof textOptions === 'string') {
//                 if (textOptions.startsWith('http') || textOptions.startsWith('https')) {
//                     const replacedOption = textOptions.replace(APP_URL, '');
//                     options.push(replacedOption);
//                 } else {
//                     options.push(textOptions);
//                 }
//             } else if (Array.isArray(textOptions)) {
//                 textOptions.forEach((option) => {
//                     if (option.startsWith('http') || option.startsWith('https')) {
//                         const replacedOption = option.replace(APP_URL, '');
//                         options.push(replacedOption);
//                     } else {
//                         options.push(option);
//                     }
//                 });
//             }
//         }
//         question.options = options;
//         await quiz.save();
//         return sendResponse(res, 200, true, "Question updated successfully", question);
//     } catch (error) {
//         return sendResponse(res, 500, false, "Server error", error);
//     }
// };

// // Create question by quiz id
// export const createQuestion = async (req: Request, res: Response) => {
//     const create_question = Joi.object({
//         // options: Joi.array().items(Joi.string().required()).optional(),
// options: Joi.alternatives().try(
//     Joi.string().allow(''),
//     Joi.array().items(Joi.string().allow(''))
//   ).optional(),
//         text: Joi.string().optional(),
//         correctOption: Joi.string().optional().allow(""),
//     });



//     const { error } = create_question.validate(req.body);
//     if (error) {
//         return res.status(400).json({
//             success: false,
//             status: 400,
//             message: error.details[0].message,
//         });
//     }

//     const { lessonId } = req.params;

//     let { text, correctOption, options: textOptions } = req.body;

//     try {
//         const quiz = await Quiz.findOne({ lesson_id: lessonId });
//         if (!quiz) {
//             return sendResponse(res, 404, false, "Quiz not found");
//         }

//         const options: string[] = [];

//         if ((req as MulterRequest).files) {
//             const files = (req as MulterRequest).files;
//             const optionsFiles = files['options'];
//             const correctOptionFile = files['correctOption']?.[0];

//             if (optionsFiles && optionsFiles.length > 0) {
//                 optionsFiles.forEach((file: Express.Multer.File) => {
//                     options.push(`${file.filename}`);
//                 });
//             }
//             if (correctOptionFile) {
//                 correctOption = correctOptionFile.filename;
//             }
//         }
//         if (textOptions) {
//             if (typeof textOptions === 'string') {
//                 options.push(textOptions);
//             } else if (Array.isArray(textOptions)) {
//                 options.push(...textOptions);
//             }
//         }

//         // Ensure text and correctOption are provided
//         if (!text) {
//             return sendResponse(res, 400, false, "Text is required");
//         }
//         if (!correctOption) {
//             return sendResponse(res, 400, false, "Correct option is required");
//         }

//         const newQuestion: ICreateQuestion = {
//             text,
//             options,
//             correctOption: correctOption
//         };

//         quiz.questions.push(newQuestion);
//         await quiz.save();

//         return sendResponse(res, 201, true, "Question created successfully", newQuestion);
//     } catch (error) {
//         return sendResponse(res, 500, false, "Server error", error);
//     }
// };


// Create question by quiz id
export const createQuestion = async (req: Request, res: Response) => {
    // Define the validation schema for a single question
    const questionSchema = Joi.object({
        type: Joi.string().valid("MCQ", "FILL_IN_THE_BLANK").required(),
        text: Joi.string().required(),
        correctOption: Joi.string().required(),
        options: Joi.alternatives().try(
            Joi.string().allow(''),
            Joi.array().items(Joi.string().allow(''))
        ).optional(),
    });

    // Create a new array of questions using the request data
    const questions = [{
        type: req.body.type,
        text: req.body.text,
        correctOption: req.body.correctOption,
        options: req.body.options ? [].concat(req.body.options) : [],  // ensure options is an array
    }];

    // Validate each question
    for (const question of questions) {
        const { error } = questionSchema.validate(question);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
    }

    const { lessonId } = req.params;

    try {
        const quiz = await Quiz.findOne({ lesson_id: lessonId });
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        for (let question of questions) {
            const { type, text, correctOption, options: textOptions } = question;
            const options: string[] = [];

            // Handle file uploads if any
            if ((req as MulterRequest).files) {
                const files = (req as MulterRequest).files;
                const optionsFiles = files['options'];
                const correctOptionFile = files['correctOption']?.[0];

                if (optionsFiles && optionsFiles.length > 0) {
                    optionsFiles.forEach((file: Express.Multer.File) => {
                        options.push(file.filename);
                    });
                }

                if (correctOptionFile) {
                    question.correctOption = correctOptionFile.filename;
                }
            }

            // Handle text options
            if (textOptions) {
                if (typeof textOptions === 'string') {
                    options.push(textOptions);
                } else if (Array.isArray(textOptions)) {
                    options.push(...textOptions);
                }
            }

            // Ensure required fields based on question type
            if (type === "MCQ" && options.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Options are required for MCQ type questions",
                });
            }

            // Add the processed question to the quiz
            quiz.questions.push({
                type,
                text,
                options,
                correctOption: question.correctOption,
            });
        }

        await quiz.save();

        return res.status(201).json({
            success: true,
            message: "Questions created successfully",
            data: quiz.questions,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};


export const updateQuestionById = async (req: Request, res: Response) => {
    const update_question = Joi.object({
        type: Joi.string().valid("MCQ", "FILL_IN_THE_BLANK").optional(), // Added type validation
        options: Joi.alternatives().try(
            Joi.string().allow(''),
            Joi.array().items(Joi.string().allow(''))
        ).optional(),
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
    const { type, text, correctOption, options: textOptions } = req.body;

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
        if (type) {
            question.type = type;
        }
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
                if (typeof correctOption === 'string' && (correctOption.startsWith('http') || correctOption.startsWith('https'))) {
                    const correctOption1 = correctOption.replace(APP_URL, '');
                    question.correctOption = correctOption1;
                } else {
                    question.correctOption = correctOption;
                }
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

        // Update options only if the question type is "MCQ"
        if (type === "MCQ" && options.length > 0) {
            question.options = options;
        } else if (type === "FILL_IN_THE_BLANK") {
            question.options = []; // Clear options for "FILL_IN_THE_BLANK"
        }

        await quiz.save();
        return sendResponse(res, 200, true, "Question updated successfully", question);
    } catch (error: any) {
        return sendResponse(res, 500, false, "Server error", error);
    }
};
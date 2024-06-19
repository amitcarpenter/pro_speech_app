import { Request, Response } from 'express';
import Joi from 'joi';
import Lesson, { ILesson } from '../models/Lesson';
import Quiz from '../models/Quiz';
import User, { IUser } from "../models/User"
import { Types } from 'mongoose';
import { ObjectId } from 'mongoose';


// // Create a new lesson
export const createLesson = async (req: Request, res: Response) => {
    try {
        const lessonSchema = Joi.object({
            lesson_name: Joi.string().required(),
            module_id: Joi.string().required(),
            // quiz_ids: Joi.string().optional(), 
            // lesstionDetailsId: Joi.string().optional(),  
        });

        const lessonsSchema = Joi.array().items(lessonSchema);
        const { error } = lessonsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: error.details[0].message,
            });
        }

        const lessonsData = req.body;
        const savedLessons = [];
        for (const lessonData of lessonsData) {
            const { lesson_name, module_id } = lessonData;
            const newLesson = new Lesson({
                lesson_name,
                module_id,
                // quiz_ids,
                // lesstionDetailsId
            });
            const savedLesson = await newLesson.save();
            savedLessons.push(savedLesson);
        }

        return res.status(201).json({
            success: true,
            status: 201,
            message: 'Lessons created successfully',
            data: savedLessons,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

// Get all lessons
export const getAllLessons = async (req: Request, res: Response) => {
    try {
        const lessons = await Lesson.find();
        return res.json({
            success: true,
            status: 200,
            data: lessons,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

// Get a single lesson by ID
export const getLessonById = async (req: Request, res: Response) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Lesson not found',
            });
        }
        return res.json({
            success: true,
            status: 200,
            data: lesson,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

// Update a lesson by ID
export const updateLessonById = async (req: Request, res: Response) => {
    try {
        const { lesson_name, module_id, quiz_ids } = req.body;

        const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, {
            lesson_name,
            module_id,
            quiz_ids,
        }, { new: true });

        if (!updatedLesson) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Lesson not found',
            });
        }

        return res.json({
            success: true,
            status: 200,
            message: 'Lesson updated successfully',
            data: updatedLesson,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

// Delete a lesson by ID
export const deleteLessonById = async (req: Request, res: Response) => {
    try {
        const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
        if (!deletedLesson) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Lesson not found',
            });
        }
        return res.json({
            success: true,
            status: 200,
            message: 'Lesson deleted successfully',
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};


// Get Lesson by section id
// export const getLessonByModuleId = async (req: Request, res: Response) => {
//     try {
//         const moduleId = req.params.id;
//         const user_req = req.user as IUser;
//         const user = await User.findById(user_req.id);
//         const lessons = await Lesson.find({ module_id: moduleId });

//         if (!lessons.length) {
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: 'No lesson found for the given module ID.',
//             });
//         }
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: 'User not found.',
//             });
//         }


//         const completedLessons = user.completed_lessons || [];

//         const lessonsWithQuizCount = await Promise.all(lessons.map(async (lesson) => {
//             const quizzes = await Quiz.find({ lesson_id: lesson._id });
//             const questionCount = quizzes.reduce((count, quiz) => count + quiz.questions.length, 0);

//             // Update the lesson's question_count field
//             lesson.question_count = questionCount;
//             let matched_lesson = completedLessons.includes(lesson._id)

//             await lesson.save();
//             return lesson.toObject();
//         }));

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             data: lessonsWithQuizCount,
//         });
//     } catch (error: any) {
//         console.error('Error fetching lessons by module ID:', error);
//         return res.status(500).json({
//             success: false,
//             status: 500,
//             message: error.message,
//         });
//     }
// };


// export const getLessonByModuleId = async (req: Request, res: Response) => {
//     try {
//         const moduleId = req.params.id;
//         const user_req = req.user as IUser
//         const user = await User.findById(user_req.id);

//         const lessons = await Lesson.find({ module_id: moduleId });

//         if (!lessons.length) {
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: 'No lesson found for the given module ID.',
//             });
//         }

//         // const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: 'User not found.',
//             });
//         }

//         const completedLessons = user.completed_lessons || [];

//         const lessonsWithQuizCount = await Promise.all(lessons.map(async (lesson) => {
//             const quizzes = await Quiz.find({ lesson_id: lesson._id });
//             const questionCount = quizzes.reduce((count, quiz) => count + quiz.questions.length, 0);

//             // Update the lesson's question_count field
//             lesson.question_count = questionCount;
//             await lesson.save();

//             const lessonObject = lesson.toObject();
//             lessonObject.completed_lesson = completedLessons.includes(lesson._id.toString());

//             return lessonObject;
//         }));

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             data: lessonsWithQuizCount,
//         });
//     } catch (error: any) {
//         console.error('Error fetching lessons by module ID:', error);
//         return res.status(500).json({
//             success: false,
//             status: 500,
//             message: error.message,
//         });
//     }
// };

export const getLessonByModuleId = async (req: Request, res: Response) => {
    try {
        const moduleId = req.params.id;
        const user_req = req.user as IUser;
        const user = await User.findById(user_req.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'User not found.',
            });
        }

        const lessons = await Lesson.find({ module_id: moduleId });

        if (!lessons || lessons.length === 0) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No lessons found for the given module ID.',
            });
        }

        const completedLessons = user.completed_lessons || [];

        const lessonsWithQuizCount = await Promise.all(lessons.map(async (lesson) => {
            // Cast lesson to ILesson to resolve TypeScript error
            const lessonTyped = lesson as ILesson;

            const quizzes = await Quiz.find({ lesson_id: lessonTyped._id });
            const questionCount = quizzes.reduce((count, quiz) => count + quiz.questions.length, 0);

            lessonTyped.question_count = questionCount;
            lessonTyped.completed_lesson = completedLessons.some((completedLessonId) =>
                completedLessonId.equals(lessonTyped._id)
            );

            await lessonTyped.save();

            return lessonTyped.toObject();
        }));

        return res.status(200).json({
            success: true,
            status: 200,
            data: lessonsWithQuizCount,
        });
    } catch (error: any) {
        console.error('Error fetching lessons by module ID:', error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message,
        });
    }
};
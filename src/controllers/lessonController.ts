import { Request, Response } from 'express';
import Joi from 'joi';
import Lesson from '../models/Lesson';

// // Create a new lesson
export const createLesson = async (req: Request, res: Response) => {
    try {
        const lessonSchema = Joi.object({
            lesson_name: Joi.string().required(),
            module_id: Joi.string().required(),
            quiz_ids: Joi.string().required(), 
            lesstionDetailsId: Joi.string().required(),  
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
            const { lesson_name, module_id, quiz_ids, lesstionDetailsId } = lessonData;
            const newLesson = new Lesson({
                lesson_name,
                module_id,
                quiz_ids,
                lesstionDetailsId
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
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Joi from "joi"
import LessonDetail from '../models/LessionDetails';

const APP_URL = process.env.APP_URL as string

// Validate for the lesson deatils 
const lessonDetailSchema = Joi.object({
    lesson_content: Joi.string().optional(),
    lessonId: Joi.string().required()
});


// Create Lesson Details 
export const createLessonDetails = async (req: Request, res: Response) => {
    try {
        const { error } = lessonDetailSchema.validate(req.body)
        if (error) {
            return res.status(400).json({
                success: false,
                status: 400,
                error: error.message
            })
        }
        
        const { lesson_content, lessonId } = req.body;

        // Check if files are uploaded
        if (!req.files || !('lesson_image' in req.files) || !('lesson_video' in req.files) || !('lesson_voice' in req.files)) {
            return res.status(400).json({ success: false, status: 400, message: 'Files are missing' });
        }

        const lesson_image = (req.files as any).lesson_image[0].filename;
        const lesson_video = (req.files as any).lesson_video[0].filename;
        const lesson_voice = (req.files as any).lesson_voice[0].filename;

        // Create a new lesson detail
        const newLessonDetail = new LessonDetail({
            lesson_image,
            lesson_video,
            lesson_content,
            lesson_voice,
            lessonId: new mongoose.Types.ObjectId(lessonId),
        });

        // Save the lesson detail
        const savedLessonDetail = await newLessonDetail.save();

        return res.status(201).json({
            success: true,
            status: 201,
            data: savedLessonDetail,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
}

// get LessonDetails by lesson id
export const getLessonDetailsByLessonId = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.id;
        const lessonDetail = await LessonDetail.findOne({ lessonId: lessonId });

        if (!lessonDetail) {
            return res.status(404).json({ success: false, status: 404, message: 'Lesson detail not found' });
        }

        lessonDetail.lesson_image = lessonDetail.lesson_image ? APP_URL + lessonDetail.lesson_image : ""
        lessonDetail.lesson_voice = lessonDetail.lesson_voice ? APP_URL + lessonDetail.lesson_voice : ""
        lessonDetail.lesson_video = lessonDetail.lesson_video ? APP_URL + lessonDetail.lesson_video : ""

        return res.status(200).json({
            success: true,
            status: 200,
            data: lessonDetail,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
}


// update lesson Information 
export const updateLessonDetailsById = async (req: Request, res: Response) => {
    try {
        const lessonDetailId = req.params.id;
        const { lesson_content } = req.body;


        const { error } = lessonDetailSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, status: 400, error: error.details[0].message });
        }

        // Find the lesson detail by ID
        const lessonDetail = await LessonDetail.findById(lessonDetailId);
        if (!lessonDetail) {
            return res.status(404).json({ success: false, status: 404, message: 'Lesson detail not found' });
        }

        // Update fields if they are provided
        if (lesson_content) {
            lessonDetail.lesson_content = lesson_content;
        }

        if (req.files) {
            if ('lesson_image' in req.files) {
                lessonDetail.lesson_image = (req.files as any).lesson_image[0].filename;
            }
            if ('lesson_video' in req.files) {
                lessonDetail.lesson_video = (req.files as any).lesson_video[0].filename;
            }
            if ('lesson_voice' in req.files) {
                lessonDetail.lesson_voice = (req.files as any).lesson_voice[0].filename;
            }
        }

        // Save the updated lesson detail
        const updatedLessonDetail = await lessonDetail.save();

        return res.status(200).json({
            success: true,
            status: 200,
            data: updatedLessonDetail,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
}

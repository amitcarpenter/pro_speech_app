import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Section from '../models/Section';
import User, { IUser } from '../models/User';
import Joi from 'joi';
import Lesson from '../models/Lesson';

const APP_URL = process.env.APP_URL as string

//==================================== Controller for USER side ==============================
interface ILesson {
    _id: Types.ObjectId;
    lesson_name: string;
    module_id: Types.ObjectId;
    quiz_ids: Types.ObjectId;
    lesstionDetailsId: Types.ObjectId;
    completed_by: Types.ObjectId[];
    question_count: number;
}

// Get All Section 
export const getSections = async (req: Request, res: Response) => {
    try {
        const sections = await Section.find().populate('modules');
        const user_req = req.user as IUser;
        const user = await User.findById(user_req.id);
        const completedLessons = user?.completed_lessons.map(id => id.toString()) ?? [];

        if (!sections) {
            return res.status(400).json({ success: false, status: 400, message: "Sections not found" });
        }

        const sectionsWithCompletion = await Promise.all(sections.map(async (section) => {
            const moduleIds = section.modules.map((module: { _id: Types.ObjectId }) => module._id);
            const lessons = await Lesson.find({ module_id: { $in: moduleIds } }) as ILesson[];
            const totalLessons = lessons.length;

            // Convert lesson IDs to strings for comparison
            const lessonIds = lessons.map(lesson => lesson._id.toString());

            // Count completed lessons related to this section
            const completedLessonsInSection = lessonIds.filter(lessonId => completedLessons.includes(lessonId)).length;
            console.log(completedLessonsInSection)

            // Calculate completion percentage
            const completionPercentage = totalLessons > 0 ? (completedLessonsInSection / totalLessons) * 100 : 0;
            console.log(completionPercentage)

            // Format section image URL
            if (section.section_image) {
                section.section_image = APP_URL + section.section_image;
            }

            return {
                ...section.toObject(),
                completionPercentage: completionPercentage.toFixed(2)
            };
        }));

        return res.status(200).json({
            success: true,
            status: 200,
            data: sectionsWithCompletion,
        });
    } catch (error: any) {
        console.error('Error fetching sections:', error);
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};


//==================================== Controller for ADMIN side ==============================

const sectionSchema = Joi.object({
    section_name: Joi.string().required(),
});

// Create Section 
export const createSection = async (req: Request, res: Response) => {
    try {
        const { error } = sectionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, status: 400, error: error.details[0].message });
        }
        const { section_name } = req.body;

        let section_image = null
        if (req.file) {
            section_image = req.file.filename
        }

        const newSection = new Section({
            section_image,
            section_name,
        });

        const savedSection = await newSection.save();
        return res.status(201).json({
            success: true,
            status: 201,
            message: 'Section created successfully',
            data: savedSection,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};


// update section
export const updateSection = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { section_name } = req.body;

        const updatedSection = await Section.findByIdAndUpdate(id, {
            section_name,
        }, { new: true });

        if (!updatedSection) {
            return res.status(404).json({ success: false, status: 404, message: 'Section not found' });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Section updated successfully',
            data: updatedSection,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};


// Delete section
export const deleteSection = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedSection = await Section.findByIdAndDelete(id);

        if (!deletedSection) {
            return res.status(404).json({ success: false, status: 404, message: 'Section not found' });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Section deleted successfully',
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

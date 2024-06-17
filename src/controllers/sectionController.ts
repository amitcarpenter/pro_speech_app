import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Section from '../models/Section';
import User, { IUser } from '../models/User';
import Joi from 'joi';
import Lesson from '../models/Lesson';

const APP_URL = process.env.APP_URL as string

const sectionSchema = Joi.object({
    section_name: Joi.string().required(),
});


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

// export const getSections = async (req: Request, res: Response) => {
//     try {
//         const sections = await Section.find()
//         const user_req = req.user as IUser
//         const user = await User.findById(user_req.id);
//         const lesson_ids = user?.completed_lessons
//         console.log(lesson_ids)
//         console.log(lesson_ids?.length)

//         if (!sections) {
//             return res.status(400).json({ success: false, status: 400, message: "sections not found" })
//         }

//         for (let section of sections) {
//             if (section.section_image) {
//                 section.section_image = APP_URL + section.section_image
//             }
//         }



//         return res.status(200).json({
//             success: true,
//             status: 200,
//             data: sections,

//         });
//     } catch (error: any) {
//         return res.status(500).json({ success: false, status: 500, error: error.message });
//     }
// };

export const getSectionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const section = await Section.findById(id)
        if (!section) {
            return res.status(404).json({ success: false, status: 404, message: 'Section not found' });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            data: section,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

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



// export const getSections = async (req: Request, res: Response) => {
//     try {
//         const sections = await Section.find().populate('modules');
//         const user_req = req.user as IUser;
//         const user = await User.findById(user_req.id);
//         const completedLessons = user?.completed_lessons ?? [];

//         if (!sections) {
//             return res.status(400).json({ success: false, status: 400, message: "Sections not found" });
//         }

//         // Loop through each section to calculate completion percentage
//         const sectionsWithCompletion = await Promise.all(sections.map(async (section) => {
//             // Fetch all modules and lessons related to this section
//             const moduleIds = section.modules.map((module) => module._id);
//             const lessons = await Lesson.find({ module_id: { $in: moduleIds } });
//             const totalLessons = lessons.length;

//             // Count completed lessons related to this section
//             const completedLessonsInSection = lessons.filter(lesson => completedLessons.includes(lesson._id.toString())).length;

//             // Calculate completion percentage
//             const completionPercentage = totalLessons > 0 ? (completedLessonsInSection / totalLessons) * 100 : 0;

//             // Format section image URL
//             if (section.section_image) {
//                 section.section_image = APP_URL + section.section_image;
//             }

//             return {
//                 ...section.toObject(),
//                 completionPercentage: completionPercentage.toFixed(2)
//             };
//         }));

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             data: sectionsWithCompletion,
//         });
//     } catch (error: any) {
//         console.error('Error fetching sections:', error);
//         return res.status(500).json({ success: false, status: 500, error: error.message });
//     }
// };

interface ILesson {
    _id: Types.ObjectId;
    lesson_name: string;
    module_id: Types.ObjectId;
    quiz_ids: Types.ObjectId;
    lesstionDetailsId: Types.ObjectId;
    completed_by: Types.ObjectId[];
    question_count: number;
}

// export const getSections = async (req: Request, res: Response) => {
//     try {
//         const sections = await Section.find().populate('modules');
//         const user_req = req.user as IUser;
//         const user = await User.findById(user_req.id);
//         const completedLessons = user?.completed_lessons.map(id => new Types.ObjectId(id)) ?? [];

//         if (!sections) {
//             return res.status(400).json({ success: false, status: 400, message: "Sections not found" });
//         }
//         const sectionsWithCompletion = await Promise.all(sections.map(async (section) => {
//             const moduleIds = section.modules.map((module: { _id: Types.ObjectId }) => module._id);
//             const lessons = await Lesson.find({ module_id: { $in: moduleIds } }) as ILesson[];
//             const totalLessons = lessons.length;

//             console.log(totalLessons)
//             const completedLessonsInSection = lessons.filter((lesson: ILesson) => completedLessons.includes(lesson._id)).length;
//             console.log(completedLessonsInSection)

//             // Calculate completion percentage
//             const completionPercentage = totalLessons > 0 ? (completedLessonsInSection / totalLessons) * 100 : 0;

//             // Format section image URL
//             if (section.section_image) {
//                 section.section_image = APP_URL + section.section_image;
//             }

//             return {
//                 ...section.toObject(),
//                 completionPercentage: completionPercentage.toFixed(2)
//             };
//         }));

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             data: sectionsWithCompletion,
//         });
//     } catch (error: any) {
//         console.error('Error fetching sections:', error);
//         return res.status(500).json({ success: false, status: 500, error: error.message });
//     }
// };



export const getSections = async (req: Request, res: Response) => {
    try {
        const sections = await Section.find().populate('modules');
        const user_req = req.user as IUser;
        const user = await User.findById(user_req.id);
        const completedLessons = user?.completed_lessons.map(id => id.toString()) ?? [];

        if (!sections) {
            return res.status(400).json({ success: false, status: 400, message: "Sections not found" });
        }

        // Loop through each section to calculate completion percentage
        const sectionsWithCompletion = await Promise.all(sections.map(async (section) => {
            // Fetch all modules and lessons related to this section
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
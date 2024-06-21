import { Request, Response } from 'express';
import Joi from 'joi';
import  { Types } from 'mongoose';
import Module from '../../models/Module';
import Lesson from '../../models/Lesson';
import Section from '../../models/Section';

const APP_URL = process.env.APP_URL as string


//==================================== Controller for User side ==============================

// Get All Modules
export const getAllModules = async (req: Request, res: Response) => {
    try {
        const modules = await Module.find();
        for (let module of modules) {
            if (module.module_image) {
                module.module_image = APP_URL + module.module_image
            }
        }
        return res.status(200).json({
            success: true,
            status: 200,
            data: modules,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, message: error.message });
    }
};

// Get Module by section id
export const getModuleBySectionId = async (req: Request, res: Response) => {
    try {
        const sectionId = req.params.id;
        console.log(sectionId);
        const modules = await Module.find({ section_id: sectionId });

        if (!modules.length) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No modules found for the given section ID.',
            });
        }

        const modulesWithLessonCount = await Promise.all(modules.map(async (module) => {
            const lessonCount = await Lesson.countDocuments({ module_id: module._id });
            const moduleWithLessonCount = module.toObject();
            moduleWithLessonCount.lesson_count = lessonCount;

            if (moduleWithLessonCount.module_image) {
                moduleWithLessonCount.module_image = APP_URL + moduleWithLessonCount.module_image;
            }

            return moduleWithLessonCount;
        }));

        return res.status(200).json({
            success: true,
            status: 200,
            data: modulesWithLessonCount,
        });
    } catch (error: any) {
        console.error('Error fetching modules by section ID:', error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message,
        });
    }
};



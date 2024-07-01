import { Request, Response } from 'express';
import Joi from 'joi';
import { Types } from 'mongoose';
import Module from '../../models/Module';
import Lesson from '../../models/Lesson';
import Section from '../../models/Section';
import { deleteImageFile } from '../../services/deleteImages';

const APP_URL = process.env.APP_URL as string


//==================================== Controller for ADMIN side ==============================

// Create Modules 
export const createModule = async (req: Request, res: Response) => {
    try {
        const isValidObjectId = (id: string) => Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
        const moduleSchema = Joi.object({
            module_name: Joi.string().required(),
            section_id: Joi.string().custom((value, helpers) => {
                if (!isValidObjectId(value)) {
                    return helpers.message({ custom: 'Invalid section_id' });
                }
                return value;
            }).required(),
        });
        const modulesData = req.body;
        const { error } = moduleSchema.validate(modulesData);
        if (error) {
            return res.status(400).json({ success: false, status: 400, error: error.details[0].message });
        }

        let module_image = null;
        if (req.file) {
            module_image = req.file.filename
        }
        const { module_name, section_id } = modulesData;

        const newModule = new Module({
            module_name,
            section_id: new Types.ObjectId(section_id),
            module_image

        });
        const savedModule = await newModule.save();
        const updatedSection = await Section.findByIdAndUpdate(
            section_id,
            { $push: { modules: savedModule._id } },
            { new: true }
        );

        if (!updatedSection) {
            throw new Error('Section not found or could not be updated.');
        }
        return res.status(201).json({
            success: true,
            status: 201,
            message: 'Modules created successfully',
            data: savedModule,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

// update module
export const updateModuleById = async (req: Request, res: Response) => {
    try {
        const { module_name } = req.body;

        const updateModuleData = await Module.findById(req.params.id)
        if (!updateModuleData) {
            return res.status(404).json({
                success: true,
                status: 404,
                message: "Module Not Found"
            })
        }

        let module_image = null;
        if (req.file) {
            module_image = req.file.filename
        } else {
            module_image = updateModuleData.module_image
        }

        const file_name = "module_image"
        await deleteImageFile(Module, req.params.id, file_name)

        const updatedModule = await Module.findByIdAndUpdate(
            req.params.id,
            {
                module_name,
                module_image
            },
            { new: true }
        );

        if (!updatedModule) {
            return res.status(404).json({ success: false, status: 404, message: 'Module not found' });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Module updated successfully',
            data: updatedModule,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, message: error.message });
    }
};

// Delete module by id
export const deleteModuleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const deletedModule = await Module.findByIdAndDelete(req.params.id);
        console.log(deletedModule)
        if (!deletedModule) {
            return res.status(404).json({ success: false, status: 404, message: 'Module not found' });
        }
        const file_name = "section_image"
        await deleteImageFile(Section, id, file_name)
        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Module deleted successfully',
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, message: error.message });
    }
};

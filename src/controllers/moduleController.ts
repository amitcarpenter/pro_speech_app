import { Request, Response } from 'express';
import Joi from 'joi';
import mongoose, { Types } from 'mongoose';
import Module, { IModule } from '../models/Module';

const APP_URL = process.env.APP_URL as string

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

// Get module by id
export const getModuleById = async (req: Request, res: Response) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ success: false, status: 404, message: 'Module not found' });
        }
        return res.status(200).json({
            success: true,
            status: 200,
            data: module,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, message: error.message });
    }
};

// update module
export const updateModuleById = async (req: Request, res: Response) => {
    try {
        const { module_name } = req.body;
        const updatedModule = await Module.findByIdAndUpdate(
            req.params.id,
            {
                module_name,
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
        const deletedModule = await Module.findByIdAndDelete(req.params.id);
        console.log(deletedModule)
        if (!deletedModule) {
            return res.status(404).json({ success: false, status: 404, message: 'Module not found' });
        }
        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Module deleted successfully',
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, message: error.message });
    }
};

// Get Module by section id
export const getModuleBySectionId = async (req: Request, res: Response) => {
    try {
        const sectionId = req.params.id;
        console.log(sectionId)
        const modules = await Module.find({ section_id: sectionId });

        if (!modules.length) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No modules found for the given section ID.',
            });
        }

        modules.forEach(module => {
            if (module.module_image) {
                module.module_image = APP_URL + module.module_image;
            }
        });

        return res.status(200).json({
            success: true,
            status: 200,
            data: modules,
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
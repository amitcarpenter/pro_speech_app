import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Section from '../models/Section';
import Joi from 'joi';

const sectionSchema = Joi.object({
    section_name: Joi.string().required(),
    modules: Joi.array().items(Joi.string().custom((value, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
            return helpers.message({ custom: 'Invalid module ID' });
        }
        return value;
    })).optional(),
    completed_by: Joi.array().items(Joi.string().custom((value, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
            return helpers.message({ custom: 'Invalid user ID' });
        }
        return value;
    })).optional(),
});


export const createSection = async (req: Request, res: Response) => {
    try {
        const { error } = sectionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, status: 400, error: error.details[0].message });
        }

        const { section_name, modules, completed_by } = req.body;

        const newSection = new Section({

            section_name,
            modules: modules.map((id: string) => new Types.ObjectId(id)),
            completed_by: completed_by.map((id: string) => new Types.ObjectId(id)),
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

export const getSections = async (req: Request, res: Response) => {
    try {
        const sections = await Section.find()
        // const sections = await Section.find().populate('modules').populate('completed_by');
        return res.status(200).json({
            success: true,
            status: 200,
            data: sections,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

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
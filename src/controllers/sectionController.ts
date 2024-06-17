import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Section from '../models/Section';
import User, { IUser } from '../models/User';
import Joi from 'joi';
import { stat } from 'fs';

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

export const getSections = async (req: Request, res: Response) => {
    try {
        const sections = await Section.find()
        const user_req = req.user as IUser
        const user = await User.findById(user_req.id);

        if (!sections) {
            return res.status(400).json({ success: false, status: 400, message: "sections not found" })
        }

        for (let section of sections) {
            if (section.section_image) {
                section.section_image = APP_URL + section.section_image
            }
        }

        // let score = 

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
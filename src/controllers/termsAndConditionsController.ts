import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TermsCondition, { ITermsCondition } from '../models/TermsAndConditions';

// Create Terms and Conditions
export const createTermsCondition = async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;
        const newTermsCondition = new TermsCondition({ title, content });
        const savedTermsCondition = await newTermsCondition.save();
        return res.status(201).json({ success: true, status: 201, data: savedTermsCondition });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

// Get All Terms and Conditions
export const getAllTermsConditions = async (req: Request, res: Response) => {
    try {
        const termsConditions = await TermsCondition.find();
        return res.status(200).json({ success: true, status: 200, data: termsConditions });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

// Get Terms and Conditions by ID
export const getTermsConditionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const termsCondition = await TermsCondition.findById(id);
        if (!termsCondition) {
            return res.status(404).json({ success: false, status: 404, message: 'Terms and Conditions not found' });
        }
        return res.status(200).json({ success: true, status: 200, data: termsCondition });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

// Update Terms and Conditions by ID
export const updateTermsCondition = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const updatedTermsCondition = await TermsCondition.findByIdAndUpdate(
            id,
            { title, content },
            { new: true, runValidators: true }
        );
        if (!updatedTermsCondition) {
            return res.status(404).json({ success: false, status: 404, message: 'Terms and Conditions not found' });
        }
        return res.status(200).json({ success: true, status: 200, data: updatedTermsCondition });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

// Delete Terms and Conditions by ID
export const deleteTermsCondition = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedTermsCondition = await TermsCondition.findByIdAndDelete(id);
        if (!deletedTermsCondition) {
            return res.status(404).json({ success: false, status: 404, message: 'Terms and Conditions not found' });
        }
        return res.status(200).json({ success: true, status: 200, data: deletedTermsCondition });
    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, error: error.message });
    }
};

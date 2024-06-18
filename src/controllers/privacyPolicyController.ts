import { Request, Response } from 'express';
import PrivacyPolicy from '../models/PrivacyPolicy';

// Create a new Privacy Policy
export const createPrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;

        const newPrivacyPolicy = new PrivacyPolicy({
            title,
            content,
        });

        const savedPrivacyPolicy = await newPrivacyPolicy.save();
        return res.status(201).json({
            success: true,
            status: 201,
            data: savedPrivacyPolicy,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
};

// Get all Privacy Policies
export const getAllPrivacyPolicies = async (req: Request, res: Response) => {
    try {
        const privacyPolicies = await PrivacyPolicy.find();
        return res.status(200).json({
            success: true,
            status: 200,
            data: privacyPolicies,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
};

// Get a single Privacy Policy by ID
export const getPrivacyPolicyById = async (req: Request, res: Response) => {
    try {
        const privacyPolicy = await PrivacyPolicy.findById(req.params.id);

        if (!privacyPolicy) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Privacy Policy not found',
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            data: privacyPolicy,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
};

// Update a Privacy Policy by ID
export const updatePrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;

        const updatedPrivacyPolicy = await PrivacyPolicy.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true, runValidators: true }
        );

        if (!updatedPrivacyPolicy) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Privacy Policy not found',
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            data: updatedPrivacyPolicy,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
};

// Delete a Privacy Policy by ID
export const deletePrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const deletedPrivacyPolicy = await PrivacyPolicy.findByIdAndDelete(req.params.id);

        if (!deletedPrivacyPolicy) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Privacy Policy not found',
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            data: deletedPrivacyPolicy,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
};
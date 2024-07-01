import { Request, Response } from 'express';
import PrivacyPolicy from '../../models/PrivacyPolicy';

// Create a new Privacy Policy
export const createPrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const { title, subTitle, content, html } = req.body;

        if (!html) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "HTML Not Provided"
            })
        }

        const newPrivacyPolicy = new PrivacyPolicy({
            title,
            subTitle,
            content,
            html
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
        const privacyPolicies = await PrivacyPolicy.findOne();
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

// Update a Privacy Policy by ID
export const updatePrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const { title, subTitle, content, html } = req.body;
        const privacyPolicy = await PrivacyPolicy.findOne();

        if (!html) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "HTML Not Provided"
            })
        }

        if (!privacyPolicy) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Privacy Policy not found',
            });
        }

        privacyPolicy.title = title;
        privacyPolicy.subTitle = subTitle;
        privacyPolicy.content = content;
        privacyPolicy.html = html;

        const updatedPrivacyPolicy = await privacyPolicy.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Privacy Policy updated successfully",
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

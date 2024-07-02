import Joi from "joi";
import File from "../../models/File";
import { Request, Response } from "express";
import { deleteImageFile } from "../../services/deleteImages";


const APP_URL = process.env.APP_URL as string;

export const fileSchema = Joi.object({
    file_name: Joi.string().required(),
});

export const fileUpdateSchema = Joi.object({
    file_name: Joi.string().optional(),
});

// Upload a new file
export const uploadFile = async (req: Request, res: Response) => {
    try {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>")
        console.log(req.body)
        const { error } = fileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: error.details[0].message,
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Please upload a file',
            });
        }

        const { file_name } = req.body;
        const file_type = req.file.mimetype;
        let file_url = req.file.filename;

        const newFile = new File({ file_name, file_url, file_type });


        await newFile.save();

        return res.status(201).json({
            success: true,
            status: 201,
            message: "File uploaded successfully",
            data: newFile,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message,
        });
    }
};

// Update an existing file
export const updateFile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = fileUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: error.details[0].message,
            });
        }

        const fileData = await File.findById(id)
        if (!fileData) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "File Not Found",
            });
        }
        const { file_name } = req.body
        let file_url = null
        let file_type = null
        if (req.file) {
            file_url = req.file.filename
            file_type = req.file.mimetype;

            const file_name_url = "file_url"
            await deleteImageFile(File, req.params.id, file_name_url)
        } else {
            file_url = fileData?.file_url
            file_type = fileData?.file_type
        }
        const updatedFile = await File.findByIdAndUpdate(id, { file_name, file_url, file_type }, {
            new: true,
        });
        if (!updatedFile) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "File not found",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "File updated successfully",
            data: updatedFile,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message,
        });
    }
};

// Delete a file
export const deleteFile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const file_name_url = "file_url"
        await deleteImageFile(File, req.params.id, file_name_url)
        const deletedFile = await File.findByIdAndDelete(id);
        if (!deletedFile) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "File not found",
            });
        }


        return res.status(200).json({
            success: true,
            status: 200,
            message: "File deleted successfully",
            data: deletedFile,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message,
        });
    }
};

// Get all files
export const getAllFiles = async (req: Request, res: Response) => {
    try {
        const { search } = req.query
        let query = {};
        if (search) {
            query = { file_name: { $regex: search, $options: 'i' } };
        }
        const files = await File.find(query);
        if (!files) {
            return res.status(200).json({
                success: false,
                status: 404,
                message: "files not found",
            });
        }
        files.map((file) => {
            file.file_url = APP_URL + file.file_url
        })

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Files retrieved successfully",
            data: files,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message,
        });
    }
};

// Get a file by ID
export const getFileById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "File not found",
            });
        }

        file.file_url = APP_URL + file.file_url

        return res.status(200).json({
            success: true,
            status: 200,
            message: "File retrieved successfully",
            data: file,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message,
        });
    }
};

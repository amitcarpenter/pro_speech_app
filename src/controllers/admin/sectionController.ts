import { Request, Response } from "express";
import { Types } from "mongoose";
import Section, { ISection } from "../../models/Section";
import User, { IUser } from "../../models/User";
import Joi from "joi";
import Lesson from "../../models/Lesson";
import Module, { IModule } from "../../models/Module";

const APP_URL = process.env.APP_URL as string;

//==================================== Controller for ADMIN side ==============================

const sectionSchema = Joi.object({
  section_name: Joi.string().required(),
});

// Create Section
export const createSection = async (req: Request, res: Response) => {
  try {
    const { error } = sectionSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, status: 400, error: error.details[0].message });
    }
    const { section_name } = req.body;

    let section_image = null;
    if (req.file) {
      section_image = req.file.filename;
    }

    const newSection = new Section({
      section_image,
      section_name,
    });

    const savedSection = await newSection.save();
    return res.status(201).json({
      success: true,
      status: 201,
      message: "Section created successfully",
      data: savedSection,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

// update section
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { section_name } = req.body;

    let section_image = null;
    if (req.file) {
      console.log(section_image);
      section_image = req.file.filename;
    }
    console.log(req.body);
    console.log(req.file);

    const updatedSection = await Section.findByIdAndUpdate(
      id,
      {
        section_name,
        section_image,
      },
      { new: true }
    );

    if (!updatedSection) {
      return res
        .status(404)
        .json({ success: false, status: 404, message: "Section not found" });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

// Delete section
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedSection = await Section.findByIdAndDelete(id);

    if (!deletedSection) {
      return res
        .status(404)
        .json({ success: false, status: 404, message: "Section not found" });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Section deleted successfully",
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

// export const sidebarshow = async (req: Request, res: Response) => {
//     try {
//       // Fetch all sections
//       const sections = await Section.find({}, { section_name: 1 });

//       // Fetch all modules
//       const modules = await Module.find({}, { module_name: 1, section_id: 1 });

//       // Prepare section data with modules
//       const sectionData = sections.map(section => {
//         // Filter modules for the current section
//         const sectionModules = modules.filter(module =>
//           module.section_id.toString() === section._id.toString()
//         );
//         // Extract module names
//         const moduleNames = sectionModules.map(module => module.module_name);

//         return {
//           section: section.section_name,
//           modules: moduleNames
//         };
//       });

//       return res.status(200).json({
//         success: true,
//         status: 200,
//         message: "Data successfully fetched",
//         data: sectionData
//       });
//     } catch (error: any) {
//       return res.status(500).json({ success: false, status: 500, error: error.message });
//     }
//   };

export const sidebarshow = async (req: Request, res: Response) => {
  try {
    // Fetch all sections
    const sections: ISection[] = await Section.find({}, { section_name: 1 });

    // Fetch all modules
    const modules: IModule[] = await Module.find(
      {},
      { module_name: 1, section_id: 1 }
    );

    const sectionData = sections.map((section) => {
      const sectionModules = modules.filter(
        (module) => module.section_id.toString() === section._id.toString()
      );
      // Extract module names
      const moduleData = sectionModules.map(module => ({
        _id: module._id,
        module_name: module.module_name
      }));

      return {
        section: section.section_name,
        modules: moduleData,
      };
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Data successfully fetched",
      data: sectionData,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

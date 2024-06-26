import { Request, Response } from "express";
import { Types } from "mongoose";
import Section, { ISection } from "../../models/Section";
import User, { IUser } from "../../models/User";
import Joi from "joi";
import Lesson from "../../models/Lesson";
import Module, { IModule } from "../../models/Module";
import { deleteImageFile } from "../../services/deleteImages";

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
    const sectionData = await Section.findById(id)
    if (!sectionData) {
      return res
        .status(404)
        .json({ success: false, status: 404, message: "Section Not Found" });
    }
    let section_image = null;
    const file_name = "section_image"
    await deleteImageFile(Section, id, file_name)
    if (req.file) {
      console.log(section_image);
      section_image = req.file.filename;
    } else {
      section_image = sectionData.section_image
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

    const file_name = "section_image"
    await deleteImageFile(Section, id, file_name)

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


// Sidebar 
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


// Get All Section for admin
interface ILesson {
  _id: Types.ObjectId;
  lesson_name: string;
  module_id: Types.ObjectId;
  quiz_ids: Types.ObjectId;
  lesstionDetailsId: Types.ObjectId;
  completed_by: Types.ObjectId[];
  question_count: number;
}
// export const getSectionsForAdmin = async (req: Request, res: Response) => {
//   try {
//     // Fetch sections and populate modules and lessons
//     const sections = await Section.find().populate({path: "modules"});

//     const user_req = req.user as IUser;
//     const user = await User.findById(user_req.id);
//     const completedLessons = user?.completed_lessons.map((id) => id.toString()) ?? [];

//     if (!sections) {
//       return res.status(400).json({ success: false, status: 400, message: "Sections not found" });
//     }

//     const sectionsWithCompletion = await Promise.all(
//       sections.map(async (section) => {
//         const moduleIds = section.modules.map((module: { _id: Types.ObjectId }) => module._id);

//         // Fetch lessons related to modules in the section
//         const lessons = (await Lesson.find({ module_id: { $in: moduleIds } })) as ILesson[];
//         const totalLessons = lessons.length;

//         // Convert lesson IDs to strings for comparison
//         const lessonIds = lessons.map((lesson) => lesson._id.toString());

//         // Count completed lessons related to this section
//         const completedLessonsInSection = lessonIds.filter((lessonId) =>
//           completedLessons.includes(lessonId)
//         ).length;

//         // Calculate completion percentage
//         const completionPercentage = totalLessons > 0 ? (completedLessonsInSection / totalLessons) * 100 : 0;

//         // Format section image URL
//         if (section.section_image) {
//           section.section_image = APP_URL + section.section_image;
//         }

//         // Format module image URLs
//         const formattedModules = section.modules.map((module: any) => {
//           if (module.module_image) {
//             module.module_image = APP_URL + module.module_image;
//           }
//           return module;
//         });

//         return {
//           ...section.toObject(),
//           modules: formattedModules,
//           completionPercentage: completionPercentage.toFixed(2),
//         };
//       })
//     );

//     return res.status(200).json({
//       success: true,
//       status: 200,
//       data: sectionsWithCompletion,
//     });
//   } catch (error: any) {
//     console.error("Error fetching sections:", error);
//     return res.status(500).json({ success: false, status: 500, error: error.message });
//   }
// };



export const getSectionsForAdmin = async (req: Request, res: Response) => {
  try {
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);
    const completedLessons = user?.completed_lessons.map((id) => id.toString()) ?? [];

    // Aggregation pipeline
    const sectionsWithCompletion = await Section.aggregate([
      {
        $lookup: {
          from: "modules",
          localField: "modules",
          foreignField: "_id",
          as: "modules",
        },
      },
      {
        $unwind: "$modules",
      },
      {
        $lookup: {
          from: "lessons",
          localField: "modules._id",
          foreignField: "module_id",
          as: "lessons",
        },
      },
      {
        $addFields: {
          "modules.totalLessons": { $size: "$lessons" },
          "modules.completedLessonsInModule": {
            $size: {
              $filter: {
                input: "$lessons",
                as: "lesson",
                cond: { $in: [{ $toString: "$$lesson._id" }, completedLessons] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          "modules.completionPercentage": {
            $cond: {
              if: { $gt: ["$modules.totalLessons", 0] },
              then: {
                $multiply: [
                  { $divide: ["$modules.completedLessonsInModule", "$modules.totalLessons"] },
                  100,
                ],
              },
              else: 0,
            },
          },
          "modules.module_image": {
            $cond: {
              if: { $ifNull: ["$modules.module_image", false] },
              then: { $concat: [APP_URL, "$modules.module_image"] },
              else: null,
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          section_name: { $first: "$section_name" },
          section_image: { $first: "$section_image" },
          modules: { $push: "$modules" },
        },
      },
      {
        $addFields: {
          totalLessons: { $sum: "$modules.totalLessons" },
          completedLessonsInSection: { $sum: "$modules.completedLessonsInModule" },
        },
      },
      {
        $addFields: {
          completionPercentage: {
            $cond: {
              if: { $gt: ["$totalLessons", 0] },
              then: {
                $multiply: [
                  { $divide: ["$completedLessonsInSection", "$totalLessons"] },
                  100,
                ],
              },
              else: 0,
            },
          },
          section_image: {
            $cond: {
              if: { $ifNull: ["$section_image", false] },
              then: { $concat: [APP_URL, "$section_image"] },
              else: null,
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    if (!sectionsWithCompletion.length) {
      return res.status(400).json({ success: false, status: 400, message: "Sections not found" });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      data: sectionsWithCompletion,
    });
  } catch (error: any) {
    console.error("Error fetching sections:", error);
    return res.status(500).json({ success: false, status: 500, error: error.message });
  }
};


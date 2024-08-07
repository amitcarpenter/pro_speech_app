import { Request, Response } from "express";
import { Types } from "mongoose";
import Lesson from "../../models/Lesson";
import Section from "../../models/Section";
import User, { IUser } from "../../models/User";


const APP_URL = process.env.APP_URL as string;

//==================================== Controller for USER side ==============================
interface ILesson {
  _id: Types.ObjectId;
  lesson_name: string;
  module_id: Types.ObjectId;
  quiz_ids: Types.ObjectId;
  lesstionDetailsId: Types.ObjectId;
  completed_by: Types.ObjectId[];
  question_count: number;
}

// Get All Section
// Chat gpt response 
// export const getSections = async (req: Request, res: Response) => {
//   try {
//     const user_req = req.user as IUser;
//     const user = await User.findById(user_req.id);
//     const completedLessons = user?.completed_lessons.map((id) => id.toString()) ?? [];

//     // Aggregation pipeline
//     const sectionsWithCompletion = await Section.aggregate([
//       {
//         $lookup: {
//           from: "modules",
//           localField: "modules",
//           foreignField: "_id",
//           as: "modules",
//         },
//       },
//       {
//         $unwind: "$modules",
//       },
//       {
//         $lookup: {
//           from: "lessons",
//           localField: "modules._id",
//           foreignField: "module_id",
//           as: "lessons",
//         },
//       },
//       {
//         $addFields: {
//           totalLessons: { $size: "$lessons" },
//           completedLessonsInSection: {
//             $size: {
//               $filter: {
//                 input: "$lessons",
//                 as: "lesson",
//                 cond: { $in: [{ $toString: "$$lesson._id" }, completedLessons] },
//               },
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           completionPercentage: {
//             $cond: {
//               if: { $gt: ["$totalLessons", 0] },
//               then: {
//                 $multiply: [
//                   { $divide: ["$completedLessonsInSection", "$totalLessons"] },
//                   100,
//                 ],
//               },
//               else: 0,
//             },
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           section_name: { $first: "$section_name" },
//           section_image: { $first: "$section_image" },
//           modules: { $push: "$modules" },
//           totalLessons: { $sum: "$totalLessons" },  // Sum all lessons in the section
//           completedLessonsInSection: { $sum: "$completedLessonsInSection" },  // Sum all completed lessons in the section
//         },
//       },
//       {
//         $addFields: {
//           completionPercentage: {
//             $cond: {
//               if: { $gt: ["$totalLessons", 0] },
//               then: {
//                 $multiply: [
//                   { $divide: ["$completedLessonsInSection", "$totalLessons"] },
//                   100
//                 ]
//               },
//               else: 0
//             }
//           },
//           section_image: {
//             $cond: {
//               if: { $ifNull: ["$section_image", false] },
//               then: { $concat: [APP_URL, "$section_image"] },
//               else: null,
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           completionPercentage: { $round: ["$completionPercentage", 2] }
//         },
//       },
//       { $sort: { _id: 1 } }
//     ]);

//     if (!sectionsWithCompletion) {
//       return res
//         .status(400)
//         .json({ success: false, status: 400, message: "Sections not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       status: 200,
//       data: sectionsWithCompletion,
//     });
//   } catch (error: any) {
//     console.error("Error fetching sections:", error);
//     return res
//       .status(500)
//       .json({ success: false, status: 500, error: error.message });
//   }
// };


export const getSections = async (req: Request, res: Response) => {
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
        $unwind: {
          path: "$modules",
          preserveNullAndEmptyArrays: true,
        },
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
          totalLessons: { $size: "$lessons" },
          completedLessonsInSection: {
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
        },
      },
      {
        $group: {
          _id: "$_id",
          section_name: { $first: "$section_name" },
          section_image: { $first: "$section_image" },
          modules: { $push: "$modules" },
          totalLessons: { $sum: "$totalLessons" },  // Sum all lessons in the section
          completedLessonsInSection: { $sum: "$completedLessonsInSection" },  // Sum all completed lessons in the section
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
        $addFields: {
          completionPercentage: { $round: ["$completionPercentage", 2] },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    if (!sectionsWithCompletion) {
      return res
        .status(400)
        .json({ success: false, status: 400, message: "Sections not found" });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      data: sectionsWithCompletion,
    });
  } catch (error: any) {
    console.error("Error fetching sections:", error);
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

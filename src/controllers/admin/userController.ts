import { Request, Response } from "express";
import User, { IUser } from "../../models/User";
import { Types } from "mongoose";
import Section from "../../models/Section";
import { handleError } from "../../utils/errorHandle";
import Lesson from "../../models/Lesson";
import Score from "../../models/Score";
import Joi from "joi";
import { deleteImageFile } from "../../services/deleteImages";

const APP_URL = process.env.APP_URL as string;

// Get User List
export const get_user_list = async (req: Request, res: Response) => {
  try {
    const user_list = await User.find({ role: { $ne: "admin" } });

    if (!user_list) {
      return handleError(res, 404, "user list not found");
    }

    user_list.map((user) => {
      user.profile.profileImage = APP_URL + user.profile.profileImage
    })
    return res.status(200).json({
      success: true,
      status: 200,
      data: user_list,
    });
  } catch (error: any) {
    return handleError(res, 500, error.message);
  }
};

// User Deatials
interface ILesson {
  _id: Types.ObjectId;
  lesson_name: string;
  module_id: Types.ObjectId;
  quiz_ids: Types.ObjectId;
  lesstionDetailsId: Types.ObjectId;
  completed_by: Types.ObjectId[];
  question_count: number;
}
export const get_user_details = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(id);

    // User Information
    const userData = await User.findOne({ _id: id });
    if (!userData) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'User Not Found',
      });
    }
    userData.profile.profileImage = APP_URL + userData.profile.profileImage

    // Section Information
    const sections = await Section.find().populate("modules");
    const user = await User.findById(id);
    const completedLessons =
      user?.completed_lessons.map((id) => id.toString()) ?? [];

    if (!sections) {
      return res
        .status(400)
        .json({ success: false, status: 400, message: "Sections not found" });
    }

    const sectionsWithCompletion = await Promise.all(
      sections.map(async (section) => {
        const moduleIds = section.modules.map(
          (module: { _id: Types.ObjectId }) => module._id
        );
        const lessons = (await Lesson.find({
          module_id: { $in: moduleIds },
        })) as ILesson[];
        const totalLessons = lessons.length;

        // Convert lesson IDs to strings for comparison
        const lessonIds = lessons.map((lesson) => lesson._id.toString());

        // Count completed lessons related to this section
        const completedLessonsInSection = lessonIds.filter((lessonId) =>
          completedLessons.includes(lessonId)
        ).length;

        // Calculate completion percentage
        const completionPercentage =
          totalLessons > 0
            ? (completedLessonsInSection / totalLessons) * 100
            : 0;

        // Format section image URL
        if (section.section_image) {
          section.section_image = APP_URL + section.section_image;
        }

        return {
          ...section.toObject(),
          completionPercentage: completionPercentage.toFixed(2),
        };
      })
    );

    // Score Board Information

    console.log(id, "id");
    const userForScore = await User.findById(id);
    console.log(userForScore, "userScoredData");

    if (!userForScore) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User not found",
      });
    }
    const scoreData = await Score.find({ userId: userForScore.id }).populate({
      path: "lessonId",
      select: "lesson_name",
    });

    // Calculate total scores and total questions
    const totalScores = scoreData.reduce(
      (sum, score) => sum + score.score_number,
      0
    );
    const totalQuestions = scoreData.reduce(
      (sum, score) => sum + score.total_question,
      0
    );

    // Calculate the percentage score
    const percentage =
      totalQuestions > 0 ? (totalScores / totalQuestions) * 100 : 0;

    // Calculate the highest percentage from individual scores
    const highestPercentage = scoreData.reduce((max, score) => {
      const scorePercentage = (score.score_number / score.total_question) * 100;
      return scorePercentage > max ? scorePercentage : max;
    }, 0);

    // Determine SMS message based on percentage range
    let smsMessage = "";
    if (highestPercentage >= 75) {
      smsMessage = "Yey! You are doing better!";
    } else if (highestPercentage >= 50) {
      smsMessage = "You are doing good!";
    } else {
      smsMessage = "Keep improving!";
    }

    // Map score data to include lesson name
    const scoreDataWithLessonNames = scoreData.map((score) => ({
      ...score.toObject(),
      lesson_name: (score.lessonId as any).lesson_name,
    }));

    // Sort the score data by score_number in descending order
    const sortedScoreData = scoreDataWithLessonNames.sort(
      (a, b) => b.score_number - a.score_number
    );

    return res.status(200).json({
      success: true,
      status: 200,
      sectionsWithCompletion,
      userData,
      scoreData: {
        scoreData: sortedScoreData || null,
        totalScores: totalScores || null,
        totalQuestions: totalQuestions || null,
        percentage: percentage.toFixed(2),
        smsMessage: smsMessage || null,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: true,
      status: 500,
      error: error.messsage,
    });
  }
};

// delete user by id
export const delete_user_by_id = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file_name = "profile.profileImage"
    await deleteImageFile(User, id, file_name)
    const user_delete = await User.findByIdAndDelete(id);
    console.log(user_delete);
    if (!user_delete) {
      return handleError(res, 404, "user  not found");
    }
    return res.status(200).json({
      success: true,
      status: 200,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return handleError(res, 500, error.message);
  }
};

// update user profile
export const updateUserProfileByAdmin = async (req: Request, res: Response) => {
  try {
    const updateProfileSchema = Joi.object({
      fullName: Joi.string().optional(),
      nickName: Joi.string().optional(),
      dateOfBirth: Joi.date().iso().optional(),
      gender: Joi.string().valid("Male", "Female", "Other").optional(),
      phone: Joi.string().min(10).max(15).optional(),
    });



    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }
    console.log(req.file);

    const { fullName, nickName, dateOfBirth, gender, phone } = req.body;
    const { id } = req.params;
    // const user_req = req.user as IUser;
    const user = await User.findById(id);

    if (user) {
      if (fullName) user.profile.fullName = fullName;
      if (nickName) user.profile.nickName = nickName;
      if (dateOfBirth) user.profile.dateOfBirth = dateOfBirth;
      if (gender) user.profile.gender = gender;
      if (phone) {
        user.profile.phone = phone;
        user.phone = phone;
      }
      if (req.file) {
        user.profile.profileImage = req.file.filename;
        console.log(req.file.filename);
      } else {
        user.profile.profileImage = user.profile.profileImage
      }

      const file_name = "profile.profileImage"
      await deleteImageFile(User, id, file_name)

      await user.save();
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Profile updated successfully.",
      });
    } else {
      return res.status(404).json({
        success: false,
        status: 400,
        message: "User not found.",
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};  

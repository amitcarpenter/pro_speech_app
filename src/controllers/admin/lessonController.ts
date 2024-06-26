import { Request, Response } from "express";
import Joi from "joi";

//==================================== import modles ==============================

import Lesson, { ILesson } from "../../models/Lesson";
import Quiz from "../../models/Quiz";
import User, { IUser } from "../../models/User";
import Module from "../../models/Module";

//==================================== Controller for Admin Side ==============================

// // Create a new lesson
export const createLesson = async (req: Request, res: Response) => {
  try {
    const lessonSchema = Joi.object({
      lesson_name: Joi.string().required(),
      module_id: Joi.string().required(),
      lessonDetails: Joi.string().optional(),
    });

    const { error } = lessonSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }

    // const lessonsData = req.body;
    // const savedLessons = [];
    // for (const lessonData of lessonsData) {
    const { lesson_name, module_id } = req.body;
    const newLesson = new Lesson({
      lesson_name,
      module_id,
    });
    const savedLesson = await newLesson.save();
    // savedLessons.push(savedLesson);
    const updatedModule = await Module.findByIdAndUpdate(
      module_id,
      { $push: { lessons: savedLesson._id } },
      { new: true }
    );
    if (!updatedModule) {
      throw new Error("Module not found or could not be updated.");
    }
    // }

    return res.status(201).json({
      success: true,
      status: 201,
      message: "Lessons created successfully",
      data: savedLesson,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

// Update a lesson by ID
export const updateLessonById = async (req: Request, res: Response) => {
  try {
    const { lesson_name, lessonDetails } = req.body;

    console.log(req.body);

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      {
        lesson_name,
        lessonDetails,
      },
      { new: true, upsert: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Lesson not found",
      });
    }

    return res.json({
      success: true,
      status: 200,
      message: "Lesson updated successfully",
      data: updatedLesson,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

// Delete a lesson by ID
export const deleteLessonById = async (req: Request, res: Response) => {
  try {
    const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!deletedLesson) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Lesson not found",
      });
    }
    return res.json({
      success: true,
      status: 200,
      message: "Lesson deleted successfully",
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

import { Request, Response } from "express";
import Joi from "joi";

//==================================== import modles ==============================

import Lesson, { ILesson } from "../../models/Lesson";
import Quiz from "../../models/Quiz";
import User, { IUser } from "../../models/User";
import Module from "../../models/Module";

//==================================== Controller for User ==============================

// Get all lessons
export const getAllLessons = async (req: Request, res: Response) => {
  try {
    const lessons = await Lesson.find();
    return res.json({
      success: true,
      status: 200,
      data: lessons,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

// Get a single lesson by ID
export const getLessonById = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Lesson not found",
      });
    }
    return res.json({
      success: true,
      status: 200,
      data: lesson,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, status: 500, error: error.message });
  }
};

// Get Lesson by section id
export const getLessonByModuleId = async (req: Request, res: Response) => {
  try {
    console.log("hellllllllllllllllllllllllllllllllllllllll");
    const moduleId = req.params.id;
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User not found.",
      });
    }

    const lessons = await Lesson.find({ module_id: moduleId });

    if (!lessons || lessons.length === 0) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "No lessons found for the given module ID.",
      });
    }

    const completedLessons = user.completed_lessons || [];

    const lessonsWithQuizCount = await Promise.all(
      lessons.map(async (lesson) => {
        // Cast lesson to ILesson to resolve TypeScript error
        const lessonTyped = lesson as ILesson;

        const quizzes = await Quiz.find({ lesson_id: lessonTyped._id });
        const questionCount = quizzes.reduce(
          (count, quiz) => count + quiz.questions.length,
          0
        );

        lessonTyped.question_count = questionCount;
        lessonTyped.completed_lesson = completedLessons.some(
          (completedLessonId) => completedLessonId.equals(lessonTyped._id)
        );

        await lessonTyped.save();

        return lessonTyped.toObject();
      })
    );

    return res.status(200).json({
      success: true,
      status: 200,
      data: lessonsWithQuizCount,
    });
  } catch (error: any) {
    console.error("Error fetching lessons by module ID:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

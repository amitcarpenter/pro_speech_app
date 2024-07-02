import { Request, Response } from "express";
import Joi from "joi";
import mongoose from "mongoose";

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

// Agregaiton in get lesson by section id
// export const getLessonByModuleId = async (req: Request, res: Response) => {
//   try {
//     const moduleId = req.params.id;
//     const userId = (req.user as IUser).id;

//     const [user, lessonsWithQuizCount] = await Promise.all([
//       User.findById(userId).select('completed_lessons'),
//       Lesson.aggregate([
//         { $match: { module_id: new mongoose.Types.ObjectId(moduleId) } },
//         {
//           $lookup: {
//             from: 'quizzes',
//             localField: '_id',
//             foreignField: 'lesson_id',
//             as: 'quizzes'
//           }
//         },
//         {
//           $addFields: {
//             question_count: {
//               $reduce: {
//                 input: '$quizzes',
//                 initialValue: 0,
//                 in: { $add: ['$$value', { $size: '$$this.questions' }] }
//               }
//             }
//           }
//         },
//         {
//           $project: {
//             quizzes: 0
//           }
//         },
//         { $sort: { _id: 1 } }
//       ])
//     ]);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         status: 404,
//         message: "User not found.",
//       });
//     }

//     if (!lessonsWithQuizCount || lessonsWithQuizCount.length === 0) {
//       return res.status(404).json({
//         success: false,
//         status: 404,
//         message: "No lessons found for the given module ID.",
//       });
//     }

//     const completedLessons = user.completed_lessons || [];
//     const lessonsWithCompletionStatus = lessonsWithQuizCount.map(lesson => ({
//       ...lesson,
//       completed_lesson: completedLessons.some(
//         completedLessonId => completedLessonId.equals(lesson._id)
//       )
//     }));

//     return res.status(200).json({
//       success: true,
//       status: 200,
//       data: lessonsWithCompletionStatus,
//     });

//   } catch (error: any) {
//     console.error("Error fetching lessons by module ID:", error);
//     return res.status(500).json({
//       success: false,
//       status: 500,
//       message: error.message,
//     });
//   }
// };




// +=========================================== update lesson detials =-========================

const updateLessonDetails = async () => {
  try {
    let lessonDetails = `<!-- ####### HEY, I AM THE SOURCE EDITOR! #########-->
  <h1 style="color: #5e9ca0;">You can edit <span style="color: #2b2301;">this demo</span> text!</h1>
  <h2 style="color: #2e6c80;">How to use the editor:<video controls="controls" width="300" height="150">
  <source src="https://firebasestorage.googleapis.com/v0/b/pro-speech.appspot.com/o/file_example_MP4_480_1_5MG.mp4?alt=media&amp;token=c3c6edd1-c7bd-48c0-a570-06474b697e46" /></video></h2>
  <p>Paste your documents in the visual editor on the left or your HTML code in the source editor in the right. <br />Edit any of the two areas and see the other changing in real time.&nbsp;</p>
  <p>Click the <span style="background-color: #2b2301; color: #fff; display: inline-block; padding: 3px 10px; font-weight: bold; border-radius: 5px;">Clean</span> button to clean your source code.</p>
  <h2 style="color: #2e6c80;">Some useful features:</h2>
  <ol style="list-style: none; font-size: 14px; line-height: 32px; font-weight: bold;">
  <li style="clear: both;"><img style="float: left;" src="https://html-online.com/img/01-interactive-connection.png" alt="interactive connection" width="45" /> Interactive source editor</li>
  <li style="clear: both;"><img style="float: left;" src="https://html-online.com/img/02-html-clean.png" alt="html cleaner" width="45" /> HTML Cleaning</li>
  <li style="clear: both;"><img style="float: left;" src="https://html-online.com/img/03-docs-to-html.png" alt="Word to html" width="45" /> Word to HTML conversion</li>
  <li style="clear: both;"><img style="float: left;" src="https://html-online.com/img/04-replace.png" alt="replace text" width="45" /> Find and Replace</li>
  <li style="clear: both;"><img style="float: left;" src="https://html-online.com/img/05-gibberish.png" alt="gibberish" width="45" /> Lorem-Ipsum generator</li>
  <li style="clear: both;"><img style="float: left;" src="https://html-online.com/img/6-table-div-html.png" alt="html table div" width="45" /> Table to DIV conversion</li>
  </ol>
  <p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p>
  <h2 style="color: #2e6c80;">Cleaning options:</h2>
  <table class="editorDemoTable">
  <thead>
  <tr>
  <td>Name of the feature</td>
  <td>Example</td>
  <td>Default</td>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td>Remove tag attributes</td>
  <td><img style="margin: 1px 15px;" src="https://html-online.com/images/smiley.png" alt="laughing" width="40" height="16" /> (except <strong>img</strong>-<em>src</em> and <strong>a</strong>-<em>href</em>)</td>
  <td>&nbsp;</td>
  </tr>
  <tr>
  <td>Remove inline styles</td>
  <td><span style="color: green; font-size: 13px;">You <strong style="color: blue; text-decoration: underline;">should never</strong>&nbsp;use inline styles!</span></td>
  <td><strong style="font-size: 17px; color: #2b2301;">x</strong></td>
  </tr>
  <tr>
  <td>Remove classes and IDs</td>
  <td><span id="demoId">Use classes to <strong class="demoClass">style everything</strong>.</span></td>
  <td><strong style="font-size: 17px; color: #2b2301;">x</strong></td>
  </tr>
  <tr>
  <td>Remove all tags</td>
  <td>This leaves <strong style="color: blue;">only the plain</strong> <em>text</em>. <img style="margin: 1px;" src="https://html-online.com/images/smiley.png" alt="laughing" width="16" height="16" /></td>
  <td>&nbsp;</td>
  </tr>
  <tr>
  <td>Remove successive &amp;nbsp;s</td>
  <td>Never use non-breaking spaces&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to set margins.</td>
  <td><strong style="font-size: 17px; color: #2b2301;">x</strong></td>
  </tr>
  <tr>
  <td>Remove empty tags</td>
  <td>Empty tags should go!</td>
  <td>&nbsp;</td>
  </tr>
  <tr>
  <td>Remove tags with one &amp;nbsp;</td>
  <td>This makes&nbsp;no sense!</td>
  <td><strong style="font-size: 17px; color: #2b2301;">x</strong></td>
  </tr>
  <tr>
  <td>Remove span tags</td>
  <td>Span tags with <span style="color: green; font-size: 13px;">all styles</span></td>
  <td><strong style="font-size: 17px; color: #2b2301;">x</strong></td>
  </tr>
  <tr>
  <td>Remove images</td>
  <td>I am an image: <img src="https://html-online.com/images/smiley.png" alt="laughing" /></td>
  <td>&nbsp;</td>
  </tr>
  <tr>
  <td>Remove links</td>
  <td><a href="https://html-online.com" rel="nofollow">This is</a> a link.</td>
  <td>&nbsp;</td>
  </tr>
  <tr>
  <td>Remove tables</td>
  <td>Takes everything out of the table.</td>
  <td>&nbsp;</td>
  </tr>
  <tr>
  <td>Replace table tags with structured divs</td>
  <td>This text is inside a table.</td>
  <td>&nbsp;</td>
  </tr>
  <tr>
  <td>Remove comments</td>
  <td>This is only visible in the source editor <!-- HELLO! --></td>
  <td><strong style="font-size: 17px; color: #2b2301;">x</strong></td>
  </tr>
  <tr>
  <td>Encode special characters</td>
  <td><span style="color: red; font-size: 17px;">&hearts;</span> <strong style="font-size: 20px;">☺ ★</strong> &gt;&lt;</td>
  <td><strong style="font-size: 17px; color: #2b2301;">x</strong></td>
  </tr>
  <tr>
  <td>Set new lines and text indents</td>
  <td>Organize the tags in a nice tree view.</td>
  <td>&nbsp;</td>
  </tr>
  </tbody>
  </table>
  <p><strong>&nbsp;</strong></p>
  <p><strong>Save this link into your bookmarks and share it with your friends. It is all FREE! </strong><br /><strong>Enjoy!</strong></p>
  <p><strong>&nbsp;</strong></p>`;

    // Assuming Lesson is your Mongoose model
    const updateAllLessonFields = await Lesson.updateMany(
      {},
      { $set: { lessonDetails: lessonDetails } }
    );
    console.log(updateAllLessonFields);
  } catch (error) {
    console.error("Error updating lesson details:", error);

  }
};

// (async () => {
//   await updateLessonDetails();
// })();

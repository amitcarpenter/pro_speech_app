import { Request, Response } from 'express';
import Joi from 'joi';
import User, { IUser } from '../models/User';
import Quiz from '../models/Quiz';
import Lesson from '../models/Lesson';
import Score from '../models/Score';

// get score data 
// export const get_score_leaderboard = async (req: Request, res: Response) => {
//     try {
//         const user_req = req.user as IUser;
//         const user = await User.findById(user_req.id);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: 'User not found',
//             });
//         }

//         const scoreData = await Score.find({ userId: user._id });
//         if (!scoreData.length) {
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: 'No score data found for the user',
//             });
//         }

//         // Calculate total scores and total questions
//         const totalScores = scoreData.reduce((sum, score) => sum + score.score_number, 0);
//         const totalQuestions = scoreData.reduce((sum, score) => sum + score.total_question, 0);

//         // Calculate the percentage score
//         const percentage = totalQuestions > 0 ? (totalScores / totalQuestions) * 100 : 0;

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             data: {
//                 scoreData,
//                 totalScores,
//                 totalQuestions,
//                 percentage: percentage.toFixed(2),
//             },
//         });

//     } catch (error: any) {
//         return res.status(500).json({
//             success: false,
//             status: 500,
//             error: error.message,
//         });
//     }
// };


export const get_score_leaderboard = async (req: Request, res: Response) => {
    try {
        const user_req = req.user as IUser;
        const user = await User.findById(user_req.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'User not found',
            });
        }

        // Fetch score data with populated lesson details
        const scoreData = await Score.find({ userId: user._id }).populate({
            path: 'lessonId',
            select: 'lesson_name', // Select only the lesson name
        });

        if (!scoreData.length) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No score data found for the user',
            });
        }

        // Calculate total scores and total questions
        const totalScores = scoreData.reduce((sum, score) => sum + score.score_number, 0);
        const totalQuestions = scoreData.reduce((sum, score) => sum + score.total_question, 0);

        // Calculate the percentage score
        const percentage = totalQuestions > 0 ? (totalScores / totalQuestions) * 100 : 0;

        // Map score data to include lesson name
        const scoreDataWithLessonNames = scoreData.map(score => ({
            ...score.toObject(),
            lesson_name: (score.lessonId as any).lesson_name,
        }));

        return res.status(200).json({
            success: true,
            status: 200,
            data: {
                scoreData: scoreDataWithLessonNames,
                totalScores,
                totalQuestions,
                percentage: percentage.toFixed(2),
            },
        });

    } catch (error: any) {
        console.error('Error fetching score leaderboard:', error);
        return res.status(500).json({
            success: false,
            status: 500,
            error: error.message,
        });
    }
};

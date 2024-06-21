
import { Request, Response } from 'express';
import User, { IUser } from '../../models/User';
import { handleError } from '../../utils/errorHandle';


// Get User List 
export const get_user_list = async (req: Request, res: Response) => {
  try {
    const user_list = await User.find()
    if (!user_list) {
      return handleError(res, 404, "user list not found")
    }
    return res.status(200).json({
      success: true,
      status: 200,
      data: user_list
    })
  } catch (error: any) {
    return handleError(res, 500, error.message);
  }
}

// export const get_user_by_id = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params.id
//     const user_list = await User.findById(id)

//     if (!user_list) {
//       return handleError(res, 404, "user list not found")
//     }
//     return res.status(200).json({
//       success: true,
//       status: 200,
//       data: user_list
//     })
//   } catch (error: any) {
//     return handleError(res, 500, error.message);
//   }
// }



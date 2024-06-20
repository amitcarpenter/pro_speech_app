import { Router } from "express";
import {
  login,
  register,
  verifyOTP,
  getProfile,
  updateProfile,
  signup_google,
  signup_facebook,
  forgotPassword,
  changePassword,
  remove_profile_image,
  profile_image_update,
  changePasswordByEmail,
  verify_otp_forgot_password,
  resendOTPByEmail,
  get_user_list,
} from "../controllers/userControllers";


import { authenticateUser, isAdmin } from "../middlewares/auth";
import { uploadProfileImage } from "../services/uploadImage"


const router = Router();

//==================================== USER ==============================
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/resend-otp', resendOTPByEmail);
router.post('/signup/google', signup_google)
router.post('/signup/facebook', signup_facebook)
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', uploadProfileImage, authenticateUser, updateProfile);
router.post('/profileImage/update', uploadProfileImage, authenticateUser, profile_image_update);
router.delete('/profileImage/delete', authenticateUser, remove_profile_image);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password', verify_otp_forgot_password);
router.post('/change-password-by-email', changePasswordByEmail);
router.post('/change-password', authenticateUser, changePassword);


//==================================== ADMIN ==============================
router.get('/get-user-list', authenticateUser, isAdmin, get_user_list);


export default router;  

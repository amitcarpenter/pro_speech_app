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
  // facebookAuthController,
  // googleAuthController,
  // googleAuthCallbackController,
  // facebookAuthCallbackController
} from "../controllers/userControllers";


import { authenticateUser } from "../middlewares/auth";
import {uploadImage} from "../services/uploadImage"


const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

router.post('/resend-otp', resendOTPByEmail);

router.post('/signup/google',signup_google)
router.post('/signup/facebook',signup_facebook)

// router.get('/google', googleAuthController);
// router.get('/google/callback', googleAuthCallbackController);

// router.get('/facebook', facebookAuthController);
// router.get('/facebook/callback', facebookAuthCallbackController);

router.get('/profile', authenticateUser, getProfile);
router.put('/profile', uploadImage, authenticateUser, updateProfile);

router.post('/profileImage/update', uploadImage, authenticateUser, profile_image_update);
router.delete('/profileImage/delete', authenticateUser, remove_profile_image);

router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password', verify_otp_forgot_password);
router.post('/change-password-by-email', changePasswordByEmail);

router.post('/change-password', authenticateUser, changePassword);



export default router;  

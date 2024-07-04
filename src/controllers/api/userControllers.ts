import Joi from "joi";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User, { IUser } from "../../models/User";
import { generateAccessToken } from "../../utils/jwt";
import { deleteImageFile } from "../../services/deleteImages";
import { generateOTP, send_otp_on_email } from "../../services/otpService";

const APP_URL = process.env.APP_URL as string;

//==================================== Controller for USER side ==============================

// Function for register
export const register = async (req: Request, res: Response) => {
  try {
    console.log("register");
    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      // phone: Joi.string().min(10).max(15).optional(),
      password: Joi.string().min(8).required(),
      role: Joi.string().valid("admin", "user").optional(),
    });

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }

    const { name, email, phone, password, role } = value;

    const exist_email = await User.findOne({ email: email });
    if (exist_email) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Email Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      hide_password: password,
      isVerified: false,
      otp,
      role: role || "user",
      otpExpires,
      profile: {
        fullName: name,
        email: email,
        phone: phone || null,
      },
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      status: 201,
      message: "User registered successfully. Please verify your account.",
      otp: otp,
    });
    await send_otp_on_email({ to: email, otp });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const verifyOTPSchema = Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(4).required(),
    });

    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }
    const { email, otp } = value;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 400,
        message: "User not found.",
      });
    }

    const currentTime = new Date();

    if (user.otp === otp && user.otpExpires && user.otpExpires > currentTime) {
      const payload: { userId: string; email: string } = {
        userId: user._id as string,
        email: user.email,
      };

      const token = generateAccessToken(payload);

      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      user.jwtToken = token;
      await user.save();

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Email verified successfully.",
        token,
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid or expired OTP.",
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

// Resend OTP
export const resendOTPByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Email Not Valid",
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.findOneAndUpdate(
      { email: email },
      { otp: otp, otpExpires: otpExpires },
      { new: true, upsert: true }
    );
    res.status(200).json({
      success: true,
      status: 200,
      message: "OTP resent successfully",
      otp: otp,
    });
    await send_otp_on_email({ to: email, otp });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// resend otp for reset password
export const resendOTPByEmailForResetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Email Not Valid",
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.findOneAndUpdate(
      { email: email },
      { resetPasswordOTP: otp, resetPasswordOTPExpires: otpExpires },
      { new: true, upsert: true }
    );
    res.status(200).json({
      success: true,
      status: 200,
      message: "OTP resent successfully",
      otp: otp,
    });
    await send_otp_on_email({ to: email, otp });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};  

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid credentials.",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "User is not verified.",
      });
    }

    const payload: { userId: string; email: string } = {
      userId: user._id as string,
      email: user.email,
    };
    const token = generateAccessToken(payload);
    user.jwtToken = token;
    await user.save();
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Login Successful",
      token,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Get Profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        status: 400,
        message: "User not found",
      });
    }

    // if (user.profile.profileImage) {
    //   user.profile.profileImage = APP_URL + user.profile.profileImage
    // } else {
    //   user.profile.profileImage = null;
    // }

    if (
      user.profile.profileImage &&
      !user.profile.profileImage.startsWith("http")
    ) {
      user.profile.profileImage = APP_URL + user.profile.profileImage;
    }

    return res.status(200).json({
      success: true,
      status: 200,
      profile: user.profile,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 400,
      error: error.message,
    });
  }
};

// Update Profile Details
export const updateProfile = async (req: Request, res: Response) => {
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
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);


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
        const file_name = "profile.profileImage"
        await deleteImageFile(User, user_req.id, file_name)
      } else {
        // if (
        //   user.profile.profileImage &&
        //   !user.profile.profileImage.startsWith("http")
        // ) {
        //   user.profile.profileImage = APP_URL + user.profile.profileImage;
        // }
        user.profile.profileImage = user.profile.profileImage
      }


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

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const forgotPasswordSchema = Joi.object({
      email: Joi.string().email().required(),
    });
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User not found",
      });
    }

    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "OTP sent successfully",
      otp: otp,
    });
    await send_otp_on_email({ to: email, otp });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Verify otp for the forgot password
export const verify_otp_forgot_password = async (
  req: Request,
  res: Response
) => {
  try {
    const verifyOtpForgotPasswordSchema = Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(4).required(),
    });

    const { error } = verifyOtpForgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }

    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User not found",
      });
    }
    if (!user.resetPasswordOTPExpires) {
      return res.status(400).json({
        success: false,
        status: 404,
        message: "Session expired",
      });
    }

    const currentTime = new Date();
    if (
      user.resetPasswordOTP !== otp ||
      user.resetPasswordOTPExpires < currentTime
    ) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid or expired OTP",
      });
    }
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      status: 200,
      message: "otp verifed successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Change Password after the verify otp
export const changePasswordByEmail = async (req: Request, res: Response) => {
  try {
    const changePasswordByEmailSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });
    const { error } = changePasswordByEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.hide_password = password;
    user.signupMethod = "traditional";
    await user.save();

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Change Password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const changePasswordSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).required(),
    });
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.hide_password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Update profile image
export const profile_image_update = async (req: Request, res: Response) => {
  try {
    console.log("hello")
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "user not found",
      });
    }
    if (req.file) {
      user.profile.profileImage = req.file.filename;
      const file_name = "profile.profileImage"
      await deleteImageFile(User, user_req.id, file_name)
    }
    else {
      user.profile.profileImage = user.profile.profileImage
    }

    await user.save();
    return res.status(200).json({
      success: true,
      status: 200,
      messsage: "Profile Image successfully Update",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Delete Profile Image
export const remove_profile_image = async (req: Request, res: Response) => {
  try {
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "user not found",
      });
    }
    if (!user.profile.profileImage) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Profile Image is not Found",
      });
    }
    user.profile.profileImage = null;
    const file_name = "profile.profileImage"
    await deleteImageFile(User, user_req.id, file_name)
    await user.save();
    return res.status(200).json({
      success: true,
      status: 200,
      messsage: "Profile Image delete successfully ",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Google OAuth route
export const signup_google = async (req: Request, res: Response) => {
  const signupGoogleSchema = Joi.object({
    email: Joi.string().email().required(),
    googleId: Joi.string().required(),
    name: Joi.string().optional(),
    profileImage: Joi.string().optional(),
  });

  const { error } = signupGoogleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }

  const { email, googleId, name, profileImage } = req.body;

  // const result = await User.collection.dropIndex('phone_1')
  // console.log(result)

  try {
    let user = await User.findOne({ email });

    if (user) {
      user.name = name || user.name;
      user.googleId = googleId;
      if (user.signupMethod != "traditional") {
        user.signupMethod = "google";
      }
      user.isVerified = true;
    } else {
      user = new User({
        email,
        googleId,
        name,
        signupMethod: "google",
        isVerified: true,
        profile: {
          fullName: name,
          email: email,
          profileImage: profileImage,
          nickName: name,
        },
      });
    }

    // Generate JWT token
    const payload: { userId: string; email: string } = {
      userId: user._id as string,
      email: user.email,
    };
    const token = generateAccessToken(payload);
    user.jwtToken = token;

    // Save user to the database
    await user.save();

    return res.status(201).json({
      success: true,
      status: 201,
      message: "User registered successfully via Google",
      token,
    });
  } catch (error: any) {
    console.error("Error during Google signup:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Facebook OAuth route
export const signup_facebook = async (req: Request, res: Response) => {
  const signupFacebookSchema = Joi.object({
    email: Joi.string().email().required(),
    facebookId: Joi.string().required(),
    name: Joi.string().optional(),
    profileImage: Joi.string().optional(),
  });

  const { error } = signupFacebookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }

  const { email, facebookId, name, profileImage } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      user.facebookId = facebookId;
      user.isVerified = true;
    } else {
      user = new User({
        email,
        facebookId,
        signupMethod: "facebook",
        isVerified: true,
        profile: {
          fullName: name,
          email: email,
          profileImage: profileImage,
        },
      });
    }

    const payload: { userId: string; email: string } = {
      userId: user._id as string,
      email: user.email,
    };
    const token = generateAccessToken(payload);
    user.jwtToken = token;
    await user.save();
    return res.status(201).json({
      success: true,
      status: 201,
      message: "User registered successfully via Facebook",
      token,
    });
  } catch (error: any) {
    return res.status(500).send({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// check if password entered
export const isPassword = async (req: Request, res: Response) => {
  try {
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);
    let isPasswordEnter = false;
    if (user?.signupMethod == "traditional") {
      isPasswordEnter = true;
    }
    return res.status(200).json({
      succuss: true,
      status: 200,
      isPasswordEnter,
    });
  } catch (error: any) {
    return res.status(500).send({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

// Delete Account 
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "User Not Found"
      })
    }

    const file_name = "profile.profileImage"
    await deleteImageFile(User, user_req.id, file_name)
    const deleteAcount = await User.deleteOne({ _id: user?._id });
    console.log(deleteAcount);
    if (deleteAcount.deletedCount > 0) {
      return res.status(500).send({
        success: true,
        status: 200,
        message: "Account Deleted SuccessFully",
      });
    }
  } catch (error: any) {
    return res.status(500).send({
      success: false,
      status: 500,
      error: error.message,
    });
  }
};

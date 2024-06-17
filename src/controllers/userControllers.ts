
import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import Joi from 'joi';

import { generateOTP, send_otp_on_email } from '../services/otpService';
import { generateAccessToken } from "../utils/jwt"

const APP_URL = process.env.APP_URL as string


// Function for register
export const register = async (req: Request, res: Response) => {
  try {
    console.log("register");

    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().min(10).max(15).required(),
      password: Joi.string().min(8).required()
    });

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message
      });
    }

    const { name, email, phone, password } = value;

    const exist_email = await User.findOne({ email: email });
    if (exist_email) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Email Already Exist"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpires,
      profile: {
        email: email,
        phone: phone
      }
    });

    await newUser.save();
    await send_otp_on_email({ to: email, otp });

    return res.status(201).json({
      success: true,
      status: 201,
      message: 'User registered successfully. Please verify your account.',
      otp: otp
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500, error: error.message
    });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const verifyOTPSchema = Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(4).required()
    });

    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400, message: error.details[0].message
      });
    }
    const { email, otp } = value;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 400, message: 'User not found.'
      });
    }

    const currentTime = new Date();

    if (user.otp === otp && user.otpExpires && user.otpExpires > currentTime) {


      const payload: { userId: string; email: string } = {
        userId: user._id as string,
        email: user.email
      };

      const token = generateAccessToken(payload);


      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      user.jwtToken = token
      await user.save();


      return res.status(200).json({
        success: true,
        status: 200, message: 'Email verified successfully.', token
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 400, message: 'Invalid or expired OTP.'
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500, error: error.message
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
        message: "Email Not Valid"
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.findOneAndUpdate(
      { email: email },
      { otp: otp, otpExpires: otpExpires },
      { new: true, upsert: true }
    );
    await send_otp_on_email({ to: email, otp });
    return res.status(200).json({
      success: true,
      status: 200,
      message: 'OTP resent successfully',
      otp: otp
    });
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
      password: Joi.string().min(8).required()
    });
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400, message: error.details[0].message
      });
    }
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404, message: 'User not found.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        status: 400, message: 'Invalid credentials.'
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        status: 400, message: 'User is not verified.'
      });
    }

    const payload: { userId: string; email: string } = {
      userId: user._id as string,
      email: user.email
    };
    const token = generateAccessToken(payload);
    user.jwtToken = token;
    await user.save()
    return res.status(200).json({
      success: true,
      status: 200, token
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500, error: error.message
    });
  }
};

// Get Profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user_req = req.user as IUser
    const user = await User.findById(user_req.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        status: 400, message: 'User not found'
      });
    }

    if (user.profile.profileImage) {
      user.profile.profileImage = APP_URL + user.profile.profileImage
    } else {
      user.profile.profileImage = null;
    }
    return res.status(200).json({
      success: true,
      status: 200, profile: user.profile
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 400, error: error.message
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
      gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
      phone: Joi.string().min(10).max(15).optional()
    });

    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400, message: error.details[0].message
      });
    }
    console.log(req.file)

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
        console.log(req.file.filename);
      }

      await user.save();
      return res.status(200).json({
        success: true,
        status: 200, message: 'Profile updated successfully.'
      });
    } else {
      return res.status(404).json({
        success: false,
        status: 400, message: 'User not found.'
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500, error: error.message
    });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const forgotPasswordSchema = Joi.object({
      email: Joi.string().email().required()
    });
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.details[0].message
      });
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'User not found',

      });
    }

    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await send_otp_on_email({ to: email, otp });

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'OTP sent successfully',
      otp: otp
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message
    });
  }
};

// Verify otp for the forgot password
export const verify_otp_forgot_password = async (req: Request, res: Response) => {
  try {
    const verifyOtpForgotPasswordSchema = Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(4).required(),
    });


    const { error } = verifyOtpForgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400, message: error.details[0].message
      });
    }

    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404, message: 'User not found'
      });
    }
    if (!user.resetPasswordOTPExpires) {
      return res.status(400).json({
        success: false,
        status: 404, message: 'Session expired'
      });
    }

    const currentTime = new Date();
    if (user.resetPasswordOTP !== otp || user.resetPasswordOTPExpires < currentTime) {
      return res.status(400).json({
        success: false,
        status: 400, message: 'Invalid or expired OTP'
      });
    }
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      status: 200, message: 'otp verifed successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500, error: error.message
    });
  }
};

// Change Password after the verify otp
export const changePasswordByEmail = async (req: Request, res: Response) => {
  try {
    const changePasswordByEmailSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    });
    const { error } = changePasswordByEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400, message: error.details[0].message
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404, message: 'User not found'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      status: 200, message: 'Password changed successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500, error: error.message
    });
  }
};

// Change Password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const changePasswordSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required()
    });
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400, message: error.details[0].message
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user_req = req.user as IUser;
    const user = await User.findById(user_req.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404, message: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        status: 400, message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      status: 200, message: 'Password changed successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500, error: error.message
    });
  }
};

// Update profile image
export const profile_image_update = async (req: Request, res: Response) => {
  try {
    const user_req = req.user as IUser
    const user = await User.findById(user_req.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        status: 400, message: "user not found"
      })
    }
    if (req.file) {
      user.profile.profileImage = req.file.filename
      await user.save()
      return res.status(200).json({
        success: true,
        status: 200, messsage: "Profile Image successfully Update"
      })
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500, error: error.message
    })
  }
}

// Delete Profile Image
export const remove_profile_image = async (req: Request, res: Response) => {
  try {
    const user_req = req.user as IUser
    const user = await User.findById(user_req.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        status: 400, message: "user not found"
      })
    }
    if (!user.profile.profileImage) {
      return res.status(404).json({
        success: false,
        status: 404, message: "Profile Image is not Found"
      })
    }
    user.profile.profileImage = null;
    await user.save()
    return res.status(200).json({
      success: true,
      status: 200, messsage: "Profile Image delete successfully "
    })

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 500, error: error.message
    })
  }
}

// Google OAuth route
export const signup_google = async (req: Request, res: Response) => {
  const signupGoogleSchema = Joi.object({
    email: Joi.string().email().required(),
    googleId: Joi.string().required()
  });

  const { error } = signupGoogleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message
    });
  }

  const { email, googleId } = req.body;

  try {

    let user = await User.findOne({ email });


    if (user) {
      user.googleId = googleId;
      user.signupMethod = 'google';
    } else {
      user = new User({
        email,
        googleId,
        signupMethod: 'google'
      });
    }

    const payload: { userId: string; email: string } = {
      userId: user._id as string,
      email: user.email
    };
    const token = generateAccessToken(payload);
    user.jwtToken = token


    await user.save();
    res.status(201).json({
      success: true,
      status: 201,
      message: 'User registered successfully via Google',
      token
    });
  } catch (error: any) {
    return res.status(500).send({
      success: false,
      status: 500,
      error: error.message
    });
  }
};

// Facebook OAuth route
export const signup_facebook = async (req: Request, res: Response) => {
  const signupFacebookSchema = Joi.object({
    email: Joi.string().email().required(),
    facebookId: Joi.string().required()
  });

  const { error } = signupFacebookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message
    });
  }

  const { email, facebookId } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      user.facebookId = facebookId;
      user.signupMethod = 'facebook';
    } else {
      user = new User({
        email,
        facebookId,
        signupMethod: 'facebook'
      });
    }

    const payload: { userId: string; email: string } = {
      userId: user._id as string,
      email: user.email
    };
    const token = generateAccessToken(payload);
    user.jwtToken = token
    await user.save();
    return res.status(201).json({
      success: true,
      status: 201,
      message: 'User registered successfully via Facebook',
      token
    });
  } catch (error: any) {
    return res.status(500).send({
      success: false,
      status: 500,
      error: error.message
    });
  }
};



// // Controller for handling Google OAuth authentication
// export const googleAuthController = (req: Request, res: Response) => {
//   const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
//   const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
//   const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL as string;
//   passport.use(new GoogleStrategy({
//     clientID: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: CALLBACK_URL
//   }, async (accessToken, refreshToken, profile, done) => {
//     try {
//       console.log(accessToken, refreshToken)
//       const user = await User.findOne({ googleId: profile.id });
//       if (!user) {
//         const newUser = new User({ googleId: profile.id });
//         await newUser.save();
//         done(null, newUser);
//       } else {
//         done(null, user);
//       }
//     } catch (error) {
//       done(error, undefined);
//     }
//   }));
//   passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
// };

// // Callback controller for handling Google OAuth callback
// export const googleAuthCallbackController = (req: Request, res: Response) => {
//   passport.authenticate('google', { failureRedirect: '/login' })(req, res, () => {
//     res.redirect('/');
//   });
// };

// // Controller for handling Facebook authentication
// export const facebookAuthController = (req: Request, res: Response) => {
//   const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID as string;
//   const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET as string;
//   const CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL as string;

//   passport.use(new FacebookStrategy({
//     clientID: FACEBOOK_APP_ID,
//     clientSecret: FACEBOOK_APP_SECRET,
//     callbackURL: CALLBACK_URL,
//     profileFields: ['id', 'emails', 'name']
//   }, async (accessToken, refreshToken, profile, done) => {
//     try {
//       const user = await User.findOne({ facebookId: profile.id });
//       if (!user) {
//         const newUser = new User({
//           facebookId: profile.id,
//           email: profile.emails ? profile.emails[0].value : null,
//           firstName: profile.name?.givenName,
//           lastName: profile.name?.familyName
//         });
//         await newUser.save();
//         done(null, newUser);
//       } else {
//         done(null, user);
//       }
//     } catch (error) {
//       done(error, null);
//     }
//   }));
//   passport.authenticate('facebook')(req, res);
// };

// // Callback controller for handling Facebook OAuth callback
// export const facebookAuthCallbackController = (req: Request, res: Response) => {
//   passport.authenticate('facebook', { failureRedirect: '/login' })(req, res, () => {
//     res.redirect('/');
//   });
// };


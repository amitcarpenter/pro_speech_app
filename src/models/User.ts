import mongoose, { Document, Schema, Types } from 'mongoose';


export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  jwtToken: string;
  isVerified: boolean;
  hide_password: boolean;
  role: string,
  googleId?: string;
  facebookId?: string;
  signupMethod?: string;
  completed_lessons: Types.ObjectId[];
  completed_modules: Types.ObjectId[];
  completed_sections: Types.ObjectId[];
  otp?: string;
  otpExpires?: Date;
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    profileImage: string | any;
    fullName: string;
    nickName: string;
    dateOfBirth: Date;
    email: string;
    phone: string;
    gender: string;
  };


  resetPasswordToken: string | any;
  resetPasswordExpiry: string | any;

}

const UserSchema: Schema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, sparse: true, default: null },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  password: { type: String },
  hide_password: { type: String },
  jwtToken: { type: String },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
  facebookId: { type: String },
  signupMethod: { type: String, enum: ['traditional', 'google', 'facebook'], default: "traditional" },
  completed_lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  completed_modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  completed_sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  otp: { type: String },
  otpExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  profile: {
    profileImage: { type: String },
    fullName: { type: String },
    nickName: { type: String },
    dateOfBirth: { type: Date },
    email: { type: String },
    phone: { type: String },
    gender: { type: String },
  },
  
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
});


export default mongoose.model<IUser>('User', UserSchema);

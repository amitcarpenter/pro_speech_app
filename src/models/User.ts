import mongoose, { Document, Schema, Types } from 'mongoose';


export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  jwtToken: string;
  isVerified: boolean;

  googleId?: string;
  facebookId?: string;
  signupMethod?: string;



  profile: {
    profileImage: string | any;
    fullName: string;
    nickName: string;
    dateOfBirth: Date;
    email: string;
    phone: string;
    gender: string;
  };

  completed_lessons: Types.ObjectId[];
  completed_modules: Types.ObjectId[];
  completed_sections: Types.ObjectId[];

  otp?: string;
  otpExpires?: Date;
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;

  createdAt: Date;
  updatedAt: Date;

}

const UserSchema: Schema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, sparse: true, default: null },
  password: { type: String },
  jwtToken: { type: String },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
  facebookId: { type: String },
  signupMethod: { type: String, enum: ['traditional', 'google', 'facebook'], default: "traditional" },

  profile: {
    profileImage: { type: String },
    fullName: { type: String },
    nickName: { type: String },
    dateOfBirth: { type: Date },
    email: { type: String },
    phone: { type: String },
    gender: { type: String },
  },


  completed_lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  completed_modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  completed_sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],

  otp: { type: String },
  otpExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);

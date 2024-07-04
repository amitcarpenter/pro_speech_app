import { Schema, model, Document, Types } from "mongoose";

// Interface for File document
interface IFile extends Document {
  file_name: string;
  file_url: string;
  file_type: string;
  lesson_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for File
const fileSchema = new Schema<IFile>(
  {
    file_name: { type: String, required: true },
    file_url: { type: String, required: true },
    file_type: { type: String, required: true },
    lesson_id: { type: Schema.Types.ObjectId, ref: "Lesson" },
  },
  {
    timestamps: true,
  }
);

// Mongoose Model
const File = model<IFile>("File", fileSchema);

export default File;

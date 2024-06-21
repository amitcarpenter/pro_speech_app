import { Schema, model, Document, Types } from "mongoose";

export interface ILesson extends Document {
  lesson_name: string;
  module_id: Types.ObjectId;
  quiz_ids: Types.ObjectId;
  completed_by: Types.ObjectId[];
  question_count: number;
  lessonDetails: string;
  completed_lesson: boolean;
  _id: Types.ObjectId;
}

const lessonSchema = new Schema<ILesson>({
  lesson_name: { type: String, required: true },
  lessonDetails: { type: String, required: true },
  module_id: { type: Schema.Types.ObjectId, ref: "Module", required: true },
  quiz_ids: { type: Schema.Types.ObjectId, ref: "Quiz" },
  completed_by: [{ type: Schema.Types.ObjectId, ref: "User" }],
  question_count: { type: Number },
  completed_lesson: { type: Boolean },
});

const Lesson = model<ILesson>("Lesson", lessonSchema);

export default Lesson;

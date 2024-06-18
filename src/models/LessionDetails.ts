import { Schema, model, Document, Types } from 'mongoose';

interface ILessonDetail extends Document {
  lesson_image: string;
  lesson_video: string;
  lesson_content: string;
  lesson_voice: string;
  lessonId: Types.ObjectId;
}

const lessonDetailSchema = new Schema<ILessonDetail>({
  lesson_image: { type: String, required: true },
  lesson_video: { type: String, required: true },
  lesson_content: { type: String, required: true },
  lesson_voice: { type: String, required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
});

const LessonDetail = model<ILessonDetail>('LessonDetail', lessonDetailSchema);

export default LessonDetail;

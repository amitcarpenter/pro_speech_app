import { Schema, model, Document, Types } from 'mongoose';

interface ILesson extends Document {
  lesson_name: string;
  module_id: Types.ObjectId;
  quiz_ids: Types.ObjectId;
  lesstionDetailsId: Types.ObjectId;
  completed_by: Types.ObjectId[];
  lesson_count: number;
}

const lessonSchema = new Schema<ILesson>({
  lesson_name: { type: String, required: true },
  module_id: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  quiz_ids: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  lesstionDetailsId: { type: Schema.Types.ObjectId, ref: 'LessionDetails' },
  completed_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lesson_count: { type: Number }
});

lessonSchema.pre('save', async function (next) {
  const doc = this as ILesson;
  if (doc.isNew) {
    const lastLesson = await Lesson.findOne().sort({ lesson_count: - 1 }).exec();
    doc.lesson_count = lastLesson ? lastLesson.lesson_count + 1 : 1;
  }
  next();
});

const Lesson = model<ILesson>('Lesson', lessonSchema);

export default Lesson;

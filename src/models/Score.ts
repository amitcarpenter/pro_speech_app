import { Schema, model, Document, Types } from 'mongoose';

interface IScore extends Document {
  score_number: number;
  total_question: number;
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  lessonId: Types.ObjectId;
}

const scoreSchema = new Schema<IScore>({
  score_number: { type: Number, required: true },
  total_question: { type: Number },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true }
});

const Score = model<IScore>('Score', scoreSchema);

export default Score;

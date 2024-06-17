import { Schema, model, Document, Types } from 'mongoose';

interface IScore extends Document {
  score_number: number;
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  lessonId: Types.ObjectId;
}

const scoreSchema = new Schema<IScore>({
  score_number: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true }
});

const Score = model<IScore>('Score', scoreSchema);

export default Score;


import { Schema, model, Document, Types } from 'mongoose';

interface IQuestion {
  text: string;  
  options: string[];
  correctOption: string;
}

interface IQuiz extends Document {
  quiz_name: string;
  questions: IQuestion[];
  lesson_id: Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },  
  options: { type: [String], required: true },
  correctOption: { type: String, required: true }
});

const quizSchema = new Schema<IQuiz>({
  quiz_name: { type: String, required: true },
  questions: { type: [questionSchema], required: true },
  lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true }
});

const Quiz = model<IQuiz>('Quiz', quizSchema);

export default Quiz;

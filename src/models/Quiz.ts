
import { Schema, model, Document, Types } from 'mongoose';

interface IQuestion {
  id?: any | "",
  _id?: any | "",
  text: any;
  options: any[];
  correctOption: any;
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
  quiz_name: { type: String },
  questions: { type: [questionSchema], required: true },
  lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true }
});

const Quiz = model<IQuiz>('Quiz', quizSchema);

export default Quiz;



// import { Schema, model, Document, Types } from 'mongoose';

// interface IQuestionContent {
//   type: 'text' | 'image' | 'audio' | 'video';
//   content: string; // URL for media files, actual text for text type
// }

// interface IQuestion {
//   content: IQuestionContent;
//   options: IQuestionContent[];
//   correctOption: number; // Index of the correct option
// }

// interface IQuiz extends Document {
//   quiz_name: string;
//   questions: IQuestion[];
//   lesson_id: Types.ObjectId;
// }

// const questionContentSchema = new Schema<IQuestionContent>({
//   type: { type: String, enum: ['text', 'image', 'audio', 'video'], required: true },
//   content: { type: String, required: true }
// });

// const questionSchema = new Schema<IQuestion>({
//   content: { type: questionContentSchema, required: true },
//   options: { type: [questionContentSchema], required: true },
//   correctOption: { type: Number, required: true }
// });

// const quizSchema = new Schema<IQuiz>({
//   quiz_name: { type: String, required: true },
//   questions: { type: [questionSchema], required: true },
//   lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true }
// });

// const Quiz = model<IQuiz>('Quiz', quizSchema);

// export default Quiz;


// import { Schema, model, Document, Types } from 'mongoose';

// interface IContent {
//   type: 'text' | 'image' | 'video' | 'voice';
//   value: string;
// }

// interface IQuestion {
//   content: IContent[];
//   options: string[];
//   correctOption: string;
// }

// interface IQuiz extends Document {
//   quiz_name: string;
//   questions: IQuestion[];
//   lesson_id: Types.ObjectId;
// }

// const contentSchema = new Schema<IContent>({
//   type: { type: String, enum: ['text', 'image', 'video', 'voice'], required: true },
//   value: { type: String, required: true }
// });

// const questionSchema = new Schema<IQuestion>({
//   content: { type: [contentSchema], required: true },
//   options: { type: [String], required: true },
//   correctOption: { type: String, required: true }
// });

// const quizSchema = new Schema<IQuiz>({
//   quiz_name: { type: String },
//   questions: { type: [questionSchema], required: true },
//   lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true }
// });

// const Quiz = model<IQuiz>('Quiz', quizSchema);

// export default Quiz;

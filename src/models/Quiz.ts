
import { Schema, model, Document, Types } from 'mongoose';

interface IQuestion {
  id?: any | "",
  _id?: any | "",
  type: string; // "MCQ" ya "FILL_IN_THE_BLANK"
  text: any;
  options?: any[]; // Optional kyunki fill in the blank mein options nahi honge 
  correctOption: any;
}


interface IQuiz extends Document {
  quiz_name: string;
  questions: IQuestion[];
  lesson_id: Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>({
  type: { type: String, required: true }, // Question type define karega
  text: { type: String, required: true },
  options: { type: [String] }, // Optional for fill in the blank
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

// interface IQuestion {
//   id?: any | "",
//   _id?: any | "",
//   text: any;
//   options: any[];
//   correctOption: any;
// }

// interface IQuiz extends Document {
//   quiz_name: string;
//   questions: IQuestion[];
//   lesson_id: Types.ObjectId;
// }

// const questionSchema = new Schema<IQuestion>({
//   text: { type: String, required: true },
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


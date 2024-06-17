

import { Schema, model, Document, Types } from 'mongoose';

export interface IModule extends Document {
  module_name: string;
  module_image: string;
  section_id: Types.ObjectId;
  lessons: Types.ObjectId[];
  completed_by: Types.ObjectId[];
  lesson_count: number;

}

const moduleSchema = new Schema<IModule>({
  module_name: { type: String, required: true },
  module_image: { type: String },
  section_id: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  completed_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lesson_count: { type: Number }
});



const Module = model<IModule>('Module', moduleSchema);

export default Module;




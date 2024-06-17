

import { Schema, model, Document, Types } from 'mongoose';

export interface IModule extends Document {
    module_name: string;
    module_image: string;
    section_id: Types.ObjectId;
    lessons: Types.ObjectId[];
    completed_by: Types.ObjectId[];
    module_count: number;
}

const moduleSchema = new Schema<IModule>({
    module_name: { type: String, required: true },
    module_image: { type: String },
    section_id: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    completed_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    module_count: { type: Number }
});

moduleSchema.pre('save', async function (next) {
    const doc = this as IModule;
    if (doc.isNew) {
      const lastModule = await Module.findOne().sort({ module_count: -1 }).exec();
      doc.module_count = lastModule ? lastModule.module_count + 1 : 1;
    }
    next();
  });

const Module = model<IModule>('Module', moduleSchema);

export default Module;




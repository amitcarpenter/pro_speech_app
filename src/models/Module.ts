

// import { Schema, model, Document, Types } from 'mongoose';

// export interface IModule extends Document {
//   module_name: string;
//   section_id: Types.ObjectId;
//   lessons: Types.ObjectId[];
//   completed_by: Types.ObjectId[];
// }

// const moduleSchema = new Schema<IModule>({
//   module_name: { type: String, required: true },
//   section_id: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
//   lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
//   completed_by: [{ type: Schema.Types.ObjectId, ref: 'User' }]
// });

// const Module = model<IModule>('Module', moduleSchema);

// export default Module;


import { Schema, model, Document, Types } from 'mongoose';

export interface IModule extends Document {
    module_name: string;
    section_id: Types.ObjectId;
    lessons: Types.ObjectId[];
    completed_by: Types.ObjectId[];
}

const moduleSchema = new Schema<IModule>({
    module_name: { type: String, required: true },
    section_id: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    completed_by: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const Module = model<IModule>('Module', moduleSchema);

export default Module;




// import { Schema, model, Document, Types } from 'mongoose';

// interface ISection extends Document {
//   section_image: string;
//   section_name: string;
//   complete_process: number;
//   modules: Types.ObjectId[];
//   completed_by: Types.ObjectId[];
// }

// const sectionSchema = new Schema<ISection>({
//   section_image: { type: String },
//   section_name: { type: String, required: true },
//   complete_process: { type: Number, default: 0 },
//   modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
//   completed_by: [{ type: Schema.Types.ObjectId, ref: 'User' }]
// });

// const Section = model<ISection>('Section', sectionSchema);

// export default Section;


import { Schema, model, Document, Types } from 'mongoose';

interface ISection extends Document {
  section_image: string;
  section_name: string;
  complete_process: number;
  modules: Types.ObjectId[];
  completed_by: Types.ObjectId[];
  section_count: number; 
}

const sectionSchema = new Schema<ISection>({
  section_image: { type: String },
  section_name: { type: String, required: true },
  complete_process: { type: Number, default: 0 },
  modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  completed_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  section_count: { type: Number } 
});

// Pre-save hook to increment section_count
sectionSchema.pre('save', async function (next) {
  const doc = this as ISection;
  if (doc.isNew) {
    const lastSection = await Section.findOne().sort({ section_count: -1 }).exec();
    doc.section_count = lastSection ? lastSection.section_count + 1 : 1;
  }
  next();
});

const Section = model<ISection>('Section', sectionSchema);

export default Section;

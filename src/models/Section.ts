import { Schema, model, Document, Types } from 'mongoose';

interface ISection extends Document {
  section_name: string;
  modules: Types.ObjectId[];
  completed_by: Types.ObjectId[];
}

const sectionSchema = new Schema<ISection>({
  section_name: { type: String, required: true },
  modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  completed_by: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const Section = model<ISection>('Section', sectionSchema);

export default Section;

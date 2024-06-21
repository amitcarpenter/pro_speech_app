import { Schema, model, Document, Types } from "mongoose";

export interface ISection extends Document {
  section_image: string;
  section_name: string;
  complete_process: number;
  modules: Types.ObjectId[];
  completed_by: Types.ObjectId[];
  _id : string
}

const sectionSchema = new Schema<ISection>({
  section_image: { type: String },
  section_name: { type: String, required: true },
  complete_process: { type: Number, default: 0 },
  modules: [{ type: Schema.Types.ObjectId, ref: "Module" }],
  completed_by: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Section = model<ISection>("Section", sectionSchema);

export default Section;

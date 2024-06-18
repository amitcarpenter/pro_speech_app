import mongoose, { Schema, Document } from 'mongoose';

export interface ITermsCondition extends Document {
    title: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const TermsConditionSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ITermsCondition>('TermsCondition', TermsConditionSchema);

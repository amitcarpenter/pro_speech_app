import mongoose, { Schema, Document } from 'mongoose';

export interface ITermsCondition extends Document {
    title: string;
    content: string;
    subTitle: string;
    html: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const TermsConditionSchema: Schema = new Schema(
    {
        title: { type: String, },
        subTitle: { type: String, },
        content: { type: String, },
        html: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ITermsCondition>('TermsCondition', TermsConditionSchema);

import { Schema, model, Document } from 'mongoose';

interface IPrivacyPolicy extends Document {
    title: string;
    subTitle: string;
    content: string;
    html: string;
}

const privacyPolicySchema = new Schema<IPrivacyPolicy>({
    title: { type: String, },
    subTitle: { type: String },
    content: { type: String, },
    html: { type: String, required: true },
}, {
    timestamps: true
});

const PrivacyPolicy = model<IPrivacyPolicy>('PrivacyPolicy', privacyPolicySchema);

export default PrivacyPolicy;

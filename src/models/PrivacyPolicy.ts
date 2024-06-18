import { Schema, model, Document } from 'mongoose';

interface IPrivacyPolicy extends Document {
    title: string;
    content: string;
}


const privacyPolicySchema = new Schema<IPrivacyPolicy>({
    title: { type: String, required: true },
    content: { type: String, required: true },
}, {
    timestamps: true 
});

const PrivacyPolicy = model<IPrivacyPolicy>('PrivacyPolicy', privacyPolicySchema);

export default PrivacyPolicy;

import { Schema, model, Document, Types } from "mongoose";
export interface IHome extends Document {
    home_video: string;
}
const homeSchema = new Schema<IHome>({
    home_video: { type: String, required: true },
});

const Home = model<IHome>("Home", homeSchema);

export default Home;

import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    message: string;
}

const messageSchema = new Schema(
    {
        message: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IMessage>("Message", messageSchema);
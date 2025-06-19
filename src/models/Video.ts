import mongoose, { Schema, model, models } from "mongoose";

// video dimensions

export const VIDEO_DIMENSIONS = {
    width: 1080,
    height: 1920,
} as const;

// video interface
export interface IVideo {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    fileUrl: string;
    thumbnailUrl?: string;
    controls?: boolean;
    transformation?: {
        widht: number;
        height: number;
        quality?: number;
    }
}

// video Schema
const videoSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, },
    fileUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    controls: { type: Boolean, default: true },
    transfromation: {
        widht: { type: Number, default: VIDEO_DIMENSIONS.width},
        height: { type: Number, default: VIDEO_DIMENSIONS.height},
        quality: { type: Number, min: 1, max: 100 },

    }
},{ timestamps: true });

// no pre hooks

// create and export Video model
const Video = models.Video || model<IVideo>("Video", videoSchema)

export default Video;



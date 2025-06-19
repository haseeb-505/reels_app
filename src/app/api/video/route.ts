import { authOptions } from "@/libs/authOptions";
import { dbConnection } from "@/libs/dbConnect";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnection();
        const videos = await Video.find({})
                        .sort({createdAt: -1}).lean();
        if (!videos || videos.length === 0) {
            return NextResponse.json([], {status: 200})
        }

        return NextResponse.json(videos);
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to fetch videos"
            }, {status: 500}
        )
    }
};

export async function POST(request: NextRequest) {
    try {
        // to authenticate the user
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                {error: "Failed to fetch videos"}, 
                {status: 500}
            )
        }

        // session is okay
        await dbConnection();

        const body: IVideo = await request.json();
        if (
            !body.title
            || !body.fileUrl
        ) {
            return NextResponse.json(
                {error: "Missing required fields"}, 
                {status: 400}
            )
        }

        const videoData = {
            ...body,
            controls: body?.controls ?? true,
            transformation: {
                height: 1920,
                width: 1080,
                quality: body.transformation?.quality ?? 100,
            }
        }
        const newVideo = await Video.create(videoData)

        return NextResponse.json(newVideo);

    } catch (error) {
        console.log("Error here is: ", error)
        return NextResponse.json({
            error: "Failed to create the video"
        }, {status: 500})
    }
}
import { dbConnection } from "@/libs/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:Request) {
    // db connection
    await dbConnection();

    try {
        const {email, password} = await request.json();
        if (!email || !password) {
            return NextResponse.json(
                {
                   error: "Email and password are required" 
                }, { status: 400 }
            )
        }

        // check existing user
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return NextResponse.json(
                {error: "email already taken"},
                {status: 401}
            )
        }

        // if not exisisting user, create one and save it in db
        await User.create({
            email,
            password
        });

        return NextResponse.json(
            {message: "User registered Successfully!"},
            {status: 201}
        )
    } catch (error) {
        console.error("User registration failed: ", error)
        return NextResponse.json(
            {error: "Registration failed"},
            {status: 400}
        )
    }
}







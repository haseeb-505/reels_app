import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { dbConnection } from "./dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers : [
        CredentialsProvider({
             name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", },
                password: { label: "Password", type: "password" }
            },

            // authorize function
            async authorize(credentials){
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password")
                }

                try {
                    // db connection
                    await dbConnection();

                    const user = await User.findOne({email: credentials.email});
                    if (!user) {
                        throw new Error("User not found")
                    }

                    // if user found, check password
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid password")
                    }

                    // return the user with id and email
                    return {
                        id: user._id.toString(),
                        email: user.email,
                    }

                } catch (error) {
                    console.log("Login failed");
                    throw error;
                }
            }

        })
    ],
    // callbacks
    callbacks: {
        async session({ session, user, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET
}
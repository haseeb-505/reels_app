import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth"
import { dbConnection } from "./dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            // authorize method
            async authorize(credentials){
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password")
                }

                 try {
                // db Connection
                    await dbConnection();

                    const user  = await User.findOne({email: credentials.email});
                    if (!user) {
                        throw new Error("No user found with this email")
                    }

                    // check passowrd
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordCorrect) {
                        throw new Error("Invalid password")
                    }

                    // return
                    return {
                        id: user._id.toString(),
                        email: user.email
                    }
                } catch (error) {
                    console.log("Auth error: ", error)
                    throw error;
                }
            }
        })
    ],

    // callbacks
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        }
    },
    // pages
    pages: {
        signIn: "/login",
        error: "/login"
    },
    // session
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET
}
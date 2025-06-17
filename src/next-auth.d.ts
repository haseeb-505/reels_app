import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  
  interface Session {
    user: {
      /** The user's id we need the user to carry. */
      id: string;
    } & DefaultSession["user"];
    // this line means that I always want user object in my session
  }
}
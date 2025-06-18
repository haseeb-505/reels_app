import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(){
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized({ req , token }) {
                const {pathname} = req.nextUrl;
                if (
                    pathname.startsWith("/api/auth")
                    || pathname === "/login"
                    || pathname === "/register"
                ) {
                    return true
                };

                if (
                    pathname === "/" || pathname.startsWith("/api/videos")
                ) {
                    return true
                }

                return !!token // if no toek it is empty string, false, if token it is true
            }
        }
    }
)

export const config = { matcher: [
    "/login",
    "/register",

] };
import { authOptions } from "@/libs/authOptions";
import NexAuth from "next-auth";

const handler = NexAuth(authOptions)

export {handler as GET, handler as POST}




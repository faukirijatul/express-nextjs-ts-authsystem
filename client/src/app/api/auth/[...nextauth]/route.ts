import { authOptions } from "@/lib/auth-options";
import NextAuth from "next-auth";

// Create the handler
const handler = NextAuth(authOptions);

// Export the handler as both GET and POST
export { handler as GET, handler as POST };

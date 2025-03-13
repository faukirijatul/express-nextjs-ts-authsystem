import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.SECRET || "",
};

// Create the handler
const handler = NextAuth(authOptions);

// Export the handler as both GET and POST
export { handler as GET, handler as POST };

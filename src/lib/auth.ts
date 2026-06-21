import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          return {
            id:    credentials.email,
            name:  "Criador Elite",
            email: credentials.email,
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
          };
        }
        return null;
      },
    }),
  ],

  pages: { signIn: "/login" },

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub ?? token.email;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

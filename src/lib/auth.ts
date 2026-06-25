import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

export const authOptions: NextAuthOptions = {
  providers: [
    // Real OAuth — anyone with a Google account (needs GOOGLE_CLIENT_ID/SECRET).
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // Facebook Login. During Meta app review only test users / app admins can
    // sign in (Meta restriction) — this is the account created for the Facebook
    // review team. Uses FACEBOOK_CLIENT_ID/SECRET, falling back to META_APP_*.
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? process.env.META_APP_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? process.env.META_APP_SECRET ?? "",
    }),

    // Email/password login backed by Supabase Auth.
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email    = (credentials?.email ?? "").trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return null;

        return {
          id:    data.user.id,
          email: data.user.email ?? email,
          name:  data.user.user_metadata?.full_name ?? data.user.email ?? email,
        };
      },
    }),
  ],

  // Credentials provider requires JWT sessions.
  session: { strategy: "jwt" },

  pages: { signIn: "/login" },

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub ?? token.email ?? undefined;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

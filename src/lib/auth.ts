import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Creates the user in Supabase Auth (for dashboard visibility) without blocking login.
async function syncToSupabaseAuth(email: string, name?: string | null) {
  const admin = getAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name ?? email },
  });
  // Ignore "already registered" — user already exists, nothing to do.
  if (error && !error.message.includes("already been registered")) {
    console.error("[auth] syncToSupabaseAuth error:", error.message);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // Facebook Login — during Meta app review only test users/admins can sign in.
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

        // Return email as id so all tables use email as user_id consistently.
        return {
          id:    email,
          email: email,
          name:  data.user.user_metadata?.full_name ?? email,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "signIn" && user?.email) {
        const email = user.email.trim().toLowerCase();

        // Sync to Supabase Auth (fire-and-forget — don't block the login).
        syncToSupabaseAuth(email, user.name).catch(() => null);

        // Ensure a subscription row exists, keyed by email.
        await getAdminClient()
          .from("subscriptions")
          .upsert({ user_id: email }, { onConflict: "user_id", ignoreDuplicates: true });

        // Store normalized email so session.user.id is always the email.
        token.normalizedEmail = email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // Use email as the canonical user_id — consistent with all API routes.
        (session.user as { id?: string }).id =
          (token.normalizedEmail as string | undefined) ?? token.email ?? undefined;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

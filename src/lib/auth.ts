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

// Returns the Supabase Auth UUID for the given email, creating the user if needed.
async function getOrCreateSupabaseUser(email: string, name?: string | null): Promise<string | null> {
  const admin = getAdminClient();

  // Try to create — fast path for new users
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name ?? email },
  });
  if (!error && created.user) return created.user.id;

  // User already exists — find by scanning (Supabase admin has no getUserByEmail)
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  return list?.users?.find((u) => u.email === email)?.id ?? null;
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

        return {
          id:    data.user.id,
          email: data.user.email ?? email,
          name:  data.user.user_metadata?.full_name ?? data.user.email ?? email,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  callbacks: {
    // On first login, sync the user to Supabase Auth and store the UUID in the token.
    async jwt({ token, user, trigger }) {
      // `user` is only present on the first sign-in
      if (trigger === "signIn" && user?.email) {
        const supabaseId = await getOrCreateSupabaseUser(user.email, user.name);
        if (supabaseId) {
          token.supabaseId = supabaseId;
          // Also ensure a subscription row exists for this user
          await getAdminClient()
            .from("subscriptions")
            .upsert({ user_id: supabaseId }, { onConflict: "user_id", ignoreDuplicates: true });
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // Prefer the Supabase UUID; fall back to NextAuth sub for existing sessions
        (session.user as { id?: string }).id =
          (token.supabaseId as string | undefined) ?? token.sub ?? token.email ?? undefined;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

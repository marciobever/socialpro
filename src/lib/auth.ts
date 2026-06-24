import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { createHash, timingSafeEqual } from "crypto";

/**
 * Constant-time string comparison. Both inputs are hashed to a fixed-length
 * buffer first, so this is safe against timing attacks and never leaks length.
 */
function safeEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

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

    // Single allow-listed e-mail/password account, configured via env vars.
    // Used by the Meta/Facebook review team to test the platform. There is no
    // public sign-up — everyone else authenticates through Google.
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email    = (credentials?.email ?? "").trim().toLowerCase();
        const password = credentials?.password ?? "";

        const allowedEmail    = (process.env.TEST_USER_EMAIL ?? "").trim().toLowerCase();
        const allowedPassword = process.env.TEST_USER_PASSWORD ?? "";

        // If the env credentials aren't configured, password login is disabled.
        if (!email || !password || !allowedEmail || !allowedPassword) return null;

        const valid = safeEqual(email, allowedEmail) && safeEqual(password, allowedPassword);
        if (!valid) return null;

        return {
          id:    allowedEmail,
          name:  process.env.TEST_USER_NAME ?? "SocialPro Tester",
          email: allowedEmail,
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

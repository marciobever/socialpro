import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email;
  const baseUrl = process.env.NEXTAUTH_URL!;
  if (!userId) return NextResponse.redirect(`${baseUrl}/login`);

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "LINKEDIN_CLIENT_ID não configurado." }, { status: 500 });

  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ userId, nonce })).toString("base64url");

  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${baseUrl}/api/linkedin/callback`);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "openid profile w_member_social");

  const response = NextResponse.redirect(url.toString());
  response.cookies.set("linkedin_oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}

import { env, isGoogleEnabled } from "../config/env";
import { HttpError } from "./errors";

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
}

interface TokenInfo {
  aud?: string;
  azp?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
}

interface UserInfo {
  sub: string;
  email?: string;
  name?: string;
}

/**
 * Verifies a Google OAuth access token (obtained on the frontend via Google
 * Identity Services) and returns the associated profile. We check the token's
 * audience against our own client id so tokens minted for other apps are
 * rejected, then read the profile from the userinfo endpoint.
 */
export async function fetchGoogleProfile(
  accessToken: string,
): Promise<GoogleProfile> {
  if (!isGoogleEnabled) {
    throw new HttpError(503, "Google login is not configured on the server.");
  }

  const tokenInfoRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
  );
  if (!tokenInfoRes.ok) {
    throw new HttpError(401, "Could not verify Google account.");
  }
  const tokenInfo = (await tokenInfoRes.json()) as TokenInfo;

  const audience = tokenInfo.aud ?? tokenInfo.azp;
  if (audience !== env.GOOGLE_CLIENT_ID) {
    throw new HttpError(401, "Google token was issued for a different app.");
  }

  const userInfoRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!userInfoRes.ok) {
    throw new HttpError(401, "Could not read Google profile.");
  }
  const userInfo = (await userInfoRes.json()) as UserInfo;

  if (!userInfo.email) {
    throw new HttpError(401, "Google account has no email address.");
  }

  return {
    googleId: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name ?? userInfo.email,
  };
}

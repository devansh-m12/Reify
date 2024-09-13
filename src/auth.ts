import Spotify from "next-auth/providers/spotify"
import NextAuth, { type DefaultSession } from "next-auth"
 
declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string
      refreshToken?: string
      accessTokenExpires?: number
    } & DefaultSession["user"]
  }
  interface Account {
    refreshToken?: string
    expires_at?: number
  }
}
const scopes = [
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-currently-playing",
    "user-modify-playback-state"
].join(",")

const params = {
    scope: scopes
}
async function refreshAccessToken(token: any) {
    const params = new URLSearchParams()
    params.append("grant_type", "refresh_token")
    params.append("refresh_token", token.refreshToken)
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(process.env.AUTH_SPOTIFY_ID + ':' + process.env.AUTH_SPOTIFY_SECRET).toString('base64'))
        },
        body: params
    })
    const data = await response.json()
    return {
        ...token,
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? token.refreshToken,
        accessTokenExpires: Date.now() + data.expires_in * 1000
    }
}
 
const LOGIN_URL = "https://accounts.spotify.com/authorize?" + new URLSearchParams(params).toString();
export const { handlers, signIn, signOut, auth  } = NextAuth({
  providers: [Spotify({
    clientId: process.env.AUTH_SPOTIFY_ID,
    clientSecret: process.env.AUTH_SPOTIFY_SECRET,
    authorization: LOGIN_URL
  })],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) { // User is available during sign-in
        token.id = user.id
      }
      if (account) { // Account is available during sign-in
        token.accessToken = account.access_token as string
        token.refreshToken = account.refresh_token as string
        token.accessTokenExpires = (account.expires_at as number ?? 0)
      }
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) * 1000) {
            return token
        }

        // access token has expired
        return await refreshAccessToken(token)
    },
    session({ session, token }) {
      if (token.accessToken && typeof token.accessToken === 'string') {
        session.user.accessToken = token.accessToken
        session.user.refreshToken = token.refreshToken as string
        session.user.accessTokenExpires = token.accessTokenExpires as number
      }
      return session
    },
  },
})
import Spotify from "next-auth/providers/spotify"
import NextAuth, { type DefaultSession } from "next-auth"
 
declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string
    } & DefaultSession["user"]
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
 
const LOGIN_URL = "https://accounts.spotify.com/authorize?" + new URLSearchParams(params).toString();
export const { handlers, signIn, signOut, auth  } = NextAuth({
  providers: [Spotify({
    clientId: process.env.AUTH_SPOTIFY_ID,
    clientSecret: process.env.AUTH_SPOTIFY_SECRET,
    authorization: LOGIN_URL
  })],
  callbacks: {
    jwt({ token, user, account }) {
      if (user) { // User is available during sign-in
        token.id = user.id
      }
      if (account) { // Account is available during sign-in
        token.accessToken = account.access_token
      }
      return {
        ...token,
      }
    },
    session({ session, token }) {
      if (token.accessToken && typeof token.accessToken === 'string') {
        session.user.accessToken = token.accessToken
      }
      return session
    },
  },
})
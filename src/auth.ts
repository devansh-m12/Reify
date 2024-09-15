import Spotify from "next-auth/providers/spotify"
import NextAuth, { type DefaultSession } from "next-auth"
 
declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string
      refreshToken?: string
      expires_at?: number
    } & DefaultSession["user"]
  }
}
const scopes = [
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-currently-playing",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-playback-position",
    "user-top-read",
    "user-read-recently-played",
    "user-read-playback-position",
    "user-read-playback-state",
    "user-read-playback-position",
    "user-read-playback-state", 
].join(",")

const params = {
    scope: scopes
}
let refreshToken : string = ""
let accessToken : string  = ""
let accessTokenExpires : number = 0

async function refreshAccessToken(token: any) {
    const paramsX = new URLSearchParams()
    paramsX.append("grant_type", "refresh_token")
    if(refreshToken==="") paramsX.append("refresh_token", token.refreshToken)
    else paramsX.append("refresh_token", refreshToken)
    
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(process.env.AUTH_SPOTIFY_ID + ':' + process.env.AUTH_SPOTIFY_SECRET).toString('base64'))
        },
        body: paramsX
    })
    const data = await response.json()
    refreshToken = data.refresh_token ?? refreshToken
    accessToken = data.access_token ?? accessToken
    accessTokenExpires = Date.now() + (data.expires_in * 1000)
    return {
        ...token,
        accessToken: accessToken ?? token.accessToken,
        refreshToken: refreshToken ?? token.refreshToken,
        accessTokenExpires: accessTokenExpires
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
      if (account) { // Account is available during sign-in
        token.accessToken = account.access_token as string
        token.refreshToken = account.refresh_token as string
        token.accessTokenExpires = (Date.now() + ((account.expires_in as number) * 1000)) as number
        refreshToken = token.refreshToken as string
        accessToken = token.accessToken as string
        accessTokenExpires = token.accessTokenExpires as number
      }

      if(token.accessTokenExpires && typeof token.accessTokenExpires === 'number' && Date.now() > token.accessTokenExpires) {
        token = await refreshAccessToken(token)
      }

      return token
    },
    async session({ session, token }) {

      if(accessTokenExpires === 0) {
        accessTokenExpires = token.accessTokenExpires as number
        refreshToken = token.refreshToken as string
        accessToken = token.accessToken as string
      }

      if(accessTokenExpires && Date.now() > accessTokenExpires) {
        token = await refreshAccessToken(token)
      }


      session.user.accessToken = accessToken as string
      session.user.refreshToken = refreshToken as string
      session.user.expires_at = accessTokenExpires
      return session
    },
  },
})
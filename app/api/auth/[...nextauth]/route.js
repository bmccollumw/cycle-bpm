import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.spotifyId = account.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.spotifyId = token.spotifyId
      return session
    }
  },
  pages: {
    signIn: '/'
  }
})

export { handler as GET, handler as POST }
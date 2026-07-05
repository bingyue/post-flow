import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db/prisma'
import { verifyPassword } from '@/lib/auth/password'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Email and password',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase()
        const password = String(credentials?.password ?? '')

        if (!email || !password) {
          return null
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.passwordHash) {
          return null
        }

        const valid = await verifyPassword(password, user.passwordHash)
        if (!valid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.email,
          plan: user.plan,
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plan = user.plan ?? 'free'
        token.isAdmin = user.isAdmin ?? false
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id)
        session.user.plan = String(token.plan ?? 'free')
        session.user.isAdmin = Boolean(token.isAdmin)
      }
      return session
    },
  },
})

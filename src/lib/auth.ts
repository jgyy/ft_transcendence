import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Extend NextAuth types to include custom session properties
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    email: string
    username: string
    image?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    email: string
    picture?: string
    provider?: string
  }
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validation = loginSchema.safeParse(credentials)
        if (!validation.success) {
          throw new Error('Invalid email or password format')
        }

        const { email, password } = validation.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isOnline: true,
            lastSeen: new Date(),
          },
        })

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          image: user.avatarUrl || undefined,
          name: user.displayName || user.username,
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
            displayName: true,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.username = dbUser.username
          token.email = dbUser.email
          token.picture = dbUser.avatarUrl || undefined
        }
      }

      if (account) {
        token.provider = account.provider
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.email = token.email as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/dashboard'
    },
  },

  events: {
    async signOut({ token }) {
      if (token.id) {
        await prisma.user.update({
          where: { id: token.id as string },
          data: {
            isOnline: false,
            lastSeen: new Date(),
          },
        })
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

export const handler = NextAuth(authOptions)

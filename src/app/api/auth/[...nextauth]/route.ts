import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && user.email) {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (!existingUser) {
            // Get the free plan (default)
            const freePlan = await prisma.plan.findFirst({
              where: { name: 'Free' }
            });

            // Create new user with free plan
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                planId: freePlan?.id || null,
              }
            });
            console.log(`Created new user: ${user.email}`);
          }
        } catch (error) {
          console.error('Error creating user during sign in:', error);
          // Don't block sign in if user creation fails
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
});

export { handler as GET, handler as POST }; 
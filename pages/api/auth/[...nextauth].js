// /pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/db";
import { loginWithRoleSchema } from "../../../lib/validators";
import User from "../../../models/User";
import logger, { loggers } from "../../../lib/logger";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validatedData = loginWithRoleSchema.parse(credentials);
          const { email, password, role } = validatedData;

          // Connect to database
          await connectDB();

          // Find user
          const user = await User.findOne({ email }).lean();
          if (!user) {
            loggers.logSecurity('Failed login attempt', { email, reason: 'User not found' });
            throw new Error("Invalid credentials");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
          );
          if (!isPasswordValid) {
            loggers.logSecurity('Failed login attempt', { email, reason: 'Invalid password' });
            throw new Error("Invalid credentials");
          }

          // Check if user has the requested role
          if (user.role !== role) {
            loggers.logSecurity('Failed login attempt', { email, requestedRole: role, actualRole: user.role, reason: 'Role mismatch' });
            throw new Error("Role not allowed for this user");
          }

          loggers.logAuth('Login success', user._id.toString(), user.email, true);
          
          const userForToken = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            storeIdsOwned: (user.ownsStores || []).map((id) => id.toString()),
            connectedStores: (user.connectedStores || []).map((id) =>
              id.toString()
            ),
          };

          return userForToken;
        } catch (error) {
          loggers.logError(error, { context: 'NextAuth authorize', email: credentials?.email });
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // First time signing in
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.storeIdsOwned = user.storeIdsOwned;

        // Set storeId for StoreAdmin
        if (token.role === "StoreAdmin") {
          token.storeId =
            token.storeIdsOwned && token.storeIdsOwned.length === 1
              ? token.storeIdsOwned[0]
              : null;
        } else {
          token.storeId = null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId,
        email: token.email || null,
        name: token.name || null,
        role: token.role || null,
        storeId: token.storeId ?? null,
        storeIdsOwned: token.storeIdsOwned || [],
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
};

export default NextAuth(authOptions);


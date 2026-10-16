import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, writerProfiles } from "@/db/schema";
import { loginSchema } from "@/lib/validation";
import { consumeRateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const attempt = consumeRateLimit(`login:${address}`, 10, 15 * 60 * 1000);
        if (!attempt.allowed) return null;

        const [account] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            passwordHash: users.passwordHash,
            isActive: users.isActive,
            writerId: writerProfiles.id,
            archivedAt: writerProfiles.archivedAt,
          })
          .from(users)
          .leftJoin(writerProfiles, eq(writerProfiles.userId, users.id))
          .where(eq(users.email, parsed.data.email))
          .limit(1);

        if (!account?.isActive) return null;
        if (account.role === "WRITER" && (!account.writerId || account.archivedAt)) return null;

        const passwordMatches = await compare(parsed.data.password, account.passwordHash);
        if (!passwordMatches) return null;

        return {
          id: account.id,
          email: account.email,
          name: account.name,
          role: account.role,
          writerId: account.writerId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.writerId = user.writerId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.userId === "string" ? token.userId : "";
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "WRITER";
        session.user.writerId = typeof token.writerId === "string" ? token.writerId : null;
      }
      return session;
    },
  },
});

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateSecureToken } from '../utils/generateCode.js';
import type { JwtPayload } from '../middleware/auth.js';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

interface RegisterInput {
  email: string;
  password: string;
  username: string;
  displayName: string;
  dateOfBirth?: Date;
  isChild?: boolean;
}

interface LoginInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult extends TokenPair {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    isChild: boolean;
    emailVerified: boolean;
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const { email, password, username, displayName, dateOfBirth, isChild } = input;

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    throw new AppError(409, 'Username already taken', 'USERNAME_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      username,
      displayName,
      dateOfBirth,
      isChild: isChild || false,
      emailVerifyToken: generateSecureToken(),
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isChild: true,
      emailVerified: true,
    },
  });

  // Generate tokens
  const tokens = await createSession(user.id);

  return {
    ...tokens,
    user,
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const { email, password, userAgent, ipAddress } = input;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      passwordHash: true,
      isChild: true,
      emailVerified: true,
    },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Update last seen
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeenAt: new Date() },
  });

  // Generate tokens
  const tokens = await createSession(user.id, userAgent, ipAddress);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    ...tokens,
    user: userWithoutPassword,
  };
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { refreshToken },
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  // Find session
  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          isChild: true,
        },
      },
    },
  });

  if (!session) {
    throw new AppError(401, 'Invalid refresh token', 'INVALID_TOKEN');
  }

  // Check if expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    throw new AppError(401, 'Refresh token expired', 'TOKEN_EXPIRED');
  }

  // Generate new access token
  const payload: JwtPayload = {
    userId: session.user.id,
    email: session.user.email,
    username: session.user.username,
    isChild: session.user.isChild,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  // Optionally rotate refresh token (more secure)
  const newRefreshToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshToken: newRefreshToken,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function verifyEmail(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    throw new AppError(400, 'Invalid verification token', 'INVALID_TOKEN');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
    },
  });

  return true;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, 'Current password is incorrect');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  // Invalidate all sessions except current
  await prisma.session.deleteMany({
    where: { userId },
  });
}

// Helper function to create session and generate tokens
async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<TokenPair> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      isChild: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    isChild: user.isChild,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.session.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });

  return { accessToken, refreshToken };
}

// Get current user data
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      avatarConfig: true,
      isChild: true,
      emailVerified: true,
      createdAt: true,
      lastSeenAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

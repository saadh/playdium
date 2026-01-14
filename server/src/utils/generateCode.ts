import { randomBytes } from 'crypto';

// Generate invite code in format PLAY-XXXX-XXXX
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let part1 = '';
  let part2 = '';

  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `PLAY-${part1}-${part2}`;
}

// Generate a secure random token for email verification, password reset, etc.
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

// Generate a short numeric code for magic link
export function generateMagicCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a unique username suggestion based on display name
export function generateUsername(displayName: string): string {
  const base = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

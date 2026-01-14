export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  avatarConfig: Record<string, unknown> | null;
  isChild: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSeenAt: string | null;
}

export interface Partner {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  lastSeenAt: string | null;
}

export interface Partnership {
  id: string;
  partner: Partner;
  createdAt: string;
  acceptedAt: string | null;
  sharedGarden: SharedGarden | null;
  treasureMap: TreasureMap | null;
  doodleGallery: DoodleGallery | null;
  stats: {
    sharedAchievements: number;
    activityFeedItems: number;
  };
}

export interface SharedGarden {
  id: string;
  name: string;
  gardenLevel: number;
  totalPlants: number;
}

export interface TreasureMap {
  id: string;
  currentWorld: string;
  totalTreasures: number;
}

export interface DoodleGallery {
  id: string;
  drawingIds: string[];
}

export interface InviteCode {
  code: string;
  expiresAt: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Garden types
export interface GardenPlot {
  id: string;
  positionX: number;
  positionY: number;
  areaId: string;
  plantType: string | null;
  plantedAt: string | null;
  wateredAt: string | null;
  wateredBy: string | null;
  growthStage: number;
  isFullyGrown: boolean;
  decorationType: string | null;
  decorationData: Record<string, unknown> | null;
  attachedVoiceMessage: string | null;
}

export interface GardenGift {
  id: string;
  fromUserId: string;
  toUserId: string;
  giftType: 'seeds' | 'decoration' | 'tool' | 'creature_treat';
  giftData: Record<string, unknown>;
  message: string | null;
  voiceMessageId: string | null;
  isOpened: boolean;
  createdAt: string;
}

export interface GardenCreature {
  id: string;
  creatureType: string;
  name: string | null;
  discoveredBy: string;
  discoveredAt: string;
  favoriteSpot: { x: number; y: number } | null;
}

// Doodle types
export type DoodleGameMode = 'FINISH_DRAWING' | 'GUESS_DOODLE' | 'COPY_CAT' | 'COLLABORATIVE';
export type GameSessionStatus = 'IN_PROGRESS' | 'WAITING_FOR_PARTNER' | 'COMPLETED' | 'ABANDONED';

export interface DoodleSession {
  id: string;
  gameMode: DoodleGameMode;
  status: GameSessionStatus;
  currentTurn: string | null;
  roundNumber: number;
  maxRounds: number;
  scores: Record<string, number>;
  createdAt: string;
}

export interface Drawing {
  id: string;
  artistId: string;
  canvasData: CanvasData;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  promptWord: string | null;
  isGuessed: boolean;
  guessedBy: string | null;
  guessedWord: string | null;
  isSavedToGallery: boolean;
  title: string | null;
  createdAt: string;
}

export interface CanvasData {
  strokes: Stroke[];
  width: number;
  height: number;
  backgroundColor: string;
}

export interface Stroke {
  points: number[];
  color: string;
  size: number;
  tool: 'pencil' | 'marker' | 'spray' | 'crayon' | 'glow';
}

// Treasure types
export interface TreasureWorld {
  id: string;
  worldKey: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  isUnlocked: boolean;
  progress: number;
}

export interface TreasureProgress {
  worldId: string;
  exploredAreas: string[];
  foundItems: string[];
  solvedPuzzles: string[];
  lastPositionX: number | null;
  lastPositionY: number | null;
}

export interface HiddenTreasure {
  id: string;
  hiddenByUserId: string;
  forUserId: string;
  worldId: string;
  positionX: number;
  positionY: number;
  treasureType: 'item' | 'clue' | 'voice_message' | 'mini_game';
  voiceClueId: string | null;
  isFound: boolean;
}

export interface MapMarker {
  id: string;
  createdByUserId: string;
  worldId: string;
  positionX: number;
  positionY: number;
  markerType: 'flag' | 'star' | 'question' | 'heart' | 'custom';
  note: string | null;
  voiceNoteId: string | null;
  color: string;
  isShared: boolean;
}

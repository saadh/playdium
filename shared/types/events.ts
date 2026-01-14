// Socket.io event types

// Presence events
export interface PartnerOnlineEvent {
  userId: string;
  timestamp: string;
}

export interface PartnerOfflineEvent {
  userId: string;
  timestamp: string;
}

export interface TypingEvent {
  userId: string;
  context: string;
  contextId?: string;
}

// Notification events
export interface NotificationEvent {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export type NotificationType =
  | 'PARTNER_JOINED'
  | 'PARTNER_ONLINE'
  | 'GAME_UPDATE'
  | 'GIFT_RECEIVED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'VOICE_MESSAGE'
  | 'TURN_READY';

// Garden events
export interface PlantWateredEvent {
  plotId: string;
  wateredBy: string;
  newGrowthStage: number;
  timestamp: string;
}

export interface PlantPlantedEvent {
  plot: {
    id: string;
    positionX: number;
    positionY: number;
    plantType: string;
  };
  plantedBy: string;
  timestamp: string;
}

export interface GiftSentEvent {
  giftId: string;
  fromUserId: string;
  toUserId: string;
  giftType: string;
  timestamp: string;
}

// Doodle events
export interface DrawingUpdateEvent {
  sessionId: string;
  stroke: {
    points: number[];
    color: string;
    size: number;
    tool: string;
  };
  userId: string;
}

export interface TurnChangedEvent {
  sessionId: string;
  newTurnUserId: string;
  roundNumber: number;
}

export interface GuessSubmittedEvent {
  sessionId: string;
  guess: string;
  isCorrect: boolean;
  guessedBy: string;
}

// Treasure events
export interface TreasureFoundEvent {
  treasureId: string;
  foundBy: string;
  treasureType: string;
  worldId: string;
  timestamp: string;
}

export interface MarkerAddedEvent {
  marker: {
    id: string;
    worldId: string;
    positionX: number;
    positionY: number;
    markerType: string;
    note?: string;
  };
  createdBy: string;
}

export interface AreaExploredEvent {
  worldId: string;
  areaId: string;
  exploredBy: string;
  timestamp: string;
}

// Voice chat events
export interface VoiceChatOfferEvent {
  userId: string;
  offer: RTCSessionDescriptionInit;
}

export interface VoiceChatAnswerEvent {
  userId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateEvent {
  userId: string;
  candidate: RTCIceCandidateInit;
}

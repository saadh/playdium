import { create } from 'zustand';
import { api } from '@/lib/api';

interface Partner {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  lastSeenAt: string | null;
}

interface Partnership {
  id: string;
  partner: Partner;
  createdAt: string;
  acceptedAt: string | null;
  sharedGarden: {
    id: string;
    name: string;
    gardenLevel: number;
    totalPlants: number;
  } | null;
  treasureMap: {
    id: string;
    currentWorld: string;
    totalTreasures: number;
  } | null;
  doodleGallery: {
    id: string;
    drawingIds: string[];
  } | null;
  stats: {
    sharedAchievements: number;
    activityFeedItems: number;
  };
}

interface PartnerState {
  partnership: Partnership | null;
  isPartnerOnline: boolean;
  isLoading: boolean;
  error: string | null;
}

interface PartnerActions {
  fetchPartnership: () => Promise<void>;
  createInvite: () => Promise<{ code: string; expiresAt: string }>;
  joinWithInvite: (code: string) => Promise<void>;
  setPartnerOnline: (online: boolean) => void;
  clearPartnership: () => void;
}

export const usePartnerStore = create<PartnerState & PartnerActions>()((set) => ({
  partnership: null,
  isPartnerOnline: false,
  isLoading: false,
  error: null,

  fetchPartnership: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/partnerships/current');
      set({
        partnership: response.data.partnership,
        isLoading: false,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ partnership: null, isLoading: false });
      } else {
        set({
          isLoading: false,
          error: error.response?.data?.error || 'Failed to fetch partnership',
        });
      }
    }
  },

  createInvite: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/partnerships/create-invite');
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Failed to create invite',
      });
      throw error;
    }
  },

  joinWithInvite: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/partnerships/join', { code });
      set({
        partnership: response.data.partnership,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Failed to join partnership',
      });
      throw error;
    }
  },

  setPartnerOnline: (online: boolean) => {
    set({ isPartnerOnline: online });
  },

  clearPartnership: () => {
    set({ partnership: null, isPartnerOnline: false });
  },
}));

import { useEffect, useState, useCallback } from 'react';
import { usePartnerStore } from '@/stores/partnerStore';
import { useSocket } from './useSocket';

interface PartnerStatus {
  isOnline: boolean;
  lastSeenAt: string | null;
}

export function usePartnerStatus() {
  const { partnership, isPartnerOnline, setPartnerOnline } = usePartnerStore();
  const { on, emit } = useSocket();
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!partnership) return;

    // Get initial status
    emit<PartnerStatus>('presence:getPartnerStatus')
      .then((status) => {
        setPartnerOnline(status.isOnline);
        setLastSeen(status.lastSeenAt);
      })
      .catch(() => {
        // Ignore errors
      });

    // Listen for status changes
    const unsubOnline = on<{ userId: string; timestamp: string }>('partner:online', (data) => {
      if (data.userId === partnership.partner.id) {
        setPartnerOnline(true);
        setLastSeen(data.timestamp);
      }
    });

    const unsubOffline = on<{ userId: string; timestamp: string }>('partner:offline', (data) => {
      if (data.userId === partnership.partner.id) {
        setPartnerOnline(false);
        setLastSeen(data.timestamp);
      }
    });

    return () => {
      unsubOnline();
      unsubOffline();
    };
  }, [partnership?.id]);

  const formatLastSeen = useCallback(() => {
    if (!lastSeen) return null;

    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }, [lastSeen]);

  return {
    isOnline: isPartnerOnline,
    lastSeenAt: lastSeen,
    lastSeenFormatted: formatLastSeen(),
    partnerName: partnership?.partner.displayName || null,
  };
}

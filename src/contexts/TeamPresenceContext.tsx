/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { safeStorage } from '../utils/safeStorage';

export interface PresenceUser {
  userId: string;
  name: string;
  email: string;
  photoURL?: string | null;
  onlineAt: string;
  projectId?: string | null;
  activeModule?: string | null;
}

interface TeamPresenceContextType {
  onlineUsers: PresenceUser[];
  onlineCount: number;
  isUserOnline: (userIdOrEmail?: string | null) => boolean;
}

const TeamPresenceContext = createContext<TeamPresenceContextType>({
  onlineUsers: [],
  onlineCount: 0,
  isUserOnline: () => false,
});

export const useTeamPresence = () => useContext(TeamPresenceContext);

const GENERIC_FALLBACK_NAMES = new Set(['benutzer', 'team', 'user', 'gast', 'guest']);

export const TeamPresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { activeProjectId } = (useProject?.() || {}) as any;
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);

  // Strict multi-tenant isolation: respect Super-Admin preview mode and fall back to user's own ID, never a shared global channel
  const previewCompanyId = safeStorage.session.getString('admin_preview_company_id');
  const safeCompanyId = previewCompanyId || currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid || currentUser?.id || '';

  const currentUserName = useMemo(() => {
    if (!currentUser) return 'Team';
    return (
      currentUser.displayName ||
      currentUser.name ||
      (currentUser.email === 'cv1@gmx.ch' ? 'Carlo Vescio' : currentUser.email ? currentUser.email.split('@')[0] : 'Team')
    );
  }, [currentUser]);

  const currentUserPhoto = currentUser?.photoURL || (currentUser as any)?.avatar || null;

  // Main channel lifecycle: only reconnect when user or tenant changes (NOT when switching projects)
  useEffect(() => {
    const userId = currentUser?.id || currentUser?.uid;
    if (!userId || !safeCompanyId) {
      setOnlineUsers([]);
      return;
    }

    const channelName = `presence:company:${safeCompanyId}`;
    isSubscribedRef.current = false;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });
    channelRef.current = channel;

    const updatePresenceState = () => {
      try {
        const state = channel.presenceState();
        const usersMap = new Map<string, PresenceUser>();

        Object.values(state).forEach((presences: any) => {
          if (Array.isArray(presences)) {
            presences.forEach((p: any) => {
              if (p && p.userId) {
                usersMap.set(p.userId.toLowerCase(), {
                  userId: p.userId,
                  name: p.name || 'Benutzer',
                  email: p.email || '',
                  photoURL: p.photoURL || null,
                  onlineAt: p.onlineAt || new Date().toISOString(),
                  projectId: p.projectId || null,
                  activeModule: p.activeModule || null,
                });
              }
            });
          }
        });

        // Ensure current user is always included in their own local list
        if (!usersMap.has(userId.toLowerCase())) {
          usersMap.set(userId.toLowerCase(), {
            userId,
            name: currentUserName,
            email: currentUser?.email || '',
            photoURL: currentUserPhoto,
            onlineAt: new Date().toISOString(),
            projectId: activeProjectId || null,
            activeModule: typeof window !== 'undefined' ? window.location.pathname : null,
          });
        }

        setOnlineUsers(Array.from(usersMap.values()));
      } catch (err) {
        console.warn('[Presence] error syncing state:', err);
      }
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        updatePresenceState();
      })
      .on('presence', { event: 'join' }, () => {
        updatePresenceState();
      })
      .on('presence', { event: 'leave' }, () => {
        updatePresenceState();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          try {
            await channel.track({
              userId,
              name: currentUserName,
              email: currentUser?.email || '',
              photoURL: currentUserPhoto,
              onlineAt: new Date().toISOString(),
              projectId: activeProjectId || null,
              activeModule: typeof window !== 'undefined' ? window.location.pathname : null,
            });
          } catch (e) {
            console.warn('[Presence] track error:', e);
          }
        }
      });

    return () => {
      isSubscribedRef.current = false;
      channelRef.current = null;
      try {
        channel.untrack();
        supabase.removeChannel(channel);
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.uid, safeCompanyId]);

  // Update presence payload in-place when activeProjectId or user profile details change without tearing down the channel
  useEffect(() => {
    const userId = currentUser?.id || currentUser?.uid;
    if (!userId || !channelRef.current || !isSubscribedRef.current) return;

    channelRef.current
      .track({
        userId,
        name: currentUserName,
        email: currentUser?.email || '',
        photoURL: currentUserPhoto,
        onlineAt: new Date().toISOString(),
        projectId: activeProjectId || null,
        activeModule: typeof window !== 'undefined' ? window.location.pathname : null,
      })
      .catch(() => {});
  }, [activeProjectId, currentUserName, currentUserPhoto, currentUser?.id, currentUser?.uid, currentUser?.email]);

  const onlineKeys = useMemo(() => {
    const set = new Set<string>();
    onlineUsers.forEach(u => {
      if (u.userId) set.add(u.userId.toLowerCase());
      if (u.email) set.add(u.email.toLowerCase());
      const normName = u.name?.toLowerCase().trim();
      if (normName && !GENERIC_FALLBACK_NAMES.has(normName)) {
        set.add(normName);
      }
    });
    return set;
  }, [onlineUsers]);

  const isUserOnline = (userIdOrEmail?: string | null): boolean => {
    if (!userIdOrEmail) return false;
    const key = userIdOrEmail.toLowerCase().trim();
    if (!key || GENERIC_FALLBACK_NAMES.has(key)) return false;
    
    // Direct match by ID, email, or non-generic name
    if (onlineKeys.has(key)) return true;

    // Substring or prefix match for emails (e.g. philipp vs philipp@...)
    for (const online of onlineUsers) {
      if (online.userId?.toLowerCase() === key) return true;
      if (online.email?.toLowerCase() === key) return true;
      if (online.email?.toLowerCase().startsWith(key + '@')) return true;
      const onlineName = online.name?.toLowerCase().trim();
      if (onlineName && !GENERIC_FALLBACK_NAMES.has(onlineName) && onlineName === key) return true;
    }

    return false;
  };

  return (
    <TeamPresenceContext.Provider
      value={{
        onlineUsers,
        onlineCount: onlineUsers.length,
        isUserOnline,
      }}
    >
      {children}
    </TeamPresenceContext.Provider>
  );
};

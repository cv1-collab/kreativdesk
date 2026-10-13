import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';

export interface PresenceUser {
  userId: string;
  name: string;
  email: string;
  photoURL?: string | null;
  onlineAt: string;
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

export const TeamPresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { activeProjectId } = (useProject?.() || {}) as any;
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  // Safe companyId fallback
  const safeCompanyId = currentUser?.companyId || 'kreativ_desk_global';

  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      setOnlineUsers([]);
      return;
    }

    const currentUserName = currentUser.displayName || currentUser.name || (currentUser.email === 'cv1@gmx.ch' ? 'Carlo Vescio' : currentUser.email ? currentUser.email.split('@')[0] : 'Team');
    const channelName = `presence:company:${safeCompanyId}`;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

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
                });
              }
            });
          }
        });

        // Ensure current user is always included in their own local list
        if (!usersMap.has(currentUser.id.toLowerCase())) {
          usersMap.set(currentUser.id.toLowerCase(), {
            userId: currentUser.id,
            name: currentUserName,
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || (currentUser as any).avatar || null,
            onlineAt: new Date().toISOString(),
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
          try {
            await channel.track({
              userId: currentUser.id,
              name: currentUserName,
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || (currentUser as any).avatar || null,
              onlineAt: new Date().toISOString(),
              projectId: activeProjectId || null,
            });
          } catch (e) {
            console.warn('[Presence] track error:', e);
          }
        }
      });

    return () => {
      try {
        channel.untrack();
        supabase.removeChannel(channel);
      } catch (_) {}
    };
  }, [currentUser?.id, safeCompanyId, activeProjectId]);

  const onlineKeys = useMemo(() => {
    const set = new Set<string>();
    onlineUsers.forEach(u => {
      if (u.userId) set.add(u.userId.toLowerCase());
      if (u.email) set.add(u.email.toLowerCase());
      if (u.name) set.add(u.name.toLowerCase());
    });
    return set;
  }, [onlineUsers]);

  const isUserOnline = (userIdOrEmail?: string | null): boolean => {
    if (!userIdOrEmail) return false;
    const key = userIdOrEmail.toLowerCase().trim();
    if (!key) return false;
    
    // Direct match by ID, email, or name
    if (onlineKeys.has(key)) return true;

    // Substring or prefix match for emails (e.g. philipp vs philipp@...)
    for (const online of onlineUsers) {
      if (online.userId?.toLowerCase() === key) return true;
      if (online.email?.toLowerCase() === key) return true;
      if (online.email?.toLowerCase().startsWith(key + '@')) return true;
      if (key.includes('@') && online.email?.toLowerCase() === key) return true;
      if (online.name?.toLowerCase() === key) return true;
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

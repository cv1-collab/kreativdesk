import { describe, it, expect } from 'vitest';
import { type PresenceUser } from '../../src/contexts/TeamPresenceContext';

describe('Team Presence Matching Logic', () => {
  const mockOnlineUsers: PresenceUser[] = [
    {
      userId: 'user-philipp-123',
      name: 'Philipp Meier',
      email: 'philipp@kreativ-desk.ch',
      onlineAt: '2026-10-13T10:00:00.000Z'
    },
    {
      userId: 'user-carlo-456',
      name: 'Carlo Vescio',
      email: 'cv1@gmx.ch',
      onlineAt: '2026-10-13T10:01:00.000Z'
    }
  ];

  const buildOnlineKeys = (users: PresenceUser[]) => {
    const set = new Set<string>();
    users.forEach(u => {
      if (u.userId) set.add(u.userId.toLowerCase());
      if (u.email) set.add(u.email.toLowerCase());
      if (u.name) set.add(u.name.toLowerCase());
    });
    return set;
  };

  const isUserOnline = (userIdOrEmail: string | undefined | null, users: PresenceUser[]): boolean => {
    if (!userIdOrEmail) return false;
    const key = userIdOrEmail.toLowerCase().trim();
    if (!key) return false;

    const keys = buildOnlineKeys(users);
    if (keys.has(key)) return true;

    for (const online of users) {
      if (online.userId?.toLowerCase() === key) return true;
      if (online.email?.toLowerCase() === key) return true;
      if (online.email?.toLowerCase().startsWith(key + '@')) return true;
      if (key.includes('@') && online.email?.toLowerCase() === key) return true;
      if (online.name?.toLowerCase() === key) return true;
    }
    return false;
  };

  it('erkennt Online-Nutzer anhand der exakten User-ID', () => {
    expect(isUserOnline('user-philipp-123', mockOnlineUsers)).toBe(true);
    expect(isUserOnline('user-carlo-456', mockOnlineUsers)).toBe(true);
  });

  it('erkennt Online-Nutzer anhand der E-Mail-Adresse (case-insensitive)', () => {
    expect(isUserOnline('philipp@kreativ-desk.ch', mockOnlineUsers)).toBe(true);
    expect(isUserOnline('PHILIPP@KREATIV-DESK.CH', mockOnlineUsers)).toBe(true);
    expect(isUserOnline('cv1@gmx.ch', mockOnlineUsers)).toBe(true);
  });

  it('erkennt Online-Nutzer anhand des Namens', () => {
    expect(isUserOnline('Philipp Meier', mockOnlineUsers)).toBe(true);
    expect(isUserOnline('Carlo Vescio', mockOnlineUsers)).toBe(true);
  });

  it('gibt false für Offline-Nutzer oder leere Eingaben zurück', () => {
    expect(isUserOnline('unknown-user-999', mockOnlineUsers)).toBe(false);
    expect(isUserOnline('someone@else.com', mockOnlineUsers)).toBe(false);
    expect(isUserOnline(null, mockOnlineUsers)).toBe(false);
    expect(isUserOnline('', mockOnlineUsers)).toBe(false);
  });
});

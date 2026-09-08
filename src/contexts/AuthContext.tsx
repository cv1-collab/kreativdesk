/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Role } from '../config/permissions';
import { safeStorage } from '../utils/safeStorage';

export interface AppUser {
  id: string;
  uid: string;
  email?: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  role?: Role;
  hasActiveSubscription?: boolean;
  stripeCustomerId?: string;
  plan?: string;
  companyId?: string;
  trialEndsAt?: string;
  canViewFinance?: boolean;
  canApproveBudget?: boolean;
  hasSeenTour?: boolean;
  hasCompletedOnboarding?: boolean;
}

interface AuthContextType {
  currentUser: AppUser | null;
  userRole: Role | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateCurrentUser: (updates: Partial<AppUser>) => void;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  loading: true,
  logout: async () => {},
  updateCurrentUser: () => {},
  refreshUserProfile: async () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateUserProfile = async (user: User) => {
    try {
      // 1. Check for invite token across URL, user metadata, and persistent safeStorage
      const urlParams = new URLSearchParams(window.location.search);
      const urlInvite = urlParams.get('invite');
      const metaInvite = (user.user_metadata as any)?.inviteToken;
      const storedInvite = safeStorage.getString('pending_invite_token');
      const effectiveInviteToken = urlInvite || metaInvite || (storedInvite ? storedInvite : null);

      let pendingInvite: any = null;
      if (effectiveInviteToken) {
        const { data: inv } = await supabase
          .from('invites')
          .select('*')
          .eq('token', effectiveInviteToken)
          .eq('status', 'pending')
          .maybeSingle();
        if (inv) pendingInvite = inv;
      }

      // Check also by user email if not found by token
      if (!pendingInvite && user.email) {
        const { data: inv } = await supabase
          .from('invites')
          .select('*')
          .ilike('email', user.email)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (inv) pendingInvite = inv;
      }

      let targetCompanyId: string | null = null;
      let targetRole: Role = 'owner';
      let isInvitedUser = false;

      if (pendingInvite) {
        targetCompanyId = pendingInvite.company_id;
        targetRole = (pendingInvite.role as Role) || 'employee';
        isInvitedUser = true;

        await supabase
          .from('invites')
          .update({
            status: 'used',
            used_by: user.id,
            email: user.email || pendingInvite.email,
            used_at: new Date().toISOString()
          })
          .eq('id', pendingInvite.id);

        safeStorage.removeItem('pending_invite_token');
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Fehler beim Laden des Profils:', error);
      }

      const rawName = profile?.name || (profile as any)?.full_name || (profile as any)?.display_name || user.user_metadata?.full_name;
      const userName = rawName || (user.email === 'cv1@gmx.ch' ? 'Carlo Vescio' : user.email?.split('@')[0] || 'User');
      let effectiveCompanyId = profile?.company_id || null;
      let effectiveRole = (profile?.role as Role) || 'owner';

      // If user had a pending invite, associate them with the inviting company
      if (isInvitedUser && targetCompanyId) {
        effectiveCompanyId = targetCompanyId;
        effectiveRole = targetRole;

        if (profile) {
          await supabase.from('profiles').update({ company_id: targetCompanyId, role: targetRole }).eq('id', user.id);
        }

        // Add to company_users if not present
        try {
          const { data: existingCu } = await supabase
            .from('company_users')
            .select('id')
            .eq('company_id', targetCompanyId)
            .eq('email', user.email)
            .maybeSingle();
          if (!existingCu) {
            await supabase.from('company_users').insert({
              company_id: targetCompanyId,
              name: userName,
              email: user.email || '',
              role: targetRole,
              status: 'Aktiv'
            });
          }
          const { data: compData } = await supabase
            .from('companies')
            .select('used_seats')
            .eq('id', targetCompanyId)
            .maybeSingle();
          if (compData) {
            await supabase
              .from('companies')
              .update({ used_seats: (compData.used_seats || 1) + 1 })
              .eq('id', targetCompanyId);
          }
        } catch (cuErr) {
          console.warn("Could not sync company_users record:", cuErr);
        }
      }

      if (profile) {
        if (!effectiveCompanyId) {
          const { data: existingComp } = await supabase
            .from('companies')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();

          if (existingComp) {
            effectiveCompanyId = existingComp.id;
            await supabase.from('profiles').update({ company_id: effectiveCompanyId }).eq('id', user.id);
          } else {
            const { data: newCompany, error: compError } = await supabase
              .from('companies')
              .insert({
                name: `${user.email?.split('@')[0] || 'User'}'s Organization`,
                plan: 'Free Trial',
                max_seats: 5,
                used_seats: 1,
                owner_id: user.id
              })
              .select()
              .maybeSingle();

            if (!compError && newCompany) {
              effectiveCompanyId = newCompany.id;
              await supabase
                .from('profiles')
                .update({ company_id: effectiveCompanyId })
                .eq('id', user.id);
            }
          }
        }

        const appUser: AppUser = {
          id: user.id,
          uid: user.id,
          email: user.email,
          name: userName,
          displayName: userName,
          photoURL: (profile as any)?.avatar || (profile as any)?.photo_url || '',
          emailVerified: true,
          role: effectiveRole,
          hasActiveSubscription: profile.has_active_subscription ?? true,
          stripeCustomerId: profile.stripe_customer_id,
          plan: profile.plan || 'Free Trial',
          companyId: effectiveCompanyId || undefined,
          trialEndsAt: profile.trial_ends_at,
          canViewFinance: profile.can_view_finance ?? true,
          canApproveBudget: profile.can_approve_budget ?? true,
          hasSeenTour: profile.has_seen_tour ?? false,
          hasCompletedOnboarding: profile.has_completed_onboarding ?? false
        };

        setUserRole(effectiveRole);
        setCurrentUser(appUser);

        // --- SMART CONCURRENT SESSION LOCK (ALLOWS 1 LAPTOP + 1 SMARTPHONE/IPAD SIMULTANEOUSLY) ---
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const deviceTypeKey = isMobileDevice ? 'active_mobile_session_id' : 'active_desktop_session_id';

        let mySessionId = safeStorage.getString(`kreativ_session_id_${deviceTypeKey}_${user.id}`);
        if (!mySessionId) {
          mySessionId = `sess_${deviceTypeKey}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          safeStorage.setItem(`kreativ_session_id_${deviceTypeKey}_${user.id}`, mySessionId);
          try {
            await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', user.id);
          } catch (_) {}
        } else {
          const currentRemoteSession = profile[deviceTypeKey];
          if (currentRemoteSession && currentRemoteSession !== mySessionId) {
            mySessionId = `sess_${deviceTypeKey}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            safeStorage.setItem(`kreativ_session_id_${deviceTypeKey}_${user.id}`, mySessionId);
            try {
              await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', user.id);
            } catch (_) {}
          }
        }
      } else {
        // Profile does not exist yet
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);

        if (!isInvitedUser) {
          const { data: existingComp } = await supabase
            .from('companies')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();

          if (existingComp) {
            effectiveCompanyId = existingComp.id;
          } else {
            const { data: newCompany } = await supabase
              .from('companies')
              .insert({
                name: `${user.email?.split('@')[0] || 'User'}'s Organization`,
                plan: 'Free Trial',
                max_seats: 5,
                used_seats: 1,
                owner_id: user.id
              })
              .select()
              .maybeSingle();

            if (newCompany) {
              effectiveCompanyId = newCompany.id;
            }
          }
        }

        const newProfile = {
          id: user.id,
          email: user.email || '',
          name: userName,
          role: isInvitedUser ? targetRole : 'owner',
          company_id: effectiveCompanyId,
          has_active_subscription: true,
          trial_ends_at: isInvitedUser ? null : trialEndDate.toISOString(),
          has_seen_tour: false
        };

        await supabase.from('profiles').upsert(newProfile);

        const appUser: AppUser = {
          id: user.id,
          uid: user.id,
          email: user.email,
          name: userName,
          displayName: userName,
          photoURL: '',
          emailVerified: true,
          role: isInvitedUser ? targetRole : 'owner',
          companyId: effectiveCompanyId || undefined,
          hasActiveSubscription: true,
          trialEndsAt: newProfile.trial_ends_at || undefined,
          canViewFinance: true,
          canApproveBudget: true,
          hasSeenTour: false,
          hasCompletedOnboarding: false
        };

        setUserRole(appUser.role || 'owner');
        setCurrentUser(appUser);
      }
    } catch (err) {
      console.error('Fehler in AuthContext:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      if (_event === 'PASSWORD_RECOVERY') {
        sessionStorage.setItem('is_password_recovery', 'true');
        if (!window.location.pathname.startsWith('/reset-password')) {
          window.location.href = '/reset-password';
          return;
        }
      }

      if (session?.user) {
        if (_event === 'TOKEN_REFRESHED' && currentUser) {
          setLoading(false);
          return;
        }
        fetchOrCreateUserProfile(session.user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // REALTIME CONCURRENT SESSION LOCK LISTENER (ALLOWS 1 LAPTOP + 1 SMARTPHONE/IPAD SIMULTANEOUSLY)
  useEffect(() => {
    if (!currentUser?.id) return;

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceTypeKey = isMobileDevice ? 'active_mobile_session_id' : 'active_desktop_session_id';
    const deviceTypeName = isMobileDevice ? 'Mobilgerät (Smartphone/iPad)' : 'Computer (Laptop/Desktop)';

    const mySessionId = safeStorage.getItem(`kreativ_session_id_${deviceTypeKey}_${currentUser.id}`);
    if (!mySessionId) return;

    const channel = supabase
      .channel(`session_lock_${currentUser.id}_${deviceTypeKey}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${currentUser.id}`
      }, (payload: any) => {
        const remoteSessionId = payload.new?.[deviceTypeKey];
        if (remoteSessionId && remoteSessionId !== mySessionId) {
          try {
            sessionStorage.setItem(
              'auth_conflict_reason',
              `⚠️ Sitzung Beendet: Dein Konto wurde auf einem zweiten ${deviceTypeName} angemeldet. Du kannst dich gleichzeitig auf 1 Laptop und 1 Smartphone/iPad anmelden, jedoch nicht auf zwei ${deviceTypeName}en gleichzeitig.`
            );
          } catch (e) {}
          logout();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  const updateCurrentUser = (updates: Partial<AppUser>) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const refreshUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchOrCreateUserProfile(session.user);
    }
  };

  const logout = async () => {
    if (currentUser?.id) {
      safeStorage.removeItem(`kreativ_session_id_active_desktop_session_id_${currentUser.id}`);
      safeStorage.removeItem(`kreativ_session_id_active_mobile_session_id_${currentUser.id}`);
    }
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading, logout, updateCurrentUser, refreshUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
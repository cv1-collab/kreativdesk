/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Role } from '../config/permissions';

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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Fehler beim Laden des Profils:', error);
      }

      if (profile) {
        let companyId = profile.company_id;

        if (!companyId) {
          const { data: existingComp } = await supabase
            .from('companies')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();

          if (existingComp) {
            companyId = existingComp.id;
            await supabase.from('profiles').update({ company_id: companyId }).eq('id', user.id);
          } else {
            const { data: newCompany, error: compError } = await supabase
              .from('companies')
              .insert({
                name: `${user.email?.split('@')[0] || 'User'}'s Organization`,
                plan: 'Free Trial',
                max_seats: 1,
                used_seats: 1,
                owner_id: user.id
              })
              .select()
              .single();

            if (!compError && newCompany) {
              companyId = newCompany.id;
              await supabase
                .from('profiles')
                .update({ company_id: companyId })
                .eq('id', user.id);
            }
          }
        }

        const rawName = profile?.name || profile?.full_name || profile?.display_name;
        const userName = rawName || (user.email === 'cv1@gmx.ch' ? 'Carlo Vescio' : user.email?.split('@')[0] || 'User');

        const appUser: AppUser = {
          id: user.id,
          uid: user.id,
          email: user.email,
          name: userName,
          displayName: userName,
          photoURL: profile?.avatar || profile?.photo_url || '',
          emailVerified: true,
          role: (profile.role as Role) || 'owner',
          hasActiveSubscription: profile.has_active_subscription ?? true,
          stripeCustomerId: profile.stripe_customer_id,
          plan: profile.plan || 'Free Trial',
          companyId: companyId,
          trialEndsAt: profile.trial_ends_at,
          canViewFinance: profile.can_view_finance ?? true,
          canApproveBudget: profile.can_approve_budget ?? true,
          hasSeenTour: profile.has_seen_tour ?? false,
          hasCompletedOnboarding: profile.has_completed_onboarding ?? false
        };

        setUserRole(appUser.role || 'owner');
        setCurrentUser(appUser);

        // --- SMART CONCURRENT SESSION LOCK (ALLOWS 1 LAPTOP + 1 SMARTPHONE/IPAD SIMULTANEOUSLY) ---
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const deviceTypeKey = isMobileDevice ? 'active_mobile_session_id' : 'active_desktop_session_id';

        let mySessionId = localStorage.getItem(`kreativ_session_id_${deviceTypeKey}_${user.id}`);
        if (!mySessionId) {
          mySessionId = `sess_${deviceTypeKey}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem(`kreativ_session_id_${deviceTypeKey}_${user.id}`, mySessionId);
          await supabase.from('profiles').update({ [deviceTypeKey]: mySessionId, last_active_at: new Date().toISOString() }).eq('id', user.id);
        } else {
          const currentRemoteSession = profile[deviceTypeKey];
          if (currentRemoteSession && currentRemoteSession !== mySessionId) {
            mySessionId = `sess_${deviceTypeKey}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(`kreativ_session_id_${deviceTypeKey}_${user.id}`, mySessionId);
            await supabase.from('profiles').update({ [deviceTypeKey]: mySessionId, last_active_at: new Date().toISOString() }).eq('id', user.id);
          }
        }
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const inviteToken = urlParams.get('invite');

        let targetCompanyId: string | null = null;
        let targetRole: Role = 'owner';
        let isInvitedUser = false;

        if (inviteToken) {
          const { data: invite } = await supabase
            .from('invites')
            .select('*')
            .eq('token', inviteToken)
            .eq('status', 'pending')
            .maybeSingle();

          if (invite) {
            targetCompanyId = invite.company_id;
            targetRole = (invite.role as Role) || 'employee';
            isInvitedUser = true;

            await supabase
              .from('invites')
              .update({
                status: 'used',
                used_by: user.id,
                used_at: new Date().toISOString()
              })
              .eq('id', invite.id);
          }
        }

        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);

        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Teammitglied';

        // 1. Profil ZUERST anlegen (erfüllt den Foreign Key companies_owner_id_fkey)
        const newProfile = {
          id: user.id,
          email: user.email || '',
          name: userName,
          role: targetRole,
          company_id: null,
          has_active_subscription: true,
          trial_ends_at: isInvitedUser ? null : trialEndDate.toISOString(),
          has_seen_tour: false
        };

        await supabase.from('profiles').upsert(newProfile);

        // 2. Organisation DANACH anlegen mit owner_id = user.id
        if (!isInvitedUser) {
          const { data: existingComp } = await supabase
            .from('companies')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();

          if (existingComp) {
            targetCompanyId = existingComp.id;
            await supabase.from('profiles').update({ company_id: targetCompanyId }).eq('id', user.id);
            newProfile.company_id = targetCompanyId;
          } else {
            const { data: newCompany } = await supabase
              .from('companies')
              .insert({
                name: `${user.email?.split('@')[0] || 'User'}'s Organization`,
                plan: 'Free Trial',
                max_seats: 1,
                used_seats: 1,
                owner_id: user.id
              })
              .select()
              .single();

            if (newCompany) {
              targetCompanyId = newCompany.id;
              await supabase.from('profiles').update({ company_id: targetCompanyId }).eq('id', user.id);
              newProfile.company_id = targetCompanyId;
            }
          }
        }

        const appUser: AppUser = {
          id: user.id,
          uid: user.id,
          email: user.email,
          name: userName,
          displayName: userName,
          photoURL: '',
          emailVerified: true,
          role: targetRole,
          companyId: targetCompanyId || undefined,
          hasActiveSubscription: true,
          trialEndsAt: newProfile.trial_ends_at || undefined,
          canViewFinance: true,
          canApproveBudget: true,
          hasSeenTour: false,
          hasCompletedOnboarding: false
        };

        setUserRole(targetRole);
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

    const mySessionId = localStorage.getItem(`kreativ_session_id_${deviceTypeKey}_${currentUser.id}`);
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
          alert(`⚠️ Sitzung Beendet: Dein Konto wurde auf einem zweiten ${deviceTypeName} angemeldet. Du kannst dich gleichzeitig auf 1 Laptop und 1 Smartphone/iPad anmelden, jedoch nicht auf zwei ${deviceTypeName}en gleichzeitig.`);
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
      localStorage.removeItem(`kreativ_session_id_active_desktop_session_id_${currentUser.id}`);
      localStorage.removeItem(`kreativ_session_id_active_mobile_session_id_${currentUser.id}`);
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
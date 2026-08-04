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

        const userName = profile.name || user.email?.split('@')[0] || 'User';

        const appUser: AppUser = {
          id: user.id,
          uid: user.id,
          email: user.email,
          name: userName,
          displayName: userName,
          photoURL: '',
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
      if (session?.user) {
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
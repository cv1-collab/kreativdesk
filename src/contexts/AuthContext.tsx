/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Role } from '../config/permissions';
import { checkIsSuperAdmin } from '../config/admins';
import { safeStorage } from '../utils/safeStorage';
import { syncCompanySeats } from '../services/userService';

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
  companyPlan?: string;
  companyName?: string;
  companyId?: string;
  company_id?: string;
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
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const logoutRef = useRef<() => Promise<void>>(null as any);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateUserProfile = async (user: User) => {
    try {
      // 1. Check if user is the OWNER of an existing organization in companies table
      const { data: ownedComp } = await supabase
        .from('companies')
        .select('id, name, plan, max_seats, used_seats, owner_id')
        .eq('owner_id', user.id)
        .maybeSingle();

      const isCompanyOwner = Boolean(ownedComp);

      // 2. Check for invite token across URL, user metadata, and persistent safeStorage
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
          .maybeSingle();

        if (inv) {
          const isGeneric = !inv.email || inv.email.startsWith('invite_') || inv.email.endsWith('@workspace.local');
          const emailMatches = user.email && inv.email && inv.email.toLowerCase() === user.email.toLowerCase();
          
          // CRITICAL: A company owner testing their own invite link must NEVER consume the invite!
          if (emailMatches || (isGeneric && inv.status === 'pending')) {
            if (inv.company_id !== ownedComp?.id) {
              pendingInvite = inv;
            }
          }
        }
      }

      let targetCompanyId: string | null = null;
      let targetRole: Role = 'owner';
      let targetPlan: string = 'Enterprise';
      let isInvitedUser = false;

      // Check fallback by user email ONLY if user is not already the owner of a company
      if (!isCompanyOwner) {
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

        // Check fallback in company_users by email (CRM contact created by company owner!)
        if (user.email) {
          const { data: cuRecords } = await supabase
            .from('company_users')
            .select('*')
            .ilike('email', user.email)
            .not('company_id', 'is', null)
            .order('created_at', { ascending: false });

          if (cuRecords && cuRecords.length > 0) {
            const matchedCu = cuRecords.find((cu: any) => cu.user_id === user.id) || cuRecords[0];
            if (matchedCu && matchedCu.company_id) {
              targetCompanyId = matchedCu.company_id;
              targetRole = (matchedCu.role as Role) || 'employee';
              isInvitedUser = true;
            }
          }
        }
      }

      if (pendingInvite && !isCompanyOwner) {
        targetCompanyId = pendingInvite.company_id;
        targetRole = (pendingInvite.role as Role) || 'employee';
        isInvitedUser = true;

        if (pendingInvite.status !== 'used') {
          await supabase
            .from('invites')
            .update({
              status: 'used',
              used_by: user.id,
              email: user.email || pendingInvite.email,
              used_at: new Date().toISOString()
            })
            .eq('id', pendingInvite.id);
        }

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
      let effectiveCompanyId = profile?.company_id || ownedComp?.id || null;
      let effectiveRole = (profile?.role as Role) || (isCompanyOwner ? 'owner' : 'employee');

      const isSuperUser = checkIsSuperAdmin(user.email) || profile?.role === 'super_admin';
      if (isSuperUser) {
        effectiveRole = 'super_admin';
        targetRole = 'super_admin';
      }

      // Check admin preview mode in sessionStorage for super admins
      const previewCompanyId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_preview_company_id') : null;
      const previewCompanyName = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_preview_company_name') : null;
      if (isSuperUser && previewCompanyId) {
        effectiveCompanyId = previewCompanyId;
      }

      // If user was invited and is NOT an owner, associate them with the inviting company
      if (isInvitedUser && targetCompanyId && !isCompanyOwner) {
        effectiveCompanyId = targetCompanyId;
        if (!isSuperUser) {
          effectiveRole = targetRole;
        }

        const { data: compPlanData } = await supabase
          .from('companies')
          .select('id, name, plan, used_seats')
          .eq('id', targetCompanyId)
          .maybeSingle();

        targetPlan = compPlanData?.plan || 'Enterprise';

        if (profile) {
          await supabase.from('profiles').update({ 
            company_id: targetCompanyId, 
            role: isSuperUser ? 'super_admin' : targetRole,
            plan: targetPlan
          }).eq('id', user.id);
        }

        // Add or update company_users record and migrate pre-assigned project_members
        try {
          const { data: existingCu } = await supabase
            .from('company_users')
            .select('*')
            .eq('company_id', targetCompanyId)
            .ilike('email', user.email)
            .maybeSingle();

          if (!existingCu) {
            await supabase.from('company_users').insert({
              id: user.id,
              user_id: user.id,
              company_id: targetCompanyId,
              name: userName,
              email: user.email || '',
              role: targetRole,
              status: 'team'
            });

            await syncCompanySeats(targetCompanyId);
          } else {
            await supabase
              .from('company_users')
              .update({
                user_id: user.id,
                status: 'team',
                name: userName || existingCu.name,
                role: targetRole || existingCu.role
              })
              .eq('id', existingCu.id);

            if (existingCu.id !== user.id) {
              await supabase
                .from('project_members')
                .update({ user_id: user.id })
                .eq('user_id', existingCu.id);
            }
            await syncCompanySeats(targetCompanyId);
          }
        } catch (cuErr) {
          console.warn("Could not sync company_users record:", cuErr);
        }
      }

      if (profile) {
        if (!effectiveCompanyId) {
          if (ownedComp) {
            effectiveCompanyId = ownedComp.id;
            await supabase.from('profiles').update({ company_id: effectiveCompanyId }).eq('id', user.id);
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

        // Load company record to inherit companyPlan & companyName
        let companyData = (ownedComp && ownedComp.id === effectiveCompanyId) ? ownedComp : null;
        if (effectiveCompanyId && !companyData) {
          const { data: comp } = await supabase
            .from('companies')
            .select('id, name, plan, max_seats, used_seats, owner_id')
            .eq('id', effectiveCompanyId)
            .maybeSingle();
          companyData = comp;
        }

        const resolvedCompanyPlan = companyData?.plan || 'Enterprise';
        const resolvedCompanyName = (isSuperUser && previewCompanyName) || companyData?.name || 'Workspace';

        // For owners: active company plan; for workspace members: inherit company plan!
        const userPlan = (effectiveRole === 'owner' || isSuperUser)
          ? (companyData?.plan || profile.plan || 'Free Trial')
          : (companyData?.plan || profile.plan || 'Enterprise');

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
          plan: userPlan,
          companyPlan: resolvedCompanyPlan,
          companyName: resolvedCompanyName,
          companyId: effectiveCompanyId || user.id,
          company_id: effectiveCompanyId || user.id,
          trialEndsAt: (effectiveRole === 'owner' && !isSuperUser) ? profile.trial_ends_at : undefined,
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

        if (!isInvitedUser && !effectiveCompanyId) {
          if (ownedComp) {
            effectiveCompanyId = ownedComp.id;
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
              .maybeSingle();

            if (newCompany) {
              effectiveCompanyId = newCompany.id;
            }
          }
        }

        let companyData = (ownedComp && ownedComp.id === effectiveCompanyId) ? ownedComp : null;
        if (effectiveCompanyId && !companyData) {
          const { data: comp } = await supabase
            .from('companies')
            .select('id, name, plan, max_seats, used_seats, owner_id')
            .eq('id', effectiveCompanyId)
            .maybeSingle();
          companyData = comp;
        }

        const resolvedCompanyPlan = companyData?.plan || 'Enterprise';
        const resolvedCompanyName = (isSuperUser && previewCompanyName) || companyData?.name || 'Workspace';
        const userPlan = isInvitedUser ? (targetPlan || resolvedCompanyPlan) : (resolvedCompanyPlan || 'Free Trial');

        const newProfile = {
          id: user.id,
          email: user.email || '',
          name: userName,
          role: isInvitedUser ? targetRole : (isSuperUser ? 'super_admin' : 'owner'),
          company_id: effectiveCompanyId,
          plan: userPlan,
          has_active_subscription: true,
          trial_ends_at: (isInvitedUser || isSuperUser) ? null : trialEndDate.toISOString(),
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
          role: newProfile.role as Role,
          companyId: effectiveCompanyId || user.id,
          company_id: effectiveCompanyId || user.id,
          hasActiveSubscription: true,
          plan: userPlan,
          companyPlan: resolvedCompanyPlan,
          companyName: resolvedCompanyName,
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
        if (_event === 'TOKEN_REFRESHED' && currentUserRef.current) {
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
          logoutRef.current?.();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  const updateCurrentUser = (updates: Partial<AppUser>) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates, company_id: updates.companyId || updates.company_id || prev.company_id || prev.companyId } : null);
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
  logoutRef.current = logout;

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading, logout, updateCurrentUser, refreshUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
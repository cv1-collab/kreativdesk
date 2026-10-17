/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Role } from '../config/permissions';
import { checkIsSuperAdmin } from '../config/admins';
import { safeStorage } from '../utils/safeStorage';
import { syncCompanySeats } from '../services/userService';
import { queryClient } from '../lib/queryClient';

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
  maxSeats?: number;
  trade?: string;
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
      const { data: ownedComps } = await supabase
        .from('companies')
        .select('id, name, plan, max_seats, used_seats, owner_id')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      let ownedComp = (ownedComps && ownedComps.length > 0) ? ownedComps[0] : null;
      let isCompanyOwner = Boolean(ownedComp);
      const isSuperUserCheck = checkIsSuperAdmin(user.email);

      // 2. Check for invite token across URL, user metadata, and persistent safeStorage
      const urlParams = new URLSearchParams(window.location.search);
      const urlInvite = urlParams.get('invite');
      const metaInvite = (user.user_metadata as any)?.inviteToken;
      const storedInvite = safeStorage.getString('pending_invite_token');
      const effectiveInviteToken = urlInvite || metaInvite || (storedInvite ? storedInvite : null);

      const EXTERNAL_INVITE_ROLES = ['guest', 'client', 'external', 'partner', 'subcontractor', 'field guest', 'external planner', 'bauherr', 'handwerker'];
      const canonicalizeRole = (raw?: string | null, forceExternal?: boolean): Role => {
        const r = String(raw || '').toLowerCase().trim();
        if (forceExternal || EXTERNAL_INVITE_ROLES.includes(r)) {
          return (r === 'client' || r === 'bauherr' || r === 'kunde') ? 'client' : 'guest';
        }
        if (r === 'super_admin' || r === 'superadmin') return 'super_admin';
        if (r === 'owner') return 'owner';
        if (r === 'admin' || r === 'management' || r === 'geschaeftsleitung' || r === 'geschäftsleitung') return ('admin' as Role);
        if (r === 'project_lead' || r === 'projektleiter') return ('project_lead' as Role);
        return 'employee';
      };

      let pendingInvite: any = null;
      if (effectiveInviteToken) {
        let { data: inv } = await supabase
          .from('invites')
          .select('*')
          .eq('token', effectiveInviteToken)
          .maybeSingle();

        if (!inv) {
          try {
            const { data: rpcRes } = await supabase.rpc('get_invite_details', { p_token: effectiveInviteToken });
            const rpcInv = Array.isArray(rpcRes) ? rpcRes[0] : rpcRes;
            if (rpcInv && rpcInv.company_id) {
              inv = { ...rpcInv, token: effectiveInviteToken };
            }
          } catch (_) {}
        }

        if (inv) {
          const isGeneric = !inv.email || inv.email.startsWith('invite_') || inv.email.endsWith('@workspace.local');
          const emailMatches = user.email && inv.email && inv.email.toLowerCase() === user.email.toLowerCase();
          const wasUsedByMe = inv.used_by === user.id;
          
          // CRITICAL: A company owner testing their own invite link must NEVER consume the invite!
          if (emailMatches || wasUsedByMe || (isGeneric && inv.status === 'pending')) {
            if (inv.company_id && inv.company_id !== ownedComp?.id) {
              pendingInvite = { ...inv, token: inv.token || effectiveInviteToken };
              if (!isSuperUserCheck) {
                isCompanyOwner = false;
                ownedComp = null;
              }
            }
          }
        }
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Fehler beim Laden des Profils:', error);
      }

      let targetCompanyId: string | null = null;
      let targetRole: Role = 'owner';
      let targetPlan: string = 'Enterprise';
      let isInvitedUser = false;

      const initialAutoTrialCompId = (
        ownedComp &&
        (!ownedComp.plan || String(ownedComp.plan).toLowerCase().includes('trial')) &&
        typeof ownedComp.name === 'string' &&
        (ownedComp.name.endsWith("'s Organization") || ownedComp.name.endsWith("'s Workspace") || ownedComp.name.endsWith("s Workspace"))
      ) ? ownedComp.id : null;
      const isAutoCreatedTrialComp = Boolean(initialAutoTrialCompId);

      // Check fallback by user email if user is not already assigned to a real company (or only has an auto-created trial company)
      if ((!isCompanyOwner || isAutoCreatedTrialComp) && !isSuperUserCheck && (!profile?.company_id || profile?.company_id === ownedComp?.id)) {
        if (!pendingInvite && user.email) {
          const { data: inv } = await supabase
            .from('invites')
            .select('*')
            .ilike('email', user.email)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (inv && inv.company_id && inv.company_id !== ownedComp?.id && (inv.status === 'pending' || inv.used_by === user.id)) {
            pendingInvite = inv;
            isCompanyOwner = false;
            ownedComp = null;
          }
        }

        // Check fallback in company_users by email (team member or external partner pre-created by company owner!)
        if (!pendingInvite && user.email) {
          const { data: cuRecords } = await supabase
            .from('company_users')
            .select('*')
            .ilike('email', user.email)
            .not('company_id', 'is', null)
            .order('created_at', { ascending: false });

          if (cuRecords && cuRecords.length > 0) {
            const matchedCu =
              cuRecords.find((cu: any) => cu.company_id !== ownedComp?.id && cu.user_id === user.id) ||
              cuRecords.find((cu: any) => cu.company_id !== ownedComp?.id) ||
              cuRecords[0];
            if (matchedCu && matchedCu.company_id && matchedCu.company_id !== ownedComp?.id) {
              // Ensure referenced company actually exists in database!
              const { data: validComp } = await supabase
                .from('companies')
                .select('id, plan')
                .eq('id', matchedCu.company_id)
                .maybeSingle();

              if (validComp) {
                targetCompanyId = validComp.id;
                targetPlan = validComp.plan || 'Enterprise';
                const cuIsExt = matchedCu.is_external === true || String(matchedCu.status || '').toLowerCase() === 'external' || EXTERNAL_INVITE_ROLES.includes(String(matchedCu.role || '').toLowerCase());
                targetRole = canonicalizeRole(matchedCu.role, cuIsExt);
                isInvitedUser = true;
                isCompanyOwner = false;
                ownedComp = null;
              }
            }
          }
        }
      }

      if (pendingInvite && !isCompanyOwner) {
        targetCompanyId = pendingInvite.company_id;
        const rawInvRole = String(pendingInvite.role || (user.user_metadata as any)?.role || 'employee').trim();
        const rawInvRoleLower = rawInvRole.toLowerCase();
        targetRole = canonicalizeRole(rawInvRole, EXTERNAL_INVITE_ROLES.includes(rawInvRoleLower));
        isInvitedUser = true;

        if (pendingInvite.token) {
          try {
            await supabase.rpc('accept_invite_by_token', {
              p_token: pendingInvite.token,
              p_user_id: user.id
            });
          } catch (_) {}
        }

        if (pendingInvite.id && pendingInvite.status !== 'used') {
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

      // SELF-HEALING: If not recognized as ownedComp by owner_id, check if user's profile is owner of a company, or accepted an owner invite
      if (!ownedComp && !isInvitedUser && profile?.company_id && (profile?.role === 'owner' || isSuperUserCheck)) {
        const { data: candidateComp } = await supabase
          .from('companies')
          .select('id, name, plan, max_seats, used_seats, owner_id')
          .eq('id', profile.company_id)
          .maybeSingle();

        if (candidateComp) {
          ownedComp = candidateComp;
          isCompanyOwner = true;
          // Self-heal owner_id in database if empty
          if (!candidateComp.owner_id) {
            await supabase.from('companies').update({ owner_id: user.id }).eq('id', candidateComp.id);
          }
        }
      }

      const rawName = profile?.name || (profile as any)?.full_name || (profile as any)?.display_name || user.user_metadata?.full_name;
      const userName = rawName || (user.email === 'cv1@gmx.ch' ? 'Carlo Vescio' : user.email?.split('@')[0] || 'User');
      let effectiveCompanyId = profile?.company_id || ownedComp?.id || null;
      let effectiveRole = canonicalizeRole(profile?.role || (isCompanyOwner ? 'owner' : 'employee'));

      const isSuperUser = checkIsSuperAdmin(user.email) || profile?.role === 'super_admin';
      if (isSuperUser) {
        effectiveRole = 'super_admin';
        targetRole = 'super_admin';
      }

      // Check admin preview mode in safeStorage.session for super admins
      const previewCompanyId = safeStorage.session.getString('admin_preview_company_id');
      const previewCompanyName = safeStorage.session.getString('admin_preview_company_name');
      if (isSuperUser && previewCompanyId) {
        effectiveCompanyId = previewCompanyId;
      }

      // If user was invited and is NOT an owner of another real company, associate them with the inviting company
      if (isInvitedUser && targetCompanyId && !isCompanyOwner) {
        effectiveCompanyId = targetCompanyId;
        if (!isSuperUser) {
          effectiveRole = targetRole;
        }

        if (initialAutoTrialCompId && initialAutoTrialCompId !== targetCompanyId) {
          try {
            await supabase.from('companies').update({ owner_id: null }).eq('id', initialAutoTrialCompId).eq('owner_id', user.id);
          } catch (_) {}
        }

        const isExternalInvite = EXTERNAL_INVITE_ROLES.includes(String(targetRole || '').toLowerCase());

        const { data: compPlanData } = await supabase
          .from('companies')
          .select('id, name, plan, used_seats, owner_id')
          .eq('id', targetCompanyId)
          .maybeSingle();

        targetPlan = compPlanData?.plan || 'Enterprise';

        if (profile) {
          await supabase.from('profiles').update({ 
            company_id: targetCompanyId, 
            role: isSuperUser ? 'super_admin' : targetRole,
            plan: targetPlan,
            has_active_subscription: true,
            trial_ends_at: null
          }).eq('id', user.id);
        }

        if (targetRole === 'owner' && compPlanData && !compPlanData.owner_id) {
          try {
            await supabase.from('companies').update({ owner_id: user.id }).eq('id', targetCompanyId);
          } catch (_) {}
        }

        // Add or update company_users record and migrate pre-assigned project_members
        try {
          const { data: existingCuRows } = await supabase
            .from('company_users')
            .select('*')
            .eq('company_id', targetCompanyId)
            .ilike('email', user.email)
            .limit(1);
          const existingCu = existingCuRows?.[0] || null;

          if (!existingCu) {
            const { data: idTaken } = await supabase
              .from('company_users')
              .select('id')
              .eq('id', user.id)
              .limit(1);
            const rowId = (idTaken && idTaken.length > 0) ? crypto.randomUUID() : user.id;

            await supabase.from('company_users').insert({
              id: rowId,
              user_id: user.id,
              company_id: targetCompanyId,
              name: userName,
              email: user.email || '',
              role: targetRole,
              is_external: isExternalInvite,
              status: isExternalInvite ? 'external' : 'team'
            });

            await syncCompanySeats(targetCompanyId);
          } else {
            const keepExternal = isExternalInvite || existingCu.is_external === true || (existingCu.status && existingCu.status !== 'team');
            await supabase
              .from('company_users')
              .update({
                user_id: user.id,
                is_external: keepExternal,
                status: keepExternal ? (existingCu.status && existingCu.status !== 'team' ? existingCu.status : 'external') : 'team',
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
            // Safety check: before creating a new company, check if an organization already exists for this owner
            const { data: existingOwned } = await supabase
              .from('companies')
              .select('id')
              .eq('owner_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1);

            if (existingOwned && existingOwned.length > 0) {
              effectiveCompanyId = existingOwned[0].id;
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

        const resolvedCompanyPlan = companyData?.plan || (isSuperUser ? 'Enterprise' : (profile.plan || 'Free Trial'));
        const resolvedCompanyName = (isSuperUser && previewCompanyName) || companyData?.name || 'Workspace';

        // For owners: active company plan; for workspace members: inherit company plan!
        const userPlan = (effectiveRole === 'owner' || isSuperUser)
          ? (companyData?.plan || profile.plan || (isSuperUser ? 'Enterprise' : 'Free Trial'))
          : (companyData?.plan || profile.plan || 'Pro');

        // Resolve user trade for contractors (from profile, company_users.trade, or company_users.notes)
        let userTrade = (profile as any)?.trade || '';
        if (!userTrade && effectiveCompanyId && user.email) {
          try {
            const { data: userCu } = await supabase
              .from('company_users')
              .select('*')
              .eq('company_id', effectiveCompanyId)
              .ilike('email', user.email)
              .maybeSingle();
            if (userCu) {
              userTrade = (userCu as any).trade || '';
              if (!userTrade && userCu.notes) {
                try {
                  const matchCrm = userCu.notes.match(/__CRM_META__:(.+)/);
                  if (matchCrm) {
                    const parsed = JSON.parse(matchCrm[1]);
                    if (parsed.trade) userTrade = parsed.trade;
                  }
                } catch (_) {}
                if (!userTrade) {
                  const matchG = userCu.notes.match(/Gewerk:\s*([^\n\r,]+)/i);
                  if (matchG) userTrade = matchG[1].trim();
                }
              }
            }
          } catch (_) {}
        }

        const companyHasPaidPlan = Boolean(resolvedCompanyPlan && !String(resolvedCompanyPlan).toLowerCase().includes('trial'));
        const isExternalRoleEffective = effectiveRole === 'guest' || effectiveRole === 'client';
        const isLeadershipRole = effectiveRole === 'owner' || effectiveRole === 'management' || isSuperUser;

        let resolvedTrialEndsAt: string | undefined = undefined;
        if (effectiveRole === 'owner' && !isSuperUser && !companyHasPaidPlan && !isInvitedUser) {
          if (profile.trial_ends_at) {
            resolvedTrialEndsAt = profile.trial_ends_at;
          } else {
            const baseCreated = (profile as any)?.created_at || user.created_at;
            const startMs = baseCreated ? new Date(baseCreated).getTime() : Date.now();
            const safeStartMs = Number.isFinite(startMs) ? startMs : Date.now();
            resolvedTrialEndsAt = new Date(safeStartMs + 30 * 24 * 60 * 60 * 1000).toISOString();
            try {
              await supabase
                .from('profiles')
                .update({ trial_ends_at: resolvedTrialEndsAt })
                .eq('id', user.id)
                .is('trial_ends_at', null);
            } catch (_) {}
          }
        }

        const resolvedTenantId = effectiveCompanyId || user.id;
        safeStorage.setItem('kd_active_company_id', resolvedTenantId);

        const appUser: AppUser = {
          id: user.id,
          uid: user.id,
          email: user.email,
          name: userName,
          displayName: userName,
          photoURL: (profile as any)?.avatar || (profile as any)?.photo_url || '',
          emailVerified: true,
          role: effectiveRole,
          hasActiveSubscription: isSuperUser || companyHasPaidPlan || (profile.has_active_subscription ?? true),
          stripeCustomerId: profile.stripe_customer_id,
          plan: userPlan,
          companyPlan: resolvedCompanyPlan,
          companyName: resolvedCompanyName,
          companyId: resolvedTenantId,
          company_id: resolvedTenantId,
          trialEndsAt: resolvedTrialEndsAt,
          canViewFinance: isExternalRoleEffective ? false : (profile.can_view_finance ?? true),
          canApproveBudget: isExternalRoleEffective ? false : (profile.can_approve_budget ?? isLeadershipRole),
          hasSeenTour: profile.has_seen_tour ?? false,
          hasCompletedOnboarding: profile.has_completed_onboarding ?? false,
          maxSeats: companyData?.max_seats ? Number(companyData.max_seats) : (isSuperUser ? 10 : 1),
          trade: userTrade || undefined
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
            await (supabase.from('profiles') as any).update({ [deviceTypeKey]: mySessionId, updated_at: new Date().toISOString() }).eq('id', user.id);
          } catch (_) {}
        } else {
          const currentRemoteSession = profile[deviceTypeKey];
          if (currentRemoteSession && currentRemoteSession !== mySessionId) {
            mySessionId = `sess_${deviceTypeKey}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            safeStorage.setItem(`kreativ_session_id_${deviceTypeKey}_${user.id}`, mySessionId);
            try {
              await (supabase.from('profiles') as any).update({ [deviceTypeKey]: mySessionId, updated_at: new Date().toISOString() }).eq('id', user.id);
            } catch (_) {}
          } else if (!currentRemoteSession) {
            try {
              await (supabase.from('profiles') as any).update({ [deviceTypeKey]: mySessionId, updated_at: new Date().toISOString() }).eq('id', user.id);
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
            // Safety check: check if user already owns an organization before creating a new one
            const { data: existingOwned } = await supabase
              .from('companies')
              .select('id')
              .eq('owner_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1);

            if (existingOwned && existingOwned.length > 0) {
              effectiveCompanyId = existingOwned[0].id;
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

        const resolvedCompanyPlan = companyData?.plan || (isSuperUser ? 'Enterprise' : 'Free Trial');
        const resolvedCompanyName = (isSuperUser && previewCompanyName) || companyData?.name || 'Workspace';
        const userPlan = isInvitedUser ? (targetPlan || resolvedCompanyPlan) : (resolvedCompanyPlan || 'Free Trial');
        const companyHasPaidPlan = Boolean(resolvedCompanyPlan && !String(resolvedCompanyPlan).toLowerCase().includes('trial'));

        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const deviceTypeKey = isMobileDevice ? 'active_mobile_session_id' : 'active_desktop_session_id';
        const initialSessionId = `sess_${deviceTypeKey}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        safeStorage.setItem(`kreativ_session_id_${deviceTypeKey}_${user.id}`, initialSessionId);

        const resolvedNewRole = isInvitedUser ? targetRole : (isSuperUser ? 'super_admin' : 'owner');
        const isExternalRoleNew = resolvedNewRole === 'guest' || resolvedNewRole === 'client';
        const isLeadershipRoleNew = resolvedNewRole === 'owner' || resolvedNewRole === 'management' || isSuperUser;

        const newProfile: any = {
          id: user.id,
          email: user.email || '',
          name: userName,
          role: resolvedNewRole,
          company_id: effectiveCompanyId,
          plan: userPlan,
          has_active_subscription: true,
          trial_ends_at: (isInvitedUser || isSuperUser || companyHasPaidPlan) ? null : trialEndDate.toISOString(),
          has_seen_tour: false,
          [deviceTypeKey]: initialSessionId
        };

        await (supabase.from('profiles') as any).upsert(newProfile);

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
          canViewFinance: !isExternalRoleNew,
          canApproveBudget: isLeadershipRoleNew,
          hasSeenTour: false,
          hasCompletedOnboarding: false,
          maxSeats: companyData?.max_seats ? Number(companyData.max_seats) : (isSuperUser ? 10 : 1)
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
        safeStorage.session.setItem('is_password_recovery', 'true');
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
        queryClient.clear();
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

    const mySessionId = safeStorage.getString(`kreativ_session_id_${deviceTypeKey}_${currentUser.id}`);
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
            safeStorage.session.setItem(
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

  // SESSION INACTIVITY TIMEOUT ENFORCEMENT
  useEffect(() => {
    const compId = currentUser?.companyId || currentUser?.company_id || currentUser?.id;
    const isDemo = currentUser?.id === 'demo-user-id' || compId === 'demo-company';
    if (!currentUser || !compId || isDemo) return;

    const getTimeoutMinutes = (): number => {
      const raw = safeStorage.getItem<any>(`company_profile_${compId}`, null);
      let parsed = raw;
      if (typeof raw === 'string') {
        try { parsed = JSON.parse(raw); } catch (_) {}
      }
      const val = Number(parsed?.sessionTimeout);
      return Number.isFinite(val) && val > 0 ? val : 0;
    };

    const timeoutMinutes = getTimeoutMinutes();
    if (timeoutMinutes <= 0) return;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    let lastActivity = Date.now();
    let lastThrottle = 0;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastThrottle > 5000) {
        lastActivity = now;
        lastThrottle = now;
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'touchstart'] as const;
    events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));

    const interval = setInterval(() => {
      const currentTimeoutMin = getTimeoutMinutes();
      const effectiveMs = currentTimeoutMin > 0 ? currentTimeoutMin * 60 * 1000 : timeoutMs;
      if (currentTimeoutMin > 0 && Date.now() - lastActivity >= effectiveMs) {
        logoutRef.current?.();
      }
    }, 30000);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleActivity));
      clearInterval(interval);
    };
  }, [currentUser?.id, currentUser?.companyId, currentUser?.company_id]);

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
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const deviceTypeKey = isMobileDevice ? 'active_mobile_session_id' : 'active_desktop_session_id';
      const localSessionId =
        safeStorage.getString(`kreativ_session_id_${deviceTypeKey}_${currentUser.id}`) ||
        localStorage.getItem('kreativ_device_session_id');
      safeStorage.removeItem(`kreativ_session_id_active_desktop_session_id_${currentUser.id}`);
      safeStorage.removeItem(`kreativ_session_id_active_mobile_session_id_${currentUser.id}`);
      safeStorage.removeItem('kreativ_device_session_id');
      try {
        if (localSessionId) {
          await (supabase.from('profiles') as any)
            .update({ [deviceTypeKey]: null })
            .eq('id', currentUser.id)
            .eq(deviceTypeKey, localSessionId);
        }
      } catch (_) {}
    }
    const tenantCacheKeys = [
      'kd_active_company_id',
      'bexio_api_token',
      'interactv_bexio_api_token',
      'bexio_qr_iban',
      'bexio_auto_sync',
      'bexio_integration_active',
      'interactv_bexio_sync_logs',
      'interactv_email_config',
      'interactv_webhook_url',
      'kreativdesk_company_settings',
      'kreativdesk_webhook_urls',
      'kreativdesk_smart_proposals_v1',
      'kreativdesk_offline_defects',
      'kreativdesk_offline_documents',
      'custom_accent_color',
      'whiteboard_draft',
      'lastSeenNotifs',
      'has_new_document',
      'last_created_doc_title'
    ];
    tenantCacheKeys.forEach(key => safeStorage.removeItem(key));
    try {
      const prefixesToPurge = [
        'kreativdesk_',
        'bexio_',
        'interactv_',
        'company_profile_',
        'crm_metadata_',
        'fin_state_',
        'kreativdesk_cad_cache_',
        'cad_state_',
        'pitch_deck_slides_',
        'pitch_deckSettings_',
        'pitch_deck_settings_',
        'finance_cache_',
        'sys_cfg_',
        'time_entries_cache_',
        'agenda_cache_',
        'schedule_cache_',
        'wb_draft_'
      ];
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && prefixesToPurge.some(p => k.startsWith(p))) {
          localStorage.removeItem(k);
        }
      }
    } catch (_) {}
    safeStorage.session.removeItem('admin_preview_company_id');
    safeStorage.session.removeItem('admin_preview_company_name');
    queryClient.clear();
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
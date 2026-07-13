/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; 
import { auth, db, isConfigured } from '../firebase';
import { Role } from '../config/permissions';

export interface AppUser extends User {
  name?: string;
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
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  loading: true,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const claimSyncAttempted = useRef(false);

  const syncCustomClaims = async (user: User, companyId: string) => {
    try {
      const token = await user.getIdToken();
      await fetch('/api/set-tenant-claim', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uid: user.uid, companyId })
      });
      await user.getIdToken(true); // Erzwingt den Refresh des Tokens
      console.log("Tenant Claims erfolgreich synchronisiert!");
    } catch (error) {
      console.error("Fehler beim Claim-Sync:", error);
    }
  };

  useEffect(() => {
    if (!isConfigured || !auth) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && db) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            let userData = docSnap.data() as AppUser;
            const tokenResult = await user.getIdTokenResult();
            
            // 🔥 DER ENTSCHEIDENDE FIX: 
            // Erkennt, wenn du die DB manuell änderst und zwingt das System zur Heilung!
            if (tokenResult.claims.companyId !== userData.companyId && userData.companyId) {
              if (!claimSyncAttempted.current) {
                claimSyncAttempted.current = true;
                console.log("Token Claim veraltet. Führe Auto-Heal aus...");
                await syncCustomClaims(user, userData.companyId);
              }
            }

            if (!userData.companyId) {
              const newCompanyId = `comp_${user.uid}`;
              await updateDoc(docRef, { companyId: newCompanyId });
              
              await setDoc(doc(db, 'companies', newCompanyId), {
                id: newCompanyId,
                name: `${user.email?.split('@')[0] || 'User'}'s Organization`,
                plan: 'Free Trial',
                maxSeats: 1,
                usedSeats: 1,
                ownerId: user.uid,
                createdAt: new Date().toISOString()
              });
              
              if (!claimSyncAttempted.current) {
                claimSyncAttempted.current = true;
                await syncCustomClaims(user, newCompanyId);
              }
              userData = { ...userData, companyId: newCompanyId };
            }

            setUserRole((userData.role as Role) || 'owner');
            setCurrentUser({ ...user, ...userData });
          } else {
            // === NEUER USER FLOW ===
            const urlParams = new URLSearchParams(window.location.search);
            const inviteToken = urlParams.get('invite');

            let targetCompanyId = `comp_${user.uid}`;
            let targetRole = 'owner';
            let isInvitedUser = false;

            if (inviteToken) {
              const inviteRef = doc(db, 'invites', inviteToken);
              const inviteSnap = await getDoc(inviteRef);

              if (inviteSnap.exists() && inviteSnap.data().status === 'pending') {
                targetCompanyId = inviteSnap.data().companyId;
                targetRole = 'employee';
                isInvitedUser = true;

                await updateDoc(inviteRef, {
                  status: 'used',
                  usedBy: user.uid,
                  usedAt: new Date().toISOString()
                });
              }
            }

            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 30);

            const newUserData: AppUser = {
              ...user,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'Teammitglied',
              role: targetRole as Role,
              companyId: targetCompanyId,
              hasActiveSubscription: true, 
              trialEndsAt: isInvitedUser ? undefined : trialEndDate.toISOString(),
              createdAt: new Date().toISOString(),
              hasSeenTour: false
            } as unknown as AppUser;
            
            await setDoc(docRef, newUserData);

            if (!isInvitedUser) {
              await setDoc(doc(db, 'companies', targetCompanyId), {
                id: targetCompanyId,
                name: `${user.email?.split('@')[0] || 'User'}'s Organization`,
                plan: 'Free Trial',
                maxSeats: 1,
                usedSeats: 1,
                ownerId: user.uid,
                createdAt: new Date().toISOString()
              });
            } else {
              const compRef = doc(db, 'companies', targetCompanyId);
              const compSnap = await getDoc(compRef);
              if (compSnap.exists()) {
                 await updateDoc(compRef, { usedSeats: (compSnap.data().usedSeats || 0) + 1 });
              }
            }

            if (!claimSyncAttempted.current) {
              claimSyncAttempted.current = true;
              await syncCustomClaims(user, targetCompanyId);
            }

            setUserRole(targetRole as Role);
            setCurrentUser({ ...user, ...newUserData });
          }
        } catch (err: any) {
          console.error("Auth Fetch Error:", err);
        }
      } else {
        setUserRole(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth!);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
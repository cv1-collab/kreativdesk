import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wenn kein User da ist, Ladebildschirm beenden
    if (!currentUser || !db) {
      setLoading(false);
      return;
    }

    // Stripe Check (ohne illegale Datenbank-Scans)
    const checkStripeRedirect = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
          const docRef = doc(db, 'users', currentUser.uid);
          await updateDoc(docRef, { hasActiveSubscription: true });
          navigate(location.pathname, { replace: true });
        }
      } catch (error) {
        console.error("Stripe redirect error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStripeRedirect();
  }, [currentUser, location.search, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-ai border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {children}
    </div>
  );
}
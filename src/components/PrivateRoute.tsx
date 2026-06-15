import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, LogOut } from 'lucide-react';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  // 1. Wenn gar kein User eingeloggt ist -> zum Login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Abfrage: Hat der User ein aktives Abo / Trial?
  if (currentUser.hasActiveSubscription === false) {
    
    // Ist es der FIRMEN-INHABER (Owner)?
    if (currentUser.role === 'owner') {
      // Verhindere Loop, falls er schon auf /pricing oder /settings ist
      if (location.pathname === '/pricing' || location.pathname.startsWith('/settings')) {
        return <>{children}</>;
      }
      // Ansonsten: Zwinge ihn zum Pricing
      return <Navigate to="/pricing" replace />;
    } 
    
    // Ist es ein MITARBEITER (Employee / Internal)? -> STATISCHER SCREEN, KEIN REDIRECT!
    else {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-text-primary p-6 text-center animate-in fade-in zoom-in-95">
          <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md">
            <AlertCircle size={48} className="text-red-500 mb-6" />
            <h2 className="text-xl font-bold mb-3">Abonnement abgelaufen</h2>
            <p className="text-sm text-text-muted mb-8 font-medium leading-relaxed">
              Das Abonnement deiner Organisation ist inaktiv oder die Testphase ist abgelaufen. 
              Bitte kontaktiere deinen Administrator, um den Zugang wieder freizuschalten.
            </p>
            <button 
              onClick={() => logout()} 
              className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
            >
              <LogOut size={18} /> Abmelden
            </button>
          </div>
        </div>
      );
    }
  }

  // 3. Abo ist aktiv -> Gewähre Zugriff auf die Route
  return <>{children}</>;
}
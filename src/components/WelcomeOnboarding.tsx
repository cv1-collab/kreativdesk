import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Check, Loader2, Sparkles } from 'lucide-react';

export default function WelcomeOnboarding({ currentUser, onComplete }: { currentUser: any, onComplete: () => void }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser?.photoURL || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (currentUser?.name && currentUser.name !== 'Neues Teammitglied') {
      setName(currentUser.name);
    }
    if (currentUser?.photoURL) setAvatarPreview(currentUser.photoURL);
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      let photoURL = currentUser?.photoURL;
      
      if (avatar) {
        // Gleiche Storage-Struktur wie in SettingsTab für User-Avatare
        const storageRef = ref(storage, `avatars/${currentUser.uid}_${Date.now()}`);
        await uploadBytes(storageRef, avatar);
        photoURL = await getDownloadURL(storageRef);
      }

      // currentUser.id referenziert oft die Doc ID in companyUsers
      // currentUser.uid ist die Auth-UID
      const userId = currentUser.id || currentUser.uid;
      
      const updates = {
        name,
        photoURL,
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString()
      };

      // 1. Update in companyUsers
      const companyUserDocRef = doc(db, 'companyUsers', userId); 
      try {
        await updateDoc(companyUserDocRef, updates);
      } catch(e) { console.log('companyUser update skipped (might not exist yet)') }
      
      // 2. Update in users (wichtig für den globalen AuthContext!)
      if (currentUser.uid) {
        const globalUserDocRef = doc(db, 'users', currentUser.uid);
        try {
          await updateDoc(globalUserDocRef, updates);
        } catch(e) { console.log('user update skipped') }
      }

      setStep(3); // Zeige Erfolgs-Screen kurz an
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden relative">
        <div className="h-2 bg-gradient-to-r from-accent-ai to-emerald-500 w-full" />
        
        {step === 1 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-accent-ai/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-accent-ai" size={32} />
            </div>
            <h2 className="text-2xl font-black text-text-primary mb-2">Willkommen im Team!</h2>
            <p className="text-text-muted mb-8 leading-relaxed">
              Wir freuen uns, dass du da bist. Bevor du startest, richte kurz dein Profil ein, damit deine Kollegen dich sofort erkennen.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-accent-ai text-white font-bold rounded-xl shadow-lg hover:bg-accent-ai/90 transition-all active:scale-95"
            >
              Profil einrichten
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-8">
            <h3 className="text-xl font-bold text-text-primary mb-6 text-center">Dein Profil</h3>
            
            <div className="flex flex-col items-center mb-8 relative">
              <div className="w-24 h-24 rounded-full border-4 border-background shadow-xl overflow-hidden bg-background relative group">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                    <Camera size={32} />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                  <Camera size={24} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <p className="text-xs text-text-muted mt-3">Klicke auf das Bild, um ein Foto hochzuladen</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Vor- und Nachname</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent-ai outline-none transition-all shadow-inner font-medium"
                  placeholder="Max Mustermann"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !name.trim()}
              className="w-full py-3.5 bg-text-primary text-background font-bold rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Speichern & Loslegen'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <Check className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-black text-text-primary">Profil gespeichert!</h2>
            <p className="text-text-muted mt-2">Dein Workspace wird geladen...</p>
          </div>
        )}
      </div>
    </div>
  );
}

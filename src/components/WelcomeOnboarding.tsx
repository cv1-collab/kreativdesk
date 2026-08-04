import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Check, Loader2, Sparkles } from 'lucide-react';
import { useTour } from '../contexts/TourContext';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeOnboarding({ currentUser, onComplete }: { currentUser: any, onComplete: () => void }) {
  const { stopTour } = useTour();
  const { updateCurrentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser?.photoURL || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    stopTour();
    
    if (currentUser?.name && currentUser.name !== 'Neues Teammitglied') {
      setName(currentUser.name);
    }
    if (currentUser?.photoURL) setAvatarPreview(currentUser.photoURL);
  }, [currentUser, stopTour]);

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
      const userId = currentUser?.id || currentUser?.uid;
      
      if (avatar && userId) {
        const fileExt = avatar.name.split('.').pop();
        const filePath = `avatars/${userId}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar, { upsert: true });
          
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          photoURL = urlData.publicUrl;
        }
      }

      if (userId) {
        await supabase
          .from('profiles')
          .update({
            name,
            photo_url: photoURL,
            has_completed_onboarding: true
          })
          .eq('id', userId);
        updateCurrentUser({ name, photoURL, hasCompletedOnboarding: true });
        localStorage.setItem(`onboarding_completed_${userId}`, 'true');
      }

      setStep(3);
      setTimeout(() => {
        onComplete();
      }, 800);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-6 text-center">
          {step === 1 && (
            <div>
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-black text-text-primary mb-2">Willkommen im Team!</h2>
              <p className="text-text-muted text-sm mb-6">
                Wir freuen uns, dass du da bist. Bevor du startest, richte kurz dein Profil ein, damit deine Kollegen dich sofort erkennen.
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
              >
                Profil einrichten
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="text-center">
                <h3 className="text-xl font-bold text-text-primary mb-1">Dein Profil</h3>
                <p className="text-text-muted text-xs">Lade ein Foto hoch und überprüfe deinen Namen.</p>
              </div>

              <div className="flex flex-col items-center justify-center gap-3">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-2 border-border overflow-hidden bg-surface-hover flex items-center justify-center text-text-muted">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold">{name.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
                    <Camera size={16} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                  Vollständiger Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Anna Muster"
                  className="w-full px-4 py-2.5 bg-surface-hover border border-border rounded-xl text-text-primary focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Speichere...</span>
                  </>
                ) : (
                  <span>Profil speichern & Starten</span>
                )}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="py-8">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 animate-bounce">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Alles bereit!</h3>
              <p className="text-text-muted text-sm">Dein Profil wurde erfolgreich eingerichtet. Viel Spaß mit Kreativ Desk!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

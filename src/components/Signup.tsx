import React, { useState } from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { demoTemplates } from '../utils/demoTemplates';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    create_workspace: 'Create your Workspace', start_journey: 'Start your journey with Kreativ-Desk OS',
    select_industry: 'Select your industry', ind_construction: 'Construction & Site Management',
    ind_interior: 'Interior & Spatial Design', ind_agency: 'Agency (Branding & Events)',
    ind_tour: 'Music & Tour Management', ind_museum: 'Museum & Exhibitions', ind_gastro: 'Gastronomy & Pop-Up',
    email: 'Email Address', email_placeholder: 'Enter your email', password: 'Password',
    password_placeholder: 'Create a password', confirm_password: 'Confirm Password',
    confirm_password_placeholder: 'Confirm your password', create_account: 'Create Account',
    already_have_account: 'Already have an account?', sign_in: 'Sign in', or_continue: 'Or continue with',
    google: 'Google', password_mismatch: 'Passwords do not match', signup_error: 'Failed to create an account.',
    google_error: 'Failed to sign up with Google.', firebase_error: 'Firebase is not configured.',
    agree_terms: 'I agree to the', terms_of_service: 'Terms of Service', and: 'and', privacy_policy: 'Privacy Policy'
  },
  de: {
    create_workspace: 'Erstelle deinen Workspace', start_journey: 'Starte deine Reise mit Kreativ-Desk OS',
    select_industry: 'Wähle deine Branche', ind_construction: 'Bauunternehmen & Bauleitung',
    ind_interior: 'Innenarchitektur & Spatial Design', ind_agency: 'Agentur (Branding & Events)',
    ind_tour: 'Musik & Tour-Management', ind_museum: 'Museum & Ausstellungen', ind_gastro: 'Gastronomie & Pop-Up',
    email: 'E-Mail Adresse', email_placeholder: 'E-Mail eingeben', password: 'Passwort',
    password_placeholder: 'Passwort erstellen', confirm_password: 'Passwort bestätigen',
    confirm_password_placeholder: 'Passwort erneut eingeben', create_account: 'Account erstellen',
    already_have_account: 'Bereits einen Account?', sign_in: 'Anmelden', or_continue: 'Oder fortfahren mit',
    google: 'Google', password_mismatch: 'Passwörter stimmen nicht überein', signup_error: 'Fehler beim Erstellen des Accounts.',
    google_error: 'Fehler bei der Google-Registrierung.', firebase_error: 'Firebase ist nicht konfiguriert.',
    agree_terms: 'Ich akzeptiere die', terms_of_service: 'AGB', and: 'und', privacy_policy: 'Datenschutzerklärung (AVV)'
  }
};

export default function Signup() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [industry, setIndustry] = useState('construction');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  // 🔥 NEU: State für die AGB-Checkbox
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  if (currentUser) return <Navigate to="/app" />;

  const processInvite = async (uid: string, userEmail: string | null, token: string) => {
    try {
      const inviteRef = doc(db, 'invites', token);
      const inviteSnap = await getDoc(inviteRef);
      if (inviteSnap.exists() && inviteSnap.data().status === 'pending') {
        const inviteData = inviteSnap.data();
        const companyId = inviteData.companyId;

        // Create user doc
        const now = new Date().toISOString();
        await setDoc(doc(db, 'users', uid), {
          email: userEmail, createdAt: now, role: 'Internal', companyId: companyId,
          hasActiveSubscription: true, hasSeenTour: false 
        });

        // Add to company members (if there's a companyUsers collection or similar, or just update seats)
        const companyRef = doc(db, 'companies', companyId);
        await updateDoc(companyRef, {
          usedSeats: increment(1)
        });

        // Mark invite as accepted
        await updateDoc(inviteRef, {
          status: 'accepted',
          acceptedBy: uid,
          acceptedAt: now
        });

        return companyId;
      }
    } catch (e) {
      console.error('Error processing invite:', e);
    }
    return null;
  };

  const generateOnboardingData = async (uid: string, userEmail: string | null, selectedInd: string) => {
    const newCompanyId = `comp_${uid}`;
    const newProjectId = `proj_${Date.now()}`;
    const now = new Date().toISOString();
    const trialEndDate = new Date((new Date()).getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const tpl = demoTemplates[selectedInd] || demoTemplates.construction;
    
    await setDoc(doc(db, 'users', uid), {
      email: userEmail, createdAt: now, role: 'owner', companyId: newCompanyId,
      hasActiveSubscription: true, plan: 'Expert Trial', trialEndsAt: trialEndDate.toISOString(), hasSeenTour: false 
    });

    await setDoc(doc(db, 'companies', newCompanyId), {
      id: newCompanyId, name: `${userEmail?.split('@')[0] || 'User'}s Workspace`, plan: 'Expert Trial',
      maxSeats: 1, usedSeats: 1, ownerId: uid, trialEndsAt: trialEndDate.toISOString(), createdAt: now
    });

    await setDoc(doc(db, 'projects', newProjectId), {
      id: newProjectId, name: tpl.project.name, description: tpl.project.description,
      companyId: newCompanyId, ownerId: uid, status: 'active', createdAt: now, memberIds: [uid],
      siteLocation: tpl.project.siteLocation,
      cam1Url: tpl.camera?.url || ''
    });

    await setDoc(doc(db, 'projectMembers', `pm-${newProjectId}-${uid}`), {
      companyId: newCompanyId, projectId: newProjectId, userId: uid, role: 'Projektleitung', joinedAt: now
    });

    // 1. Finance Data
    if (tpl.financeGroups) {
      await setDoc(doc(db, 'financeData', `finance_${newProjectId}`), {
        projectId: newProjectId, companyId: newCompanyId, activeVersionId: 'v1',
        versions: [{
          id: 'v1', name: 'Startbudget', createdAt: now, status: 'approved',
          groups: tpl.financeGroups.map((g: any, gIdx: number) => ({
            id: `g_${gIdx}`, pos: g.pos, title: g.title,
            items: g.items.map((i: any, iIdx: number) => ({
              id: `item_${gIdx}_${iIdx}`, pos: i.pos, title: i.title, description: i.description || '',
              unit: i.unit || 'Pausch.', qty: i.qty || 1, unitPrice: i.unitPrice || 0,
              type: i.type || 'cost',
              total: (i.qty || 1) * (i.unitPrice || 0)
            }))
          }))
        }]
      });
    } else {
      // Fallback
      await setDoc(doc(db, 'financeData', `finance_${newProjectId}`), {
        projectId: newProjectId, companyId: newCompanyId, activeVersionId: 'v1',
        versions: [{
          id: 'v1', name: 'Startbudget', createdAt: now, status: 'approved',
          groups: [{ id: 'g1', pos: '100', title: 'Projektbudget', items: [] }]
        }]
      });
    }

    // 2. Schedule Data (Calendar)
    if (tpl.tasks || tpl.smartMarkers) {
      await setDoc(doc(db, 'schedules', `schedule_${newProjectId}`), {
        projectId: newProjectId, companyId: newCompanyId, ownerId: uid,
        name: 'Initialer Projektplan', createdAt: now, isPublic: false,
        tasks: (tpl.tasks || []).map((t: any) => {
          const start = new Date(Date.now() + (t.daysOffsetStart || 0) * 86400000).toISOString().split('T')[0];
          const end = new Date(Date.now() + (t.daysOffsetEnd || 0) * 86400000).toISOString().split('T')[0];
          return { id: t.id, title: t.title, startDate: start, endDate: end, progress: t.progress || 0, status: t.status || 'Geplant', color: t.color };
        }),
        smartMarkers: (tpl.smartMarkers || []).map((m: any) => {
          const date = new Date(Date.now() + (m.daysOffset || 0) * 86400000).toISOString().split('T')[0];
          return { id: m.id, date: date, label: m.title, color: m.color };
        })
      });
    }

    // 3. Pitch Deck Slides
    if (tpl.pitchDeck && tpl.pitchDeck.slides) {
      for (const slide of tpl.pitchDeck.slides) {
        await setDoc(doc(db, 'slides', `slide_${newProjectId}_${slide.id}`), {
          title: slide.title, content: slide.content || '', 
          projectId: newProjectId, companyId: newCompanyId, ownerId: uid, 
          layout: slide.layout || 'split', order_index: slide.order_index || 0, 
          imageUrl: slide.imageUrl || '',
          fontSize: slide.fontSize || 36, createdAt: now
        });
      }
    }

    // 4. Defects
    if (tpl.defects) {
      for (let i = 0; i < tpl.defects.length; i++) {
        const d = tpl.defects[i];
        await setDoc(doc(db, 'defects', `defect_${newProjectId}_${i}`), {
          title: d.title, description: d.description || '', projectId: newProjectId, companyId: newCompanyId, reporterId: uid,
          priority: d.priority || 'Mittel', status: d.status || 'Offen', trade: d.trade || '', location: d.location || '',
          imageUrl: d.imageUrl || '', createdAt: now
        });
      }
    }

    await setDoc(doc(db, 'documents', `doc_${Date.now()}`), {
      companyId: newCompanyId, projectId: newProjectId, name: 'Projekt-Übersicht.pdf', category: 'plans', 
      url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop', 
      type: 'application/pdf', size: '2.4 MB', isFolder: false, ownerId: uid, createdAt: now
    });

    await setDoc(doc(db, 'whiteboards', newProjectId), {
      companyId: newCompanyId, projectId: newProjectId, elements: '[]', createdAt: now
    });
  };

  // 🔥 NEU: Zentrale Funktion, um den Welcome Webhook anzufunken
  const triggerWelcomeWebhook = async (email: string | null, uid: string) => {
    if (!email) return;
    try {
      const name = email.split('@')[0];
      await fetch('/api/send-welcome-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, uid })
      });
    } catch (err) {
      console.error("Welcome Webhook Fehler:", err);
    }
  };

  async function handleGoogleSignUp() {
    if (!auth || !db) return setError(t('firebase_error'));
    if (!agreedToTerms) return setError('Bitte akzeptiere die AGB und Datenschutzrichtlinien.'); // Validation
    
    try {
      setError(''); setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      let userDocSnap;
      try { userDocSnap = await getDoc(userDocRef); } catch (err) { throw err; }

      if (!userDocSnap.exists()) {
        let assignedCompanyId = `comp_${userCredential.user.uid}`;
        if (inviteToken) {
          const inviteCompanyId = await processInvite(userCredential.user.uid, userCredential.user.email, inviteToken);
          if (inviteCompanyId) {
            assignedCompanyId = inviteCompanyId;
          } else {
            await generateOnboardingData(userCredential.user.uid, userCredential.user.email, industry);
          }
        } else {
          await generateOnboardingData(userCredential.user.uid, userCredential.user.email, industry);
        }
        
        // 🔥 TRIGGER FÜR DEN WEBHOOK BEI GOOGLE SIGNUP
        await triggerWelcomeWebhook(userCredential.user.email, userCredential.user.uid);

        try {
          const token = await userCredential.user.getIdToken();
          await fetch('/api/set-tenant-claim', {
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ uid: userCredential.user.uid, companyId: assignedCompanyId })
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
          await userCredential.user.getIdToken(true);
        } catch (e) {}
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await userCredential.user.getIdToken(true);
      }
      navigate('/app');
    } catch (error) { setError(t('google_error')); } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth || !db) return setError(t('firebase_error'));
    if (password !== passwordConfirm) return setError(t('password_mismatch'));
    if (!agreedToTerms) return setError('Bitte akzeptiere die AGB und Datenschutzrichtlinien.'); // Validation

    try {
      setError(''); setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      let assignedCompanyId = `comp_${userCredential.user.uid}`;
      if (inviteToken) {
        const inviteCompanyId = await processInvite(userCredential.user.uid, userCredential.user.email, inviteToken);
        if (inviteCompanyId) {
          assignedCompanyId = inviteCompanyId;
        } else {
          await generateOnboardingData(userCredential.user.uid, userCredential.user.email, industry);
        }
      } else {
        await generateOnboardingData(userCredential.user.uid, userCredential.user.email, industry);
      }
      
      // 🔥 TRIGGER FÜR DEN WEBHOOK BEI EMAIL SIGNUP
      await triggerWelcomeWebhook(userCredential.user.email, userCredential.user.uid);

      try {
        const token = await userCredential.user.getIdToken();
        await fetch('/api/set-tenant-claim', {
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ uid: userCredential.user.uid, companyId: assignedCompanyId })
        });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await userCredential.user.getIdToken(true);
      } catch (e) {}
      
      navigate('/app');
    } catch (error: any) { setError(t('signup_error')); } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen bg-[#09090b] selection:bg-blue-500/30">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Layers size={24} />
            </div>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-[#fafafa]">{t('create_workspace')}</h2>
            <p className="mt-2 text-sm text-[#a1a1aa]">{t('start_journey')}</p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20"><div className="text-sm text-red-400">{error}</div></div>}

              <div>
                <label className="block text-sm font-medium leading-6 text-[#fafafa] mb-1.5">{t('select_industry')}</label>
                <select
                  value={industry} onChange={(e) => setIndustry(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-[#18181b] py-3 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all cursor-pointer"
                >
                  <option value="construction">🏗️ {t('ind_construction')}</option>
                  <option value="interior">🛋️ {t('ind_interior')}</option>
                  <option value="agency">📣 {t('ind_agency')}</option>
                  <option value="tour">🎸 {t('ind_tour')}</option>
                  <option value="museum">🖼️ {t('ind_museum')}</option>
                  <option value="gastro">🍽️ {t('ind_gastro')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[#fafafa] mb-1.5">{t('email')}</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-xl border-0 bg-[#18181b] py-2.5 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] placeholder:text-[#52525b] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all" placeholder={t('email_placeholder')} />
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[#fafafa] mb-1.5">{t('password')}</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-xl border-0 bg-[#18181b] py-2.5 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] placeholder:text-[#52525b] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all" placeholder={t('password_placeholder')} />
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[#fafafa] mb-1.5">{t('confirm_password')}</label>
                <input type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="block w-full rounded-xl border-0 bg-[#18181b] py-2.5 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] placeholder:text-[#52525b] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all" placeholder={t('confirm_password_placeholder')} />
              </div>

              {/* 🔥 NEU: Die zwingende AGB & DSGVO Checkbox */}
              <div className="flex items-start gap-3 mt-4">
                <div className="flex h-6 items-center">
                  <input
                    id="terms" name="terms" type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-[#27272a] bg-[#18181b] text-blue-600 focus:ring-blue-600 focus:ring-offset-[#09090b]"
                  />
                </div>
                <div className="text-xs leading-5">
                  <label htmlFor="terms" className="text-[#a1a1aa]">
                    {t('agree_terms')} <a href="#" className="font-medium text-blue-400 hover:underline">{t('terms_of_service')}</a> {t('and')} <a href="#" className="font-medium text-blue-400 hover:underline">{t('privacy_policy')}</a>.
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading || !agreedToTerms} className="flex w-full justify-center mt-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all">
                {t('create_account')}
              </button>
            </form>

            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#27272a]" /></div>
                <div className="relative flex justify-center text-sm font-medium"><span className="bg-[#09090b] px-6 text-[#71717a]">{t('or_continue')}</span></div>
              </div>

              <div className="mt-6">
                <button onClick={handleGoogleSignUp} disabled={loading || !agreedToTerms} className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-[#18181b] border border-[#27272a] px-3 py-2.5 text-sm font-medium text-[#fafafa] hover:bg-[#27272a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H4.18v2.84C5.62 19.5 8.56 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.56 1 5.62 4.5 4.18 7.85l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  {t('google')}
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-[#a1a1aa]">{t('already_have_account')} <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">{t('sign_in')}</Link></p>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-multiply" />
        <img className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
      </div>
    </div>
  );
}
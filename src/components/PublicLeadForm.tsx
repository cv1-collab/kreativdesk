import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { CheckCircle2, Building2, User, Mail, Phone, MessageSquare, Send, Loader2, Camera, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, doc, deleteDoc } from 'firebase/firestore';
import { callGeminiAPI } from '../utils/geminiClient';

// === LOKALE ÜBERSETZUNGEN ===
const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    submit_error: 'Failed to submit inquiry. Please try again later.',
    thank_you: 'Thank You!',
    lead_submitted_success: 'Your information has been successfully submitted. We will get back to you shortly.',
    contact_us: 'Enterprise Setup Request',
    fill_out_form: 'Please fill out the form below and we will get in touch to discuss your specific infrastructure needs.',
    first_name: 'First Name',
    first_name_placeholder: 'John',
    last_name: 'Last Name',
    last_name_placeholder: 'Doe',
    company: 'Company',
    company_placeholder: 'Acme Corp',
    email: 'Email',
    phone: 'Phone',
    message: 'Message / Project Scope',
    how_can_we_help: 'Please briefly describe your project volume and requirements...',
    submit: 'Request Setup',
    submitting: 'Submitting...',
    take_photo: 'Scan Business Card',
    analyzing: 'Analyzing card...',
    scan_success: 'Data extracted successfully!',
    scan_error: 'Could not read card data. Please fill in manually.',
    show_qr: 'Show QR Code',
    scan_with_phone: 'Use smartphone to scan',
    qr_desc: 'Scan this code with your phone. The form will autofill magically.',
    cancel: 'Cancel'
  },
  de: {
    submit_error: 'Fehler beim Senden der Anfrage. Bitte versuche es später erneut.',
    thank_you: 'Vielen Dank!',
    lead_submitted_success: 'Deine Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze bei dir für die nächsten Schritte.',
    contact_us: 'Enterprise Setup anfragen',
    fill_out_form: 'Bitte fülle das Formular aus. Wir melden uns zeitnah, um deine individuelle Infrastruktur zu besprechen.',
    first_name: 'Vorname',
    first_name_placeholder: 'Max',
    last_name: 'Nachname',
    last_name_placeholder: 'Mustermann',
    company: 'Firma',
    company_placeholder: 'Muster GmbH',
    email: 'E-Mail',
    phone: 'Telefon',
    message: 'Nachricht / Projektumfang',
    how_can_we_help: 'Beschreibe kurz dein Projektvolumen und deine Anforderungen...',
    submit: 'Setup anfragen',
    submitting: 'Wird gesendet...',
    take_photo: 'Visitenkarte scannen',
    analyzing: 'Analysiere Karte...',
    scan_success: 'Daten erfolgreich extrahiert!',
    scan_error: 'Fehler beim Lesen der Karte. Bitte manuell eintragen.',
    show_qr: 'QR-Code anzeigen',
    scan_with_phone: 'Mit Smartphone scannen',
    qr_desc: 'Scanne diesen Code mit der Handy-Kamera. Das Formular füllt sich danach von selbst aus.',
    cancel: 'Abbrechen'
  }
};

export default function PublicLeadForm() {
  const { companyId } = useParams<{ companyId: string }>();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Responsive State (Desktop vs Mobile)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobileOrTablet = windowWidth < 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cross-Device Session Logic
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [showQR, setShowQR] = useState(false);
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/vcard/${sessionId}`;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });

  // Listener für Smartphone-Daten
  useEffect(() => {
    if (!db || !sessionId || isMobileOrTablet) return;
    
    const q = query(collection(db, 'temp_receipts'), where('sessionId', '==', sessionId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.contactData) {
            const cd = data.contactData;
            
            setFormData(prev => ({
              ...prev,
              firstName: cd.firstName || prev.firstName,
              lastName: cd.lastName || prev.lastName,
              company: cd.company || prev.company,
              email: cd.email || prev.email,
              phone: cd.phone || prev.phone
            }));
            
            setSuccessMsg(t('scan_success'));
            setShowQR(false); 
          }
          deleteDoc(doc(db, 'temp_receipts', change.doc.id)).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [sessionId, isMobileOrTablet, t]);

  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const [isScanningCard, setIsScanningCard] = useState(false);

  const handleMobileCardScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningCard(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const prompt = `Analysiere diese Visitenkarte. Extrahiere die Daten als striktes JSON Objekt mit exakt diesen Keys: "firstName" (Vorname), "lastName" (Nachname), "company" (Firma), "email", "phone" (Telefon). Antworte NUR mit dem JSON-Code ohne Markdown-Formatierung.`;
        
        const response = await callGeminiAPI('gemini-2.5-flash', [
          { inlineData: { data: base64Data, mimeType: file.type } },
          { text: prompt }
        ]);
        
        let text = response.text || "{}";
        text = text.replace(/`{3}json/g, '').replace(/`{3}/g, '').trim();
        
        try {
          const data = JSON.parse(text);
          
          setFormData(prev => ({
            ...prev,
            firstName: data.firstName || prev.firstName,
            lastName: data.lastName || prev.lastName,
            company: data.company || prev.company,
            email: data.email || prev.email,
            phone: data.phone || prev.phone
          }));
          setSuccessMsg(t('scan_success'));
        } catch (jsonErr) {
          setError(t('scan_error'));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError(t('scan_error'));
    } finally {
      setIsScanningCard(false);
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        companyId: companyId || 'kreativ-desk-website',
        source: 'Landingpage B2B Request',
        status: 'New',
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting lead:', err);
      setError(t('submit_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">
            {t('thank_you')}
          </h2>
          <p className="text-text-muted font-medium leading-relaxed">
            {t('lead_submitted_success')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/10 blur-[120px] rounded-full z-0 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg font-black text-2xl">
            K
          </div>
        </div>
        <h2 className="text-center text-3xl md:text-4xl font-black tracking-tight text-text-primary mb-4">
          {t('contact_us')}
        </h2>
        <p className="text-center text-text-muted mb-10 font-medium">
          {t('fill_out_form')}
        </p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface/80 backdrop-blur-xl border border-border p-8 shadow-2xl rounded-3xl"
        >
          <div className="mb-8">
            {isMobileOrTablet ? (
              <>
                <button 
                  type="button"
                  onClick={() => mobileFileInputRef.current?.click()} 
                  disabled={isScanningCard} 
                  className="w-full py-4 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 border border-brand-500/30 rounded-xl font-bold flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all"
                >
                  {isScanningCard ? <Loader2 className="animate-spin" size={20}/> : <Camera size={20}/>}
                  {isScanningCard ? t('analyzing') : t('take_photo')}
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={mobileFileInputRef} 
                  onChange={handleMobileCardScan} 
                  className="hidden" 
                />
              </>
            ) : (
              <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
                {!showQR ? (
                  <>
                    <div className="w-12 h-12 bg-brand-500/10 rounded-full flex items-center justify-center mb-3">
                      <QrCode className="text-brand-500" size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-text-primary mb-1">{t('take_photo')}</h3>
                    <p className="text-xs text-text-muted mb-5 leading-relaxed max-w-[250px]">
                      {t('scan_with_phone')}
                    </p>
                    <button 
                      type="button"
                      onClick={() => setShowQR(true)}
                      className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                    >
                      {t('show_qr')}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                      <h3 className="text-sm font-bold text-brand-500">Live Scan aktiv</h3>
                    </div>
                    <p className="text-xs text-text-muted mb-5 max-w-[250px] leading-relaxed">
                      {t('qr_desc')}
                    </p>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-border">
                      <QRCode value={mobileUploadUrl} size={140} />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowQR(false)}
                      className="mt-5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {successMsg && <p className="text-emerald-500 text-xs font-bold text-center mt-4 bg-emerald-500/10 py-2 rounded-lg">{successMsg}</p>}
          </div>

          <div className="flex items-center gap-4 mb-8">
             <div className="h-px bg-border flex-1"></div>
             <span className="text-xs font-bold text-text-muted uppercase tracking-widest">oder manuell</span>
             <div className="h-px bg-border flex-1"></div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-text-primary">
                  {t('first_name')}
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="block w-full pl-11 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all"
                    placeholder={t('first_name_placeholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-text-primary">
                  {t('last_name')}
                </label>
                <div className="mt-2 relative">
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="block w-full px-4 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all"
                    placeholder={t('last_name_placeholder')}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-bold text-text-primary">
                {t('company')}
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type="text"
                  name="company"
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="block w-full pl-11 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all"
                  placeholder={t('company_placeholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-text-primary">
                {t('email')}
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-11 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all"
                  placeholder="name@firma.ch"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-text-primary">
                {t('phone')}
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="block w-full pl-11 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all"
                  placeholder="+41 00 000 00 00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-bold text-text-primary">
                {t('message')}
              </label>
              <div className="mt-2 relative">
                <div className="absolute top-4 left-4 flex items-start pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-text-muted" />
                </div>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="block w-full pl-11 bg-background border border-border rounded-xl py-4 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all custom-scrollbar"
                  placeholder={t('how_can_we_help')}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isScanningCard}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-brand-500/20 text-base font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                {isSubmitting ? t('submitting') : t('submit')}
              </button>
              {error && (
                <p className="text-red-500 text-sm font-bold text-center mt-4">{error}</p>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Users, UserPlus, Link, Copy, ShieldCheck, 
  AlertTriangle, CheckCircle2, Loader2, CreditCard, ChevronRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    title: 'Company Settings',
    license_overview: 'License Overview',
    seats_used: 'Seats occupied',
    seats_limit_info: 'You have used {used} of {max} licenses.',
    invite_member: 'Invite Team Member',
    invite_desc: 'Send this unique link to a colleague. They will be automatically added to your organization.',
    generate_link: 'Generate Invite Link',
    limit_reached: 'Seat limit reached!',
    limit_reached_desc: 'All purchased licenses are occupied. Please upgrade your plan to add more members.',
    upgrade_btn: 'Upgrade Plan',
    active_invites: 'Pending Invitations',
    copy_success: 'Link copied to clipboard!',
    error_limit: 'Cannot generate link. Limit reached.'
  },
  de: {
    title: 'Unternehmenseinstellungen',
    license_overview: 'Lizenzübersicht',
    seats_used: 'Belegte Plätze',
    seats_limit_info: 'Du nutzt aktuell {used} von {max} Lizenzen.',
    invite_member: 'Teammitglied einladen',
    invite_desc: 'Sende diesen Link an einen Kollegen. Er wird automatisch deinem Unternehmen zugeordnet.',
    generate_link: 'Einladungslink erstellen',
    limit_reached: 'Lizenzlimit erreicht!',
    limit_reached_desc: 'Alle gekauften Plätze sind belegt. Erweitere dein Abo, um weitere Mitglieder hinzuzufügen.',
    upgrade_btn: 'Abo erweitern',
    active_invites: 'Offene Einladungen',
    copy_success: 'Link in die Zwischenablage kopiert!',
    error_limit: 'Link konnte nicht erstellt werden. Limit erreicht.'
  }
};

export default function CompanySettings() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [company, setCompany] = useState<any>(null);
  const [memberCount, setMemberCount] = useState(1);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.companyId) return;
    const fetchCompany = async () => {
      try {
        const { data } = await supabase
          .from('companies')
          .select('*')
          .eq('id', currentUser.companyId)
          .single();

        if (data) setCompany(data);

        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('company_id', currentUser.companyId);

        if (count !== null) setMemberCount(count);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompany();
  }, [currentUser]);

  const maxSeats = company?.max_seats || company?.maxSeats || 5;

  const handleGenerateLink = () => {
    if (memberCount >= maxSeats) {
      addToast(t('error_limit'), 'error');
      return;
    }
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/signup?invite=${token}&companyId=${currentUser?.companyId}`;
    setInviteLink(link);
    navigator.clipboard.writeText(link);
    addToast(t('copy_success'), 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <h3 className="text-xl font-black text-text-primary mb-2 flex items-center gap-2">
          <Building2 className="text-blue-500" size={24} />
          {t('title')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-background border border-border/50 p-5 rounded-2xl">
            <div className="text-xs font-bold text-text-muted uppercase mb-1">{t('license_overview')}</div>
            <div className="text-2xl font-black text-text-primary">{memberCount} / {maxSeats}</div>
            <div className="text-xs text-text-muted mt-1">{t('seats_used')}</div>
          </div>

          <div className="bg-background border border-border/50 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-text-muted uppercase mb-1">{t('invite_member')}</div>
              <p className="text-xs text-text-muted">{t('invite_desc')}</p>
            </div>
            <button 
              onClick={handleGenerateLink}
              className="mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={16} /> {t('generate_link')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
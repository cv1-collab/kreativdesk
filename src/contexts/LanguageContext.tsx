/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeStorage } from '../utils/safeStorage';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = safeStorage.getItem('language');
    return (saved as Language) || 'de';
  });

  useEffect(() => {
    safeStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'de' ? 'en' : 'de');
  };

  // Globaler Fallback-Wortschatz für Standard-Aktionen, Statusmeldungen und Toasts
  const commonFallbacks: Record<Language, Record<string, string>> = {
    de: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      close: 'Schliessen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      loading: 'Laden...',
      completed: 'Abgeschlossen',
      success: 'Erfolgreich',
      error: 'Fehler',
      pdf_saved: 'PDF erfolgreich gespeichert',
      pdf_exported: 'PDF erfolgreich exportiert',
      upload_success: 'Erfolgreich hochgeladen',
      upload_failed: 'Upload fehlgeschlagen',
      status_updated: 'Status erfolgreich aktualisiert',
      saved_cloud: 'In der Cloud gespeichert',
      invoice_saved: 'Rechnung erfolgreich gespeichert',
      quote_saved: 'Offerte erfolgreich gespeichert',
      receipt_booked_success: 'Beleg erfolgreich verbucht',
      hours_booked_success: 'Stunden erfolgreich erfasst',
      save_error: 'Fehler beim Speichern',
      new_project: 'Neues Projekt',
      create_folder: 'Ordner erstellen',
      folder_name: 'Ordnername',
      date: 'Datum',
      system_access_role: 'System-Zugriffsrolle',
      take_photo: 'Foto aufnehmen',
      footer_details: 'Fusszeilen-Details',
      footer_info: 'IBAN, MWST-Nr., Handelsregister...',
      logo_uploaded: 'Logo hochgeladen',
      remaining: 'Verbleibend',
      cost: 'Kosten',
      status: 'Status',
      actions: 'Aktionen',
      confirm: 'Bestätigen',
      back: 'Zurück',
      next: 'Weiter',
      download: 'Herunterladen',
      search: 'Suchen...',
      overview: 'Übersicht',
      details: 'Details',
      warning: 'Warnung',
      info: 'Information'
    },
    en: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      loading: 'Loading...',
      completed: 'Completed',
      success: 'Success',
      error: 'Error',
      pdf_saved: 'PDF successfully saved',
      pdf_exported: 'PDF successfully exported',
      upload_success: 'Uploaded successfully',
      upload_failed: 'Upload failed',
      status_updated: 'Status successfully updated',
      saved_cloud: 'Saved to cloud',
      invoice_saved: 'Invoice successfully saved',
      quote_saved: 'Quote successfully saved',
      receipt_booked_success: 'Receipt successfully booked',
      hours_booked_success: 'Hours successfully logged',
      save_error: 'Error saving changes',
      new_project: 'New Project',
      create_folder: 'Create Folder',
      folder_name: 'Folder Name',
      date: 'Date',
      system_access_role: 'System Access Role',
      take_photo: 'Take Photo',
      footer_details: 'Footer Details',
      footer_info: 'IBAN, VAT No., Company Registry...',
      logo_uploaded: 'Logo uploaded',
      remaining: 'Remaining',
      cost: 'Cost',
      status: 'Status',
      actions: 'Actions',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      download: 'Download',
      search: 'Search...',
      overview: 'Overview',
      details: 'Details',
      warning: 'Warning',
      info: 'Information'
    }
  };

  // Fungiert als verlässlicher globaler Fallback für alle Komponenten
  const t = (key: string): string => {
    return commonFallbacks[language]?.[key] || commonFallbacks['de']?.[key] || key; 
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
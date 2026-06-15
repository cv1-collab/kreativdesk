import React, { useState, useEffect, useRef } from 'react';
import { Users, FileText, Search, Plus, Sparkles, Download, X, Loader2, Building, Mail, Phone, FileSignature, ChevronRight, FileOutput, Upload, BookOpen, Trash2, AlertCircle, UserPlus } from 'lucide-react';
import { cn } from '../utils';
import { callGeminiAPI, callGeminiEmbedAPI } from '../utils/geminiClient';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext'; // <-- NEU
import { printElementToPdf } from '../utils/pdfHelper';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

function cosineSimilarity(a: number[], b: number[]) {
  let dotProduct = 0; let normA = 0; let normB = 0;
  for (let i = 0; i < a.length; i++) { dotProduct += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i]; }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface Contact { id: string; name: string; role: string; company: string; email: string; phone: string; ownerId?: string; companyId?: string; }
interface Document { id: string; title: string; type: string; date: string; category: string; summary: string; ownerId?: string; content?: string; embedding?: number[]; companyId?: string; }

export default function CRM() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage(); // <-- NEU
  
  const [activeTab, setActiveTab] = useState<'contacts' | 'documents'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({ name: '', role: '', company: '', email: '', phone: '' });

  // === MULTI-TENANT FILTERUNG FÜR CRM ===
  useEffect(() => {
    if (!currentUser || !currentUser.companyId || !db) return;
    
    // Nur Kontakte der eigenen Firma
    const qContacts = query(collection(db, 'contacts'), where('companyId', '==', currentUser.companyId));
    const unsubContacts = onSnapshot(qContacts, (snap) => setContacts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contact))), (error) => handleFirestoreError(error, OperationType.LIST, 'contacts'));

    // Nur Smart-Dokumente der eigenen Firma
    const qDocs = query(collection(db, 'smartDocuments'), where('companyId', '==', currentUser.companyId));
    const unsubDocs = onSnapshot(qDocs, (snap) => setDocuments(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Document))), (error) => handleFirestoreError(error, OperationType.LIST, 'smartDocuments'));

    return () => { unsubContacts(); unsubDocs(); };
  }, [currentUser]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.companyId || !db) return;
    try {
      const newId = `contact-${Date.now()}`;
      await setDoc(doc(db, 'contacts', newId), { 
        ...newContact, 
        id: newId, 
        ownerId: currentUser.uid,
        companyId: currentUser.companyId // Mandanten-Zuweisung
      });
      setIsModalOpen(false);
      setNewContact({ name: '', role: '', company: '', email: '', phone: '' });
      addToast(t('upload_success'), 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contacts');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!db || !window.confirm('Bist du sicher?')) return;
    try { await deleteDoc(doc(db, 'contacts', id)); addToast(t('delete') + ' ' + t('completed'), 'success'); } 
    catch (error) { handleFirestoreError(error, OperationType.DELETE, 'contacts'); }
  };

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 flex-1 flex flex-col min-h-0 bg-background text-text-primary p-2 md:p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('crm_docs')}</h1>
          <p className="text-text-muted text-sm mt-1">{t('crm_docs_desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-border rounded-lg p-1">
            <button onClick={() => setActiveTab('contacts')} className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2", activeTab === 'contacts' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary")}>
              <Users size={16} /> {t('contacts')}
            </button>
            <button onClick={() => setActiveTab('documents')} className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2", activeTab === 'documents' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary")}>
              <FileText size={16} /> {t('documents')}
            </button>
          </div>
          {activeTab === 'contacts' ? (
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-accent-ai text-white rounded-md text-sm font-medium hover:bg-accent-ai/90 transition-colors shadow-lg shadow-accent-ai/20 flex items-center gap-2">
              <Plus size={16} /> {t('add_contact')}
            </button>
          ) : null}
        </div>
      </header>

      {activeTab === 'contacts' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative mb-6 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder={t('search_contacts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent-ai/50 transition-colors text-text-primary placeholder-text-muted"
            />
          </div>

          <div className="flex-1 overflow-auto bg-surface border border-border rounded-xl shadow-lg custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('name')}</th>
                  <th className="px-6 py-4 font-semibold">{t('company')}</th>
                  <th className="px-6 py-4 font-semibold">{t('role')}</th>
                  <th className="px-6 py-4 font-semibold">{t('email')}</th>
                  <th className="px-6 py-4 text-right font-semibold">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-background transition-colors group">
                    <td className="px-6 py-4 font-medium text-text-primary">{contact.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building size={14} className="text-text-muted" />
                        <span className="text-text-primary">{contact.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{contact.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-text-muted">
                        <span className="flex items-center gap-1.5 hover:text-accent-ai cursor-pointer transition-colors"><Mail size={14} /> {contact.email}</span>
                        <span className="flex items-center gap-1.5 hover:text-accent-ai cursor-pointer transition-colors"><Phone size={14} /> {contact.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteContact(contact.id)} className="text-text-muted hover:text-red-500 p-2 rounded-md hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredContacts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-muted font-medium">
                      {t('no_contacts_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <UserPlus size={18} className="text-accent-ai" /> {t('add_contact')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleAddContact} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('name')}</label>
                <input 
                  type="text" 
                  required
                  value={newContact.name}
                  onChange={e => setNewContact({...newContact, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-ai/50 text-text-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('role')}</label>
                  <input 
                    type="text" 
                    required
                    value={newContact.role}
                    onChange={e => setNewContact({...newContact, role: e.target.value})}
                    className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-ai/50 text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('company')}</label>
                  <input 
                    type="text" 
                    required
                    value={newContact.company}
                    onChange={e => setNewContact({...newContact, company: e.target.value})}
                    className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-ai/50 text-text-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('email')}</label>
                  <input 
                    type="email" 
                    required
                    value={newContact.email}
                    onChange={e => setNewContact({...newContact, email: e.target.value})}
                    className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-ai/50 text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('phone')}</label>
                  <input 
                    type="text" 
                    value={newContact.phone}
                    onChange={e => setNewContact({...newContact, phone: e.target.value})}
                    className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-ai/50 text-text-primary"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-transparent hover:border-border rounded-md text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-accent-ai text-white rounded-md text-sm font-medium hover:bg-accent-ai/90 transition-colors shadow-lg shadow-accent-ai/20"
                >
                  {t('save_contact')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
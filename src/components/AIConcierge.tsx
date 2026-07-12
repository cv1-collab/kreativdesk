import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Minimize2, Loader2, AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAI } from '../contexts/AIContext';
import { useProject } from '../contexts/ProjectContext';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, and, or } from 'firebase/firestore';
import { callGeminiAPI, callGeminiChatAPI } from '../utils/geminiClient';
import { useLanguage } from '../contexts/LanguageContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    ai_greeting: 'Hello! I am your Kreativ-Desk AI. How can I assist you today?',
    ai_placeholder: 'Ask me anything or type a prompt...',
    ai_error_quota: 'Rate limit reached. Please wait a moment and try again.',
    ai_error_general: 'A connection error occurred. Please try again.',
    ask_ai: 'Ask AI',
    ai_concierge: 'AI Concierge',
    online_syncing: 'Online & Syncing'
  },
  de: {
    ai_greeting: 'Hallo! Ich bin deine Kreativ-Desk KI. Wie kann ich dir heute helfen?',
    ai_placeholder: 'Frag mich etwas oder gib einen Prompt ein...',
    ai_error_quota: 'Limit erreicht. Bitte warte einen Moment und versuche es erneut.',
    ai_error_general: 'Ein Verbindungsfehler ist aufgetreten. Bitte versuche es erneut.',
    ask_ai: 'KI fragen',
    ai_concierge: 'KI Concierge',
    online_syncing: 'Online & Synchronisiert'
  }
};

export default function AIConcierge() {
  const { currentUser } = useAuth();
  const { warnings } = useAI();
  const { activeProjectId } = useProject() as any;
  const { language, t: globalT } = useLanguage();
  const location = useLocation();

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ id: 1, role: 'ai', text: t('ai_greeting') }]);
  const [isTyping, setIsTyping] = useState(false);
  const [projectContext, setProjectContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const constraintsRef = useRef(null);
  
  // Drag persistence
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hasLoadedPos, setHasLoadedPos] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('kreativ_ai_pos');
    if (saved) {
      try { setPos(JSON.parse(saved)); } catch (e) { console.error('Failed to parse saved pos', e); }
    }
    setHasLoadedPos(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const safeCompanyId = currentUser?.companyId || `comp_${currentUser?.uid}`;
    if (isOpen && currentUser && !projectContext && db && safeCompanyId) {
      const fetchContext = async () => {
        try {
          const txQuery = query(collection(db, 'transactions'), where('companyId', '==', safeCompanyId));
          const eventsQuery = query(
            collection(db, 'calendarEvents'),
            and(
              where('companyId', '==', safeCompanyId),
              or(
                where('visibility', 'in', ['public', 'company']),
                where('ownerId', '==', currentUser?.uid || '')
              )
            )
          );
          const defectsQuery = query(collection(db, 'defects'), where('companyId', '==', safeCompanyId));
          
          const [txSnap, eventsSnap, defectsSnap] = await Promise.all([
            getDocs(txQuery), getDocs(eventsQuery), getDocs(defectsQuery)
          ]);
          
          const transactions = txSnap.docs.map(d => d.data());
          const events = eventsSnap.docs.map(d => d.data());
          const defects = defectsSnap.docs.map(d => d.data());
          
          const totalSpent = transactions.filter((t: any) => t.amount < 0).reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
          const criticalDefects = defects.filter((d: any) => d.priority === 'Critical').length;
          
          setProjectContext({ transactions, events, defects, totalSpent, criticalDefects });
        } catch (error) {
          console.error("Failed to fetch AI context", error);
        }
      };
      fetchContext();
    }
  }, [isOpen, currentUser, projectContext, db]);

  useEffect(() => {
    const handleOpenAI = () => setIsOpen(true);
    window.addEventListener('open-ai-concierge', handleOpenAI);
    return () => window.removeEventListener('open-ai-concierge', handleOpenAI);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userMessage = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const chatContext = {
        language: currentLang,
        projectData: projectContext
      };
      
      const config = {
        systemInstruction: {
          role: 'system',
          parts: [{ text: `Du bist der Kreativ Desk AI Concierge. Du hilfst dem Nutzer. 
Kontext-Daten: ${JSON.stringify(chatContext)}

WICHTIG: Wenn der Nutzer dich bittet, eine Aufgabe, einen Mangel oder ein Ticket zu erstellen, ANTWORTE ZUSÄTZLICH MIT EINEM JSON-BLOCK in exakt diesem Format am Ende deiner Antwort:
\`\`\`json
{
  "action": "CREATE_TASK",
  "title": "Kurzer Titel",
  "description": "Ausführliche Beschreibung"
}
\`\`\`` }]
        }
      };

      // Format previous messages for Gemini
      const formattedHistory = messages.slice(-5).map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      
      const response = await callGeminiChatAPI('gemini-2.5-flash', userMessage.text, formattedHistory, config);
      let aiText = response.text;

      // Extract JSON if present for Task Creation
      const jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.action === 'CREATE_TASK') {
            if (activeProjectId) {
              await addDoc(collection(db, 'defects'), {
                title: parsed.title,
                description: parsed.description,
                projectId: activeProjectId,
                companyId: currentUser?.companyId || 'global',
                ownerId: currentUser?.uid || 'unknown',
                status: 'open',
                priority: 'Medium',
                createdAt: new Date().toISOString()
              });
              aiText = aiText.replace(jsonMatch[0], '').trim();
              if (!aiText) aiText = "Aufgabe wurde erfolgreich im aktuellen Projekt erstellt!";
            } else {
              aiText += '\n\n*(Hinweis: Ich konnte die Aufgabe nicht speichern, da aktuell kein Projekt geöffnet ist.)*';
            }
          }
        } catch (e) {
          console.error('JSON parse error from AI:', e);
        }
      }
      
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', text: aiText }]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = error instanceof Error && error.message.includes('429') 
        ? t('ai_error_quota') 
        : t('ai_error_general');
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        role: 'ai', 
        text: errorMessage,
        isError: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50" />
      <AnimatePresence>
        {!isOpen && hasLoadedPos && (
          <motion.button 
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false} 
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, info) => {
              setTimeout(() => setIsDragging(false), 100);
              const newX = pos.x + info.offset.x;
              const newY = pos.y + info.offset.y;
              setPos({ x: newX, y: newY });
              localStorage.setItem('kreativ_ai_pos', JSON.stringify({ x: newX, y: newY }));
            }}
            initial={{ scale: 0, opacity: 0, x: pos.x, y: pos.y }} 
            animate={{ scale: 1, opacity: 1, x: pos.x, y: pos.y }} 
            exit={{ scale: 0, opacity: 0, x: pos.x, y: pos.y }}
            whileHover={!isDragging ? { scale: 1.05 } : {}}
            whileTap={!isDragging ? { scale: 0.95 } : {}}
            whileDrag={{ scale: 1.1, cursor: "grabbing" }} 
            onClick={(e) => {
              if (isDragging) {
                e.preventDefault();
                return;
              }
              setIsOpen(true);
            }} 
            onMouseEnter={() => !isDragging && setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
            className="fixed bottom-6 right-6 p-4 bg-accent-ai text-white rounded-full shadow-2xl hover:bg-accent-ai/90 transition-colors flex items-center justify-center cursor-grab border-2 border-white/20 pointer-events-auto"
            style={{ zIndex: 9999 }}
          >
            <Sparkles className="w-6 h-6" />
            <AnimatePresence>
              {isHovered && !isDragging && (
                <motion.span initial={{ width: 0, opacity: 0, marginRight: 0 }} animate={{ width: 'auto', opacity: 1, marginRight: 12 }} exit={{ width: 0, opacity: 0, marginRight: 0 }} className="font-bold text-sm whitespace-nowrap overflow-hidden">
                  {t('ask_ai')}
                </motion.span>
              )}
            </AnimatePresence>
            {warnings.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} transition={{ type: "spring", bounce: 0.4, duration: 0.6 }} className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-background/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-ai/10 border border-accent-ai/20 flex items-center justify-center relative shadow-inner">
                  <Sparkles className="w-5 h-5 text-accent-ai" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary leading-tight">{t('ai_concierge')}</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{t('online_syncing')}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-full transition-colors"><Minimize2 className="w-4 h-4" /></button>
            </div>

            {warnings.length > 0 && (
              <div className="bg-red-500/10 border-b border-red-500/20 p-3 max-h-32 overflow-y-auto">
                <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle size={12}/> {warnings.length} Active System Alerts</h4>
                <div className="space-y-2">
                  {warnings.map(warn => (
                    <div key={warn.id} className="text-xs text-red-400 bg-background/50 p-2 rounded border border-red-500/10">
                      <strong>{warn.module}:</strong> {warn.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                  {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-accent-ai/10 border border-accent-ai/20 text-accent-ai flex items-center justify-center shrink-0 mr-3 shadow-sm"><Bot className="w-4 h-4" /></div>}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-accent-ai text-white rounded-tr-none' : 'bg-surface border border-border/50 text-text-primary rounded-tl-none'}`}>
                    {msg.text.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i !== msg.text.split('\n').length - 1 && <br />}</React.Fragment>)}
                  </div>
                  {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-surface border border-border/50 text-text-muted flex items-center justify-center shrink-0 ml-3 shadow-sm"><User className="w-4 h-4" /></div>}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-accent-ai/10 border border-accent-ai/20 text-accent-ai flex items-center justify-center shrink-0 mr-3 shadow-sm"><Bot className="w-4 h-4" /></div>
                  <div className="px-4 py-3 rounded-2xl bg-surface border border-border/50 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border/50 bg-background/50">
              <form onSubmit={handleSend} className="relative">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('ai_placeholder')} className="w-full bg-surface border border-border/50 rounded-xl pl-4 pr-12 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-ai/50 focus:ring-1 focus:ring-accent-ai/50 transition-all font-medium shadow-sm" />
                <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-ai text-white rounded-lg hover:bg-accent-ai/90 disabled:opacity-50 disabled:hover:bg-accent-ai transition-colors shadow-sm">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
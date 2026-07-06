import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Video, Mic, MicOff, MonitorUp, PhoneOff, MessageSquare, Send, Sparkles,
  Paperclip, Loader2, PenTool, FileText, ChevronRight, FileCheck, X, Trash2, Eraser, Phone, Calendar, Clock, Monitor, Users, Copy, CheckCircle2, PhoneCall, PhoneForwarded, MonitorOff, Link as LinkIcon, VideoOff, Captions
} from 'lucide-react';
import { cn } from '../utils';
import { callGeminiAPI, callGeminiEmbedAPI } from '../utils/geminiClient';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { checkStorageLimit, incrementStorage } from '../utils/storageGuard';
import { collection, query, orderBy, onSnapshot, serverTimestamp, Timestamp, setDoc, doc, where, getDocs, getDoc, addDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useVideoCall } from '../contexts/VideoCallContext';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';

// === LOKALE ÜBERSETZUNGEN ===
const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    meet_chat_title: 'Meet & Chat', meet_chat_desc: 'Live video collaboration and project chat.', live_collaboration: 'Live Collaboration',
    weekly_coordination: 'Weekly Coordination & Planning', schedule_call: 'Schedule Call', leave_call: 'Leave Call', join_call: 'Join Call',
    video: 'Video', whiteboard: 'Whiteboard', ready_to_join: 'Ready to join?', join_weekly_meeting: 'Start an instant meeting or join an upcoming call.',
    project_chat: 'Project Chat', ai_summary: 'AI Summary', type_message: 'Type your message...', schedule_video_call: 'Schedule Video Call',
    meeting_title: 'Meeting Title', date: 'Date', time: 'Time', description: 'Description', cancel: 'Cancel', schedule: 'Schedule',
    upcoming_calls: 'Upcoming Calls', no_upcoming_calls: 'No upcoming calls.', join_now: 'Join Now', mobile_blocked_title: 'Desktop Only Feature',
    mobile_blocked_desc: 'Video calls and live collaboration are only available on desktop devices to ensure a stable connection.',
    who_to_call: 'Who do you want to call? (Optional)', start_call: 'Start Project Call', start_rundruf: 'Start Group Call', 
    call_selected: 'Call selected people', invite_participants: 'Invite Participants', external_link: 'External Invite Link'
  },
  de: {
    meet_chat_title: 'Meet & Chat', meet_chat_desc: 'Live-Video-Kollaboration und Projekt-Chat.', live_collaboration: 'Live Kollaboration',
    weekly_coordination: 'Wöchentliche Koordination & Planung', schedule_call: 'Call planen', leave_call: 'Call verlassen', join_call: 'Call beitreten',
    video: 'Video', whiteboard: 'Whiteboard', ready_to_join: 'Bereit zur Teilnahme?', join_weekly_meeting: 'Starte ein Meeting oder nimm an einem geplanten Call teil.',
    project_chat: 'Projekt Chat', ai_summary: 'KI Zusammenfassung', type_message: 'Nachricht schreiben...', schedule_video_call: 'Video Call planen',
    meeting_title: 'Meeting Titel', date: 'Datum', time: 'Zeit', description: 'Beschreibung', cancel: 'Abbrechen', schedule: 'Planen',
    upcoming_calls: 'Bevorstehende Video Calls', no_upcoming_calls: 'Keine geplanten Calls vorhanden.', join_now: 'Teilnehmen', mobile_blocked_title: 'Nur auf Desktop verfügbar',
    mobile_blocked_desc: 'Video-Calls und das Live-Whiteboard sind auf Smartphones deaktiviert, um Verbindungsabbrüche zu verhindern.',
    who_to_call: 'Wen möchtest du anrufen? (Optional)', start_call: 'Projekt-Call starten', start_rundruf: 'Projekt-Rundruf starten', 
    call_selected: 'Person(en) anrufen', invite_participants: 'Teilnehmer einladen', external_link: 'Link für externe Partner'
  }
};

interface ChatMessage { id: string; sender: string; avatar: string; time: string; text: string; isAI?: boolean; isTranscript?: boolean; reference?: string; createdAt?: Timestamp; }

export default function MeetChat() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const { activeProjectId, setActiveProject, projectMembers, companyUsers } = useProject();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const { 
    localStream, remoteStream, screenStream, isMicOn, isCamOn, isScreenSharing,
    callStatus, callId, joinCallId, setJoinCallId, startCall, joinCall, hangUp,
    toggleMic, toggleCam, toggleScreenShare, setIsMinimized, isInCall, setIsChatOpen
  } = useVideoCall();
  
  const [activeView, setActiveView] = useState<'video' | 'whiteboard'>('video');
  const [showChat, setShowChat] = useState(() => window.innerWidth >= 1024);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<any[]>([]); 
  const [newMessage, setNewMessage] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newCallEvent, setNewCallEvent] = useState({ title: '', date: '', time: '10:00', type: 'call', description: '', participants: [] as string[] });
  const [generatedMeetingId, setGeneratedMeetingId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const [copied, setCopied] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const hasAutoJoined = useRef(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainVideoRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const isTranscribingRef = useRef(isTranscribing);

  useEffect(() => { isTranscribingRef.current = isTranscribing; }, [isTranscribing]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = currentLang === 'de' ? 'de-CH' : 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalStr = event.results[i][0].transcript.trim();
          if (finalStr && (callId || joinCallId) && currentUser?.companyId && db) {
             addDoc(collection(db, `videoCalls/${callId || joinCallId}/chatMessages`), {
                sender: currentUser.displayName || 'Teilnehmer',
                text: finalStr,
                isTranscript: true,
                timestamp: serverTimestamp(),
                projectId: projectId || activeProjectId || 'global',
                companyId: currentUser.companyId
             }).catch(console.error);
          }
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setCurrentTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') setIsTranscribing(false);
    };
    
    recognition.onend = () => {
      if (isTranscribingRef.current) {
         try { recognition.start(); } catch(e){}
      }
    };

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [callId, joinCallId, currentUser, activeProjectId, projectId, currentLang]);

  const toggleTranscription = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
       addToast("Dein Browser unterstützt keine Live-Transkription (Chrome, Safari oder Edge empfohlen).", "error");
       return;
    }
    if (isTranscribing) {
       setIsTranscribing(false);
       if (recognitionRef.current) recognitionRef.current.stop();
       setCurrentTranscript('');
       addToast("Live-Transkription deaktiviert", "info");
    } else {
       setIsTranscribing(true);
       if (recognitionRef.current) {
          try { recognitionRef.current.start(); addToast("Live-Transkription gestartet", "success"); } catch(e){}
       }
    }
  };

  const openScheduleModal = () => {
    setGeneratedMeetingId(`meet-${Date.now()}`);
    setNewCallEvent({ title: '', date: '', time: '10:00', type: 'call', description: '', participants: [] });
    setIsScheduleModalOpen(true);
  };

  useEffect(() => {
    if (setIsChatOpen) setIsChatOpen(showChat);
  }, [showChat, setIsChatOpen]);

  useEffect(() => {
    if (isInCall && activeView !== 'video') setIsMinimized(true);
    if (isInCall && activeView === 'video') setIsMinimized(false);
  }, [activeView, isInCall, setIsMinimized]);

  useEffect(() => {
    return () => {
      if (setIsMinimized) setIsMinimized(true);
      if (setIsChatOpen) setIsChatOpen(false);
    };
  }, [setIsMinimized, setIsChatOpen]);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const projIndex = pathParts.indexOf('project');
    let currentProj = activeProjectId;
    
    if (!currentProj && projIndex !== -1 && pathParts.length > projIndex + 1) {
      currentProj = pathParts[projIndex + 1];
      setActiveProject(currentProj);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const joinId = urlParams.get('join');
    
    if (joinId && callStatus === 'idle' && !hasAutoJoined.current) {
      hasAutoJoined.current = true;
      const autoConnect = async () => {
        const callDoc = await getDoc(doc(db, 'videoCalls', joinId));
        if (callDoc.exists()) await joinCall(joinId);
        else await startCall([], joinId);
      };
      autoConnect();
    }
  }, [activeProjectId, setActiveProject, callStatus, joinCall, startCall]);

  useEffect(() => {
    if (!db || !currentUser || !currentUser.companyId) return;
    
    let q;
    if (isInCall && (callId || joinCallId)) {
      q = query(collection(db, `videoCalls/${callId || joinCallId}/chatMessages`), orderBy('timestamp', 'asc'));
    } else {
      q = query(
        collection(db, 'chatMessages'), 
        where('companyId', '==', currentUser.companyId), 
        where('projectId', '==', projectId || activeProjectId || 'global'), 
        orderBy('timestamp', 'asc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, sender: data.sender || 'Unknown', avatar: data.avatar || 'U',
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: data.text, isAI: data.isAI, reference: data.reference, createdAt: data.createdAt
        };
      }));
    });
    return () => unsubscribe();
  }, [currentUser, projectId, activeProjectId]);

  useEffect(() => {
    if (!db || !currentUser || !currentUser.companyId) return;
    const q = query(collection(db, 'calendarEvents'), where('companyId', '==', currentUser.companyId), where('type', '==', 'call'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map(doc => doc.data())
        .filter((c: any) => c.projectId === (projectId || activeProjectId || 'global') || c.projectId === 'internal')
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
      
      const relevantCalls = calls.filter(c => new Date(`${c.date}T${c.time}`).getTime() >= Date.now() - (2 * 60 * 60 * 1000));
      setUpcomingCalls(relevantCalls);
    });
    return () => unsubscribe();
  }, [currentUser, projectId, activeProjectId]);

  useEffect(() => {
    if (localVideoRef.current && localStream && !isScreenSharing) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.log(e));
    }
  }, [localStream, callStatus, isScreenSharing, activeView]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn(e));
    }
  }, [remoteStream, callStatus, activeView]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#3b82f6');
  const [strokeWidth, setStrokeWidth] = useState(3);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isAITyping]);

  useEffect(() => {
    if (activeView === 'whiteboard' && canvasRef.current && canvasContainerRef.current) {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
    }
  }, [activeView]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = strokeColor; ctx.lineWidth = strokeWidth; ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.companyId || !db) return;
    
    setIsUploadingFile(true);
    try {
      const isAllowed = await checkStorageLimit(currentUser.companyId, file.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploadingFile(false);
        return;
      }
      
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `${currentUser.companyId}/chat_attachments/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await incrementStorage(currentUser.companyId, file.size);
      
      const senderName = currentUser?.email?.split('@')[0] || 'User';
      const avatarInitials = senderName.substring(0, 2).toUpperCase();
      const msgId = `msg-${Date.now()}`;
      
      const collectionPath = (isInCall && (callId || joinCallId)) ? `videoCalls/${callId || joinCallId}/chatMessages` : 'chatMessages';
      await setDoc(doc(db, collectionPath, msgId), {
        id: msgId, sender: senderName, avatar: avatarInitials, senderId: currentUser.uid,
        companyId: currentUser.companyId, 
        projectId: projectId || activeProjectId || 'global', timestamp: Date.now(), text: `Dateianhang: ${file.name}`, fileUrl: url, createdAt: serverTimestamp()
      });
      
    } catch (err) {
      console.error("Upload error", err);
      addToast('Fehler beim Hochladen der Datei', 'error');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !db || !currentUser?.companyId) return;
    
    const userMessage = newMessage;
    const senderName = currentUser?.email?.split('@')[0] || 'User';
    const avatarInitials = senderName.substring(0, 2).toUpperCase();
    setNewMessage('');
    
    try {
      const msgId = `msg-${Date.now()}`;
      const collectionPath = (isInCall && (callId || joinCallId)) ? `videoCalls/${callId || joinCallId}/chatMessages` : 'chatMessages';
      await setDoc(doc(db, collectionPath, msgId), {
        id: msgId, sender: senderName, avatar: avatarInitials, senderId: currentUser.uid,
        companyId: currentUser.companyId, 
        projectId: projectId || activeProjectId || 'global', timestamp: Date.now(), text: userMessage, createdAt: serverTimestamp()
      });
      
      if (userMessage.toLowerCase().includes('@ai') || userMessage.includes('?')) {
        setIsAITyping(true);
        let knowledgeContext = '';
        try {
          const queryEmbeddingResult = await callGeminiEmbedAPI('gemini-embedding-2-preview', [userMessage]);
          const queryEmbedding = queryEmbeddingResult.embeddings?.[0]?.values;
          const q = query(collection(db, 'knowledgeDocs'), where('companyId', '==', currentUser.companyId));
          const querySnapshot = await getDocs(q);
          const docs = querySnapshot.docs.map((d: any) => d.data());
          
          if (docs.length > 0 && queryEmbedding) {
            const allChunks: { text: string, title: string, score: number }[] = [];
            docs.forEach(doc => {
              if (doc.chunks && Array.isArray(doc.chunks)) {
                doc.chunks.forEach((chunk: any) => {
                  if (chunk.embedding) {
                    let dotProduct = 0, normA = 0, normB = 0;
                    for (let i = 0; i < queryEmbedding.length; i++) {
                      dotProduct += queryEmbedding[i] * chunk.embedding[i];
                      normA += queryEmbedding[i] * queryEmbedding[i];
                      normB += chunk.embedding[i] * chunk.embedding[i];
                    }
                    allChunks.push({ text: chunk.text, title: doc.title, score: (normA === 0 || normB === 0) ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) });
                  }
                });
              } else if (doc.content) {
                allChunks.push({ text: doc.content.substring(0, 1500), title: doc.title, score: 0.5 });
              }
            });
            allChunks.sort((a, b) => b.score - a.score);
            const topChunks = allChunks.slice(0, 3);
            if (topChunks.length > 0) {
              knowledgeContext = `\n\nRelevant Knowledge Base Excerpts:\n${topChunks.map(c => `--- Document: ${c.title} ---\n${c.text}\n`).join('\n')}`;
            }
          }
        } catch (err) { console.error('Knowledge search fail', err); }

        const context = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
        const prompt = `You are the "AI Concierge" for Kreativ-Desk OS. You are participating in a live project chat.\n${knowledgeContext}\nRecent chat history:\n${context}\nYou: ${userMessage}\nProvide a helpful, concise response. If you reference a document, include a reference tag at the end: [REF: Document Name].`;

        const response = await callGeminiAPI('gemini-2.5-flash', prompt);
        let responseText = response.text || 'I am here to help.';
        let reference = undefined;
        
        const refMatch = responseText.match(/\[REF:\s*(.*?)\]/);
        if (refMatch) {
          reference = refMatch[1];
          responseText = responseText.replace(refMatch[0], '').trim();
        }

        const aiMsgId = `msg-${Date.now()}`;
        await setDoc(doc(db, 'chatMessages', aiMsgId), {
          id: aiMsgId, sender: 'AI Concierge', avatar: 'AI', senderId: currentUser.uid,
          companyId: currentUser.companyId, 
          projectId: projectId || activeProjectId || 'global', timestamp: Date.now(), text: responseText, isAI: true,
          reference: reference || null, createdAt: serverTimestamp()
        });
      }
    } catch (error: any) { console.error('AI chat fail', error); } finally { setIsAITyping(false); }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const context = messages.map(m => `${m.sender}${m.isTranscript ? ' (gesprochen)' : ''}: ${m.text}`).join('\n');
      const prompt = `Based on the following meeting chat and spoken transcript, generate a concise meeting summary with 3 bullet points of Action Items. Format as clean text without markdown asterisks if possible, just use bullet points (-).\nTranscript:\n${context}`;
      const response = await callGeminiAPI('gemini-2.5-flash', prompt);
      setMeetingSummary(response.text || 'Summary generated.');
      setShowChat(true);
    } catch (error: any) { setMeetingSummary("Failed to generate summary."); } 
    finally { setIsGeneratingSummary(false); }
  };

  const handleScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCallEvent.title || !newCallEvent.date || !currentUser || !currentUser.companyId || !db) return;
    try {
      const eventId = `evt-${Date.now()}`;
      const targetProjectId = projectId || activeProjectId || 'internal';
      
      await setDoc(doc(db, 'calendarEvents', eventId), {
        ...newCallEvent,
        type: 'call',
        id: eventId,
        ownerId: currentUser.uid,
        companyId: currentUser.companyId, 
        projectId: targetProjectId,
        participants: newCallEvent.participants || [],
        timestamp: new Date(`${newCallEvent.date}T${newCallEvent.time}`).getTime(),
        createdAt: new Date().toISOString(),
        meetingLink: `/project/${targetProjectId}/meet?join=${generatedMeetingId}`
      });
      
      setIsScheduleModalOpen(false);
      setNewCallEvent({ title: '', date: '', time: '10:00', type: 'call', description: '', participants: [] });
      
      const msgId = `msg-${Date.now()}`;
      const sysMsgText = language === 'de' ? `Ein neuer Video-Call "${newCallEvent.title}" wurde für den ${newCallEvent.date} um ${newCallEvent.time} Uhr geplant.` : `A new video call "${newCallEvent.title}" has been scheduled for ${newCallEvent.date} at ${newCallEvent.time}.`;

      await setDoc(doc(db, 'chatMessages', msgId), {
        id: msgId, sender: 'System', avatar: 'SYS', senderId: currentUser.uid,
        companyId: currentUser.companyId, 
        projectId: projectId || activeProjectId || 'global', timestamp: Date.now(), text: sysMsgText, createdAt: serverTimestamp()
      });
      addToast(t('schedule') + ' ' + t('completed'), 'success');
    } catch (err) { addToast(t('upload_failed'), 'error'); }
  };

  const currentProjectMembers = (companyUsers || []).filter((u: any) => 
    (projectMembers || []).some((pm: any) => pm.projectId === (projectId || activeProjectId) && pm.userId === u.id) && u.id !== currentUser?.uid
  );

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden text-text-primary">
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col min-h-0 space-y-4 h-full">
        
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 overflow-x-auto pb-2">
          <div className="shrink-0 flex flex-col">
            <h1 className="text-2xl font-semibold tracking-tight">{t('live_collaboration')}</h1>
            <p className="text-text-muted text-sm mt-1">{t('weekly_coordination')}</p>
          </div>
          
          {/* 🔥 HIER SIND DIE BEIDEN KLASSEN HINZUGEFÜGT (tour-meet-modes) */}
          <div className="tour-meet-modes flex bg-surface border border-border rounded-lg p-1 shadow-sm shrink-0">
            <button onClick={() => setActiveView('video')} className={cn("tour-meet-video px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2", activeView === 'video' ? "bg-accent-ai/10 text-accent-ai" : "text-text-muted hover:text-text-primary")}>
              <Video size={16} /> {t('video')}
            </button>
            <button onClick={() => setActiveView('whiteboard')} className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2", activeView === 'whiteboard' ? "bg-accent-ai/10 text-accent-ai" : "text-text-muted hover:text-text-primary")}>
              <PenTool size={16} /> {t('whiteboard')}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button onClick={() => setShowChat(!showChat)} className={cn("p-2 rounded-lg border transition-colors", showChat ? "bg-accent-ai/20 border-accent-ai/30 text-accent-ai" : "bg-surface border-border text-text-muted hover:text-text-primary")} title={t('project_chat')}>
              <MessageSquare size={18} />
            </button>
            <div className="w-px h-6 bg-border mx-1"></div>
            {/* 🔥 HIER IST DIE ZWEITE KLASSE HINZUGEFÜGT (tour-meet-schedule) */}
            <button onClick={openScheduleModal} className="tour-meet-schedule px-4 py-2 bg-surface border border-border text-text-primary rounded-md text-sm font-bold hover:bg-white/5 transition-colors flex items-center gap-2 shadow-sm">
              <Calendar size={16} /> {t('schedule_call')}
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative">
          
          <div className="flex-1 bg-surface border border-border/50 rounded-3xl overflow-hidden flex flex-col shadow-sm relative min-h-[50vh] md:min-h-0">
            
            {activeView === 'video' ? (
              callStatus === 'idle' ? (
                <div className="flex flex-col items-center justify-center h-full p-8 max-w-md mx-auto text-center animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-accent-ai/10 text-accent-ai rounded-full flex items-center justify-center mx-auto mb-6"><Users size={40} /></div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{t('start_call')}</h3>
                  <p className="text-sm text-text-muted mb-6 font-medium">{t('who_to_call')}</p>
                  
                  {currentProjectMembers.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                      {currentProjectMembers.map((user: any) => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <button key={user.id} onClick={() => toggleUserSelection(user.id)} className={cn("flex flex-col items-center gap-1 transition-all", isSelected ? "opacity-100 scale-110" : "opacity-50 hover:opacity-80 grayscale hover:grayscale-0")}>
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white border-2", isSelected ? "border-accent-ai bg-accent-ai" : "border-border bg-surface")}>
                              {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold text-text-muted">{user.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full mb-8">
                    <button onClick={() => startCall(selectedUserIds)} className="w-full sm:w-auto px-6 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all flex items-center justify-center gap-2">
                      <PhoneCall size={16} /> {selectedUserIds.length > 0 ? `${selectedUserIds.length} ${t('call_selected')}` : t('start_rundruf')}
                    </button>
                    <button onClick={() => { 
                      const newId = `meet-${Date.now()}`;
                      const joinUrl = `${window.location.origin}/guest-meet/${newId}`; 
                      navigator.clipboard.writeText(joinUrl); 
                      setCopiedLink(true); 
                      setTimeout(() => setCopiedLink(false), 2000); 
                      setJoinCallId(newId);
                      addToast('Link kopiert! Sende ihn an externe Partner.', 'success');
                    }} className="w-full sm:w-auto px-5 py-2.5 bg-surface border border-border/80 text-text-primary rounded-lg text-sm font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-sm">
                      {copiedLink ? <CheckCircle2 size={16} className="text-emerald-500" /> : <LinkIcon size={16} />} 
                      <span className="inline">{t('external_link')}</span>
                    </button>
                  </div>

                  <div className="relative flex items-center gap-2 w-full mb-6"><div className="flex-1 h-px bg-border/50"></div><span className="text-xs text-text-muted font-bold uppercase tracking-widest">ODER</span><div className="flex-1 h-px bg-border/50"></div></div>

                  <div className="w-full flex gap-2">
                    <input type="text" value={joinCallId} onChange={e => setJoinCallId(e.target.value)} placeholder="Meeting-ID..." className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                    <button onClick={() => joinCall()} disabled={!joinCallId.trim()} className="px-6 py-2.5 bg-surface border border-border rounded-xl font-bold text-text-primary hover:bg-white/5 disabled:opacity-50 transition-all flex items-center gap-2"><PhoneForwarded size={16} /> Join</button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative bg-black">
                  <div ref={mainVideoRef} className="absolute inset-0 bg-transparent z-0" />
                  <video ref={remoteVideoRef} autoPlay playsInline muted={false} className="w-full h-full object-cover relative z-10" />
                  
                  <div className="absolute bottom-24 right-4 w-24 h-36 md:bottom-6 md:right-6 md:w-48 md:h-32 bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl z-20">
                    <video ref={localVideoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", !isScreenSharing && "transform -scale-x-100")} />
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-background/90 backdrop-blur-xl border border-border/50 p-2 rounded-2xl shadow-2xl z-30 pointer-events-auto">
                    <button onClick={toggleMic} className={cn("p-3 md:p-4 rounded-xl transition-all", isMicOn ? "bg-surface hover:bg-white/10 text-white" : "bg-red-500 text-white shadow-lg")}>{isMicOn ? <Mic size={20} /> : <MicOff size={20} />}</button>
                    <button onClick={toggleCam} className={cn("p-3 md:p-4 rounded-xl transition-all", isCamOn ? "bg-surface hover:bg-white/10 text-white" : "bg-red-500 text-white shadow-lg")}>{isCamOn ? <Video size={20} /> : <VideoOff size={20} />}</button>
                    <button onClick={toggleScreenShare} className={cn("p-3 md:p-4 rounded-xl transition-all hidden md:block", !isScreenSharing ? "bg-surface hover:bg-white/10 text-white" : "bg-accent-ai text-white shadow-lg")}>{!isScreenSharing ? <MonitorUp size={20} /> : <MonitorOff size={20} />}</button>
                    <button onClick={toggleTranscription} className={cn("p-3 md:p-4 rounded-xl transition-all hidden md:block", isTranscribing ? "bg-accent-ai text-white shadow-lg" : "bg-surface hover:bg-white/10 text-white")} title="Live Transkription">{isTranscribing ? <Captions size={20} className="animate-pulse" /> : <Captions size={20} />}</button>
                    <div className="w-px h-8 bg-border/50 mx-1 md:mx-2"></div>
                    <button onClick={hangUp} className="px-4 py-3 md:px-6 md:py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg flex items-center gap-2"><PhoneOff size={18} /> <span className="hidden md:inline">{t('leave_call')}</span></button>
                  </div>

                  {currentTranscript && (
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl text-white text-lg font-medium max-w-2xl text-center shadow-2xl z-40 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                      {currentTranscript}
                    </div>
                  )}

                  <div className="absolute top-6 left-4 flex flex-col md:flex-row items-start md:items-center gap-3 bg-background/90 backdrop-blur-md border border-border/50 px-4 py-2 rounded-xl shadow-lg z-30">
                    <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Meeting ID</span><span className="text-xs md:text-sm font-mono font-bold text-white">{callId || joinCallId}</span></div>
                    <div className="w-px h-8 bg-border/50 hidden md:block mx-1"></div>
                    <button onClick={() => { const joinUrl = `${window.location.origin}/guest-meet/${callId || joinCallId}`; navigator.clipboard.writeText(joinUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); addToast('Link kopiert!', 'success'); }} className="flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-white/10 rounded-lg text-xs font-bold text-text-muted hover:text-white transition-colors">
                      {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <LinkIcon size={16} />}
                      <span className="hidden sm:inline">{t('external_link')}</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div ref={canvasContainerRef} className="absolute inset-0 bg-surface [background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden z-10">
                <div className="absolute top-4 left-4 z-30 bg-background/80 backdrop-blur-md border border-border rounded-lg p-2 flex flex-col gap-2 shadow-xl">
                  <div className="flex flex-col gap-2 border-b border-border pb-2">
                    {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#71717a'].map(color => (
                      <button key={color} onClick={() => { setStrokeColor(color); setStrokeWidth(3); }} className={cn("w-6 h-6 rounded-full border-2 transition-transform hover:scale-110", strokeColor === color && strokeWidth !== 20 ? "border-text-primary scale-110" : "border-transparent")} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <button onClick={() => { setStrokeColor('var(--color-surface)'); setStrokeWidth(20); }} className={cn("p-2 rounded-md transition-colors flex items-center justify-center", strokeWidth === 20 ? "bg-white/10 text-text-primary" : "text-text-muted hover:bg-white/5 hover:text-text-primary")}><Eraser size={18} /></button>
                  <button onClick={clearCanvas} className="p-2 rounded-md text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center"><Trash2 size={18} /></button>
                </div>
                <canvas ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerOut={stopDrawing} className="absolute inset-0 w-full h-full cursor-crosshair touch-none" />
              </div>
            )}
          </div>

          <div className={cn("bg-surface border border-border/50 rounded-3xl flex flex-col shrink-0 transition-all duration-300 relative z-40 shadow-sm", showChat ? "h-[40vh] md:h-auto md:w-[400px] opacity-100" : "h-0 md:w-0 opacity-0 overflow-hidden border-none")}>
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface/80 shrink-0">
              <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-text-primary"><MessageSquare size={16} className="text-text-muted" /> {t('project_chat')}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="px-3 py-1.5 bg-accent-ai/10 text-accent-ai rounded-md text-xs font-bold hover:bg-accent-ai/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm">
                  {isGeneratingSummary ? <Loader2 size={12} className="animate-spin" /> : <FileCheck size={12} />} {t('ai_summary')}
                </button>
                <button onClick={() => setShowChat(false)} className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-white/5"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div className="p-4 border-b border-border/50 bg-background/30 shrink-0">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2"><Clock size={14}/> {t('upcoming_calls')}</h3>
              {upcomingCalls.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {upcomingCalls.slice(0, 2).map((call, idx) => (
                    <div key={idx} className="bg-surface border border-border/50 rounded-lg p-3 flex items-center justify-between shadow-sm">
                      <div>
                        <h4 className="font-bold text-text-primary text-xs">{call.title}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5 font-medium">{new Date(call.date).toLocaleDateString()} • {call.time} Uhr</p>
                      </div>
                      <button onClick={() => { joinCall(call.meetingLink.split('join=')[1] || null); }} className="px-3 py-1.5 bg-accent-success/10 text-accent-success hover:bg-accent-success/20 border border-accent-success/20 rounded-md text-xs font-bold transition-colors">
                        {t('join_now')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">{t('no_upcoming_calls')}</p>
              )}
            </div>

            {meetingSummary && (
              <div className="m-4 p-4 bg-accent-ai/10 border border-accent-ai/20 rounded-xl relative animate-in fade-in slide-in-from-top-2 shrink-0">
                <div className="absolute -top-3 left-4 bg-surface px-2 text-xs font-bold text-accent-ai flex items-center gap-1 border border-border/50 rounded-full shadow-sm"><Sparkles size={12} /> {t('ai_summary')}</div>
                <button onClick={() => setMeetingSummary(null)} className="absolute top-2 right-2 text-text-muted hover:text-text-primary"><X size={14} /></button>
                <div className="text-sm text-text-primary whitespace-pre-wrap mt-2 font-medium">{meetingSummary}</div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3 animate-in fade-in slide-in-from-bottom-2", msg.isAI ? "bg-accent-ai/5 border border-accent-ai/20 p-3 rounded-xl" : "")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium shadow-sm", msg.isAI ? "bg-accent-ai text-white" : "bg-background border border-border/50 text-text-muted")}>
                    {msg.isAI ? <Sparkles size={14} /> : msg.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2"><span className={cn("text-sm font-bold", msg.isAI ? "text-accent-ai" : "text-text-primary")}>{msg.sender}</span><span className="text-[10px] font-medium text-text-muted">{msg.time}</span></div>
                    <p className="text-sm text-text-muted mt-1 leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                    {(msg as any).fileUrl && (
                      <a href={(msg as any).fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-accent-ai hover:underline text-sm font-bold bg-accent-ai/10 px-3 py-1.5 rounded-lg border border-accent-ai/20 shadow-sm transition-all hover:bg-accent-ai/20">
                        <LinkIcon size={14} /> Datei ansehen / herunterladen
                      </a>
                    )}
                    {msg.reference && <div className="mt-3 inline-flex items-center gap-1.5 bg-background border border-border/50 rounded-md px-2 py-1 text-xs font-medium text-text-primary hover:bg-white/5 transition-colors cursor-pointer shadow-sm"><FileText size={12} className="text-accent-ai" /> {msg.reference}</div>}
                  </div>
                </div>
              ))}
              {isAITyping && (
                <div className="flex gap-3 bg-accent-ai/5 border border-accent-ai/20 p-3 rounded-xl animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-accent-ai text-white flex items-center justify-center shrink-0"><Sparkles size={14} /></div>
                  <div className="flex-1 flex items-center"><div className="flex gap-1"><div className="w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div><div className="w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div><div className="w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div></div></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border/50 bg-surface/80 shrink-0">
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileAttachment} />
              <form onSubmit={handleSendMessage} className="tour-meet-chat relative flex items-center">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="tour-meet-files absolute left-3 text-text-muted hover:text-text-primary transition-colors disabled:opacity-50" disabled={isUploadingFile}>
                  {isUploadingFile ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                </button>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t('type_message')} className="w-full bg-background border border-border/50 rounded-xl py-3 pl-10 pr-12 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-ai transition-all placeholder:text-text-muted" disabled={isUploadingFile} />
                <button type="submit" disabled={!newMessage.trim() || isAITyping || isUploadingFile} className="absolute right-2 p-2 bg-accent-ai text-white rounded-lg hover:bg-accent-ai/90 transition-colors disabled:opacity-50 shadow-md"><Send size={16} className="translate-x-0.5" /></button>
              </form>
            </div>
          </div>
        </div>
        
        {/* SCHEDULE MODAL (PORTAL) */}
        {isScheduleModalOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-surface border border-border/50 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4 bg-surface/50">
                <h2 className="text-lg font-bold flex items-center gap-2 text-text-primary"><Calendar size={20} className="text-accent-ai"/> {t('schedule_video_call')}</h2>
                <button onClick={() => setIsScheduleModalOpen(false)} className="text-text-muted hover:text-text-primary bg-background p-1.5 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleScheduleCall} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('meeting_title')}</label>
                  <input type="text" value={newCallEvent.title} onChange={e => setNewCallEvent({...newCallEvent, title: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-ai text-text-primary font-bold" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('date')}</label>
                    <input type="date" value={newCallEvent.date} onChange={e => setNewCallEvent({...newCallEvent, date: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-ai text-text-primary font-bold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('time')}</label>
                    <input type="time" value={newCallEvent.time} onChange={e => setNewCallEvent({...newCallEvent, time: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-ai text-text-primary font-bold" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('description')}</label>
                  <textarea value={newCallEvent.description} onChange={e => setNewCallEvent({...newCallEvent, description: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-ai resize-none h-20 text-text-primary font-medium custom-scrollbar" />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Users size={14}/> {t('invite_participants')}
                  </label>
                  <div className="bg-background border border-border/50 rounded-xl p-3 max-h-32 overflow-y-auto custom-scrollbar grid grid-cols-1 gap-2">
                    {currentProjectMembers.map((user: any) => (
                      <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-surface rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border/50">
                        <input 
                          type="checkbox" 
                          checked={newCallEvent.participants?.includes(user.id)} 
                          onChange={(e) => {
                            const current = newCallEvent.participants || [];
                            setNewCallEvent({
                              ...newCallEvent, 
                              participants: e.target.checked 
                                ? [...current, user.id] 
                                : current.filter(id => id !== user.id)
                            });
                          }}
                          className="rounded border-border/50 text-accent-ai focus:ring-accent-ai bg-surface"
                        />
                        <div className="flex items-center gap-2 overflow-hidden">
                           <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-accent-ai shrink-0">
                             {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                           </div>
                           <p className="text-xs font-bold truncate text-text-primary">{user.name}</p>
                        </div>
                      </label>
                    ))}
                    {currentProjectMembers.length === 0 && (
                       <p className="text-xs text-text-muted p-2 col-span-full">Keine weiteren Teammitglieder im Projekt.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <LinkIcon size={14}/> {t('external_link')}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/project/${projectId || activeProjectId || 'global'}/meet?join=${generatedMeetingId}`} 
                      className="flex-1 bg-surface border border-border/50 rounded-xl py-2.5 px-4 text-xs font-medium text-text-muted outline-none" 
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/project/${projectId || activeProjectId || 'global'}/meet?join=${generatedMeetingId}`);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-4 py-2.5 bg-background border border-border/50 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center text-text-primary shadow-sm"
                      title="Kopieren"
                    >
                      {copiedLink ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-border/50 mt-6">
                  <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('cancel')}</button>
                  <button type="submit" className="px-8 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg shadow-accent-ai/20">{t('schedule')}</button>
                </div>
              </form>
            </div>
          </div>,
          document.body 
        )}
      </motion.div>
    </div>
  );
}
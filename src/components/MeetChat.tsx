import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Video, Mic, MicOff, MonitorUp, PhoneOff, MessageSquare, Send, Sparkles, Mail,
  Paperclip, Loader2, PenTool, FileText, ChevronRight, FileCheck, X, Trash2, Eraser, Phone, Calendar, Clock, Monitor, Users, Copy, CheckCircle2, PhoneCall, PhoneForwarded, MonitorOff, Link as LinkIcon, VideoOff, Captions, UserPlus, UserCheck, Download, History, Image
} from 'lucide-react';
import { downloadICSFile } from '../utils/icsGenerator';
import { cn, sanitizeUrl } from '../utils';
import { callGeminiAPI, callGeminiEmbedAPI } from '../utils/geminiClient';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { checkStorageLimit, incrementStorage } from '../utils/storageGuard';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useVideoCall } from '../contexts/VideoCallContext';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { sendNotification } from '../lib/notifications';
import { uploadFileWithFallback } from '../utils/cloudStorageHelper';
import { fetchSystemConfigJSON, saveSystemConfigJSON } from '../utils/configHelper';

const RemoteVideo = ({ stream }: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(e => console.warn("Remote video play note:", e));

      const handleTrackUpdate = () => {
        if (video) {
          video.srcObject = stream;
          video.play().catch(() => { });
        }
      };

      stream.onaddtrack = handleTrackUpdate;
      stream.onremovetrack = handleTrackUpdate;

      return () => {
        stream.onaddtrack = null;
        stream.onremovetrack = null;
      };
    }
  }, [stream]);
  return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />;
};

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

interface ChatMessage { id: string; sender: string; avatar: string; time: string; text: string; isAI?: boolean; isTranscript?: boolean; fileUrl?: string; reference?: string; createdAt?: any; }

const isImageFile = (url?: string, text?: string): boolean => {
  if (!url && !text) return false;
  const target = (url || '') + (text || '');
  return /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(target) || (url?.startsWith('data:image/') ?? false);
};

export default function MeetChat() {
  const { projectId, id } = useParams<{ projectId?: string; id?: string }>();
  const routeProjectId = projectId || id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const { activeProjectId, setActiveProject, projectMembers, companyUsers } = useProject();

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const {
    localStream, remoteStreams, screenStream, isMicOn, isCamOn, isScreenSharing,
    callStatus, callId, joinCallId, setJoinCallId, startCall, joinCall, hangUp,
    toggleMic, toggleCam, toggleScreenShare, setIsMinimized, isInCall, setIsChatOpen
  } = useVideoCall();

  const [sessionRoomId] = useState(() => {
    const saved = sessionStorage.getItem('kreativ_desk_active_room');
    if (saved) return saved;
    const newId = `call-${Date.now()}`;
    sessionStorage.setItem('kreativ_desk_active_room', newId);
    return newId;
  });
  const [generatedMeetingId, setGeneratedMeetingId] = useState('');
  const activeCallRoomId = callId || joinCallId || generatedMeetingId || sessionRoomId;

  const currentProjectId = routeProjectId || id || activeProjectId || 'global';

  const [activeView, setActiveViewRaw] = useState<'video' | 'whiteboard'>(() => {
    try {
      const saved = localStorage.getItem(`meetchat_activeView_${currentProjectId}`);
      if (saved && (saved === 'video' || saved === 'whiteboard')) return saved;
    } catch (e) {}
    return 'video';
  });

  const setActiveView = (view: 'video' | 'whiteboard') => {
    setActiveViewRaw(view);
    try {
      localStorage.setItem(`meetchat_activeView_${currentProjectId}`, view);
    } catch (e) {}
  };

  const [showChat, setShowChat] = useState(() => window.innerWidth >= 1024);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const currentMeetingCallId = callId || joinCallId || activeCallRoomId;
  const chatCacheKey = `meetchat_history_${currentMeetingCallId || currentProjectId}`;

  // Restore cached chat messages from LocalStorage whenever room or project changes
  useEffect(() => {
    try {
      const cached = localStorage.getItem(chatCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {}
  }, [chatCacheKey]);

  // Persist messages to LocalStorage whenever messages state updates
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(chatCacheKey, JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages, chatCacheKey]);
  const [upcomingCalls, setUpcomingCalls] = useState<any[]>([]);
  const [newMessage, setNewMessageRaw] = useState<string>(() => {
    try {
      return localStorage.getItem(`meetchat_draft_${currentProjectId}`) || '';
    } catch (e) {
      return '';
    }
  });

  const setNewMessage = (val: string | ((prev: string) => string)) => {
    setNewMessageRaw(prev => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      try {
        if (nextVal) localStorage.setItem(`meetchat_draft_${currentProjectId}`, nextVal);
        else localStorage.removeItem(`meetchat_draft_${currentProjectId}`);
      } catch (e) {}
      return nextVal;
    });
  };
  const [isAITyping, setIsAITyping] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newCallEvent, setNewCallEvent] = useState({ title: '', date: '', time: '10:00', type: 'call', description: '', participants: [] as string[], externalEmails: [] as string[] });
  const [newCallExternalEmailInput, setNewCallExternalEmailInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAddCallExternalEmail = () => {
    if (!newCallExternalEmailInput.trim()) return;
    const email = newCallExternalEmailInput.trim().toLowerCase();
    if (!email.includes('@')) {
      addToast(currentLang === 'de' ? 'Bitte eine gültige E-Mail-Adresse eingeben' : 'Please enter a valid email address', 'error');
      return;
    }
    if (newCallEvent.externalEmails.includes(email)) {
      setNewCallExternalEmailInput('');
      return;
    }
    setNewCallEvent(prev => ({
      ...prev,
      externalEmails: [...prev.externalEmails, email]
    }));
    setNewCallExternalEmailInput('');
  };

  const [copied, setCopied] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const hasAutoJoined = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainVideoRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [showBgModal, setShowBgModal] = useState(false);
  const [bgMode, setBgMode] = useState<'none' | 'blur' | 'preset' | 'custom' | 'screensaver'>(() => (localStorage.getItem('meetchat_bg_mode') as any) || 'none');
  const [bgBlurAmount, setBgBlurAmount] = useState<string>(() => localStorage.getItem('meetchat_bg_blur') || '12px');
  const [bgImageUrl, setBgImageUrl] = useState<string>(() => localStorage.getItem('meetchat_bg_image') || '');
  const [customBgImage, setCustomBgImage] = useState<string>(() => localStorage.getItem('meetchat_custom_bg') || '');
  const [screensaverBg, setScreensaverBg] = useState<string>(() => localStorage.getItem('ws_screensaver_bg') || '');

  useEffect(() => {
    const fetchScreensaverBg = async () => {
      try {
        const safeComp = currentUser?.companyId || currentUser?.uid;
        if (safeComp) {
          const { data } = await supabase.from('company_settings').select('screensaver_image').eq('company_id', safeComp).maybeSingle();
          if (data?.screensaver_image) {
            setScreensaverBg(data.screensaver_image);
            localStorage.setItem('ws_screensaver_bg', data.screensaver_image);
          }
        }
      } catch (e) {}
    };
    fetchScreensaverBg();
  }, [currentUser]);

  const handleSelectBgMode = (mode: 'none' | 'blur' | 'preset' | 'custom' | 'screensaver', url?: string, blur?: string) => {
    setBgMode(mode);
    localStorage.setItem('meetchat_bg_mode', mode);
    if (blur) { setBgBlurAmount(blur); localStorage.setItem('meetchat_bg_blur', blur); }
    if (url) { setBgImageUrl(url); localStorage.setItem('meetchat_bg_image', url); }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = (reader.result as string) || '';
      setCustomBgImage(result);
      localStorage.setItem('meetchat_custom_bg', result);
      handleSelectBgMode('custom', result);
    };
    reader.readAsDataURL(file);
  };

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const openHistoryModal = async () => {
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      let historyItems: any[] = [];
      const targetProj = projectId || activeProjectId || 'global';
      
      try {
        const { data: calls } = await supabase
          .from('video_calls')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (calls) {
          historyItems = calls.map(c => ({
            id: c.id,
            title: c.title || `Video Call (${c.id.substring(0, 12)})`,
            callerName: c.caller_name || 'Host',
            createdAt: c.created_at,
            endedAt: c.ended_at,
            meetingLink: `/project/${c.project_id || targetProj}/meet?join=${c.id}`,
            projectId: c.project_id
          }));
        }
      } catch (e) {
        console.warn("video_calls history fetch info:", e);
      }

      try {
        const { data: events } = await supabase
          .from('calendar_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (events) {
          events.filter((e: any) => !e.type || e.type === 'call').forEach(e => {
            const meetingId = e.meeting_link?.split('join=')[1] || e.id;
            if (!historyItems.some(h => h.id === meetingId || h.id === e.id)) {
              historyItems.push({
                id: e.id,
                title: e.title,
                callerName: e.owner_id ? 'Organisator' : 'Host',
                createdAt: e.created_at || (e.date ? `${e.date}T${e.time || '10:00'}:00` : new Date().toISOString()),
                meetingLink: e.meeting_link || `/project/${e.project_id || targetProj}/meet?join=${e.id}`,
                projectId: e.project_id,
                description: e.description
              });
            }
          });
        }
      } catch (e) {}

      historyItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setCallHistory(historyItems);
    } catch (err) {
      console.error("Failed to load call history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDownloadICS = (call: { title: string; date?: string; time?: string; createdAt?: string; description?: string; meetingLink?: string; id?: string }) => {
    const rawDate = call.date || (call.createdAt ? call.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);
    const rawTime = call.time || (call.createdAt && call.createdAt.includes('T') ? call.createdAt.split('T')[1].substring(0, 5) : '10:00');
    const meetingUrl = `${window.location.origin}${call.meetingLink || `/guest-meet/${call.id || 'room'}`}`;

    downloadICSFile([{
      title: `📹 ${call.title || 'Live Video Call'}`,
      description: `${call.description ? call.description + '\n\n' : ''}Direkt-Link zum Meeting: ${meetingUrl}`,
      startDate: rawDate,
      startTime: rawTime,
      url: meetingUrl,
      location: 'Kreativ Desk OS (Online Meeting)'
    }], (call.title || 'Video_Call').replace(/[^a-zA-Z0-9_-]/g, '_'));

    addToast(currentLang === 'de' ? '📅 iCal (.ics) Datei heruntergeladen!' : '📅 iCal (.ics) file downloaded!', 'success');
  };

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const isTranscribingRef = useRef(isTranscribing);

  useEffect(() => { isTranscribingRef.current = isTranscribing; }, [isTranscribing]);

    const sendChatMessage = async (msgData: {
      text: string;
      sender?: string;
      avatar?: string;
      fileUrl?: string;
      isAI?: boolean;
      isTranscript?: boolean;
      reference?: string;
    }) => {
      const senderName = msgData.sender || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
      const currentMeetingCallId = callId || joinCallId || activeCallRoomId;
      const msgId = `msg-${Date.now()}`;

      const msgObj = {
        id: msgId,
        sender: senderName,
        avatar: (senderName || 'U').substring(0, 2).toUpperCase(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: msgData.text,
        isAI: msgData.isAI,
        fileUrl: msgData.fileUrl,
        reference: msgData.reference,
        createdAt: new Date().toISOString()
      };

      // Optimistically update local messages for sender if not already present
      setMessages(prev => {
        if (prev.some(m => m.id === msgId)) return prev;
        return [...prev, msgObj];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      // Live Broadcast to connected peers in room
      supabase.channel(`chat_messages_${currentMeetingCallId}`).send({
        type: 'broadcast',
        event: 'new_chat_msg',
        payload: msgObj
      }).catch(() => { });

      const textWithEmbeddedFile = msgData.fileUrl
        ? (msgData.text ? `${msgData.text} [FILE:${msgData.fileUrl}]` : `[FILE:${msgData.fileUrl}]`)
        : msgData.text;

      const payloadPrimary: any = {
        id: msgId,
        call_id: currentMeetingCallId,
        sender_id: currentUser?.uid || `user-${Date.now()}`,
        sender_name: senderName,
        message: textWithEmbeddedFile,
        created_at: new Date().toISOString()
      };

      if (msgData.fileUrl) payloadPrimary.file_url = msgData.fileUrl;
      if (msgData.isAI) payloadPrimary.is_ai = true;
      if (msgData.isTranscript) payloadPrimary.is_transcript = true;
      if (msgData.reference) payloadPrimary.reference = msgData.reference;

      try {
        const { error: insErr } = await supabase.from('chat_messages').insert(payloadPrimary);
        if (insErr) {
          const payloadFallback: any = {
            id: msgId + '-fb',
            call_id: currentMeetingCallId,
            sender_id: currentUser?.uid || `user-${Date.now()}`,
            sender_name: senderName,
            message: textWithEmbeddedFile,
            created_at: new Date().toISOString()
          };
          try {
            await supabase.from('chat_messages').insert(payloadFallback);
          } catch (fbErr) {}
        }
      } catch (err) {}
    };

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
          if (finalStr && (callId || joinCallId || activeCallRoomId)) {
            sendChatMessage({ text: finalStr, isTranscript: true });
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
        try { recognition.start(); } catch (e) { console.warn(e); }
      }
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch (e) {
        console.warn(e);
      }
    };
  }, [callId, joinCallId, activeCallRoomId, currentUser, activeProjectId, projectId, currentLang]);

  const toggleTranscription = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addToast("ℹ️ Live-Transkription wird in Firefox nicht unterstützt. Bitte nutze Chrome, Safari oder Edge für Live-Untertitel.", "info");
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
        try { recognitionRef.current.start(); addToast("Live-Transkription gestartet", "success"); } catch (e) { console.warn(e); }
      }
    }
  };

  const openScheduleModal = () => {
    setGeneratedMeetingId(`meet-${Date.now()}`);
    setNewCallEvent({ title: '', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'call', description: '', participants: [], externalEmails: [] });
    setNewCallExternalEmailInput('');
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
        await startCall([], joinId);
      };
      autoConnect();
    }
  }, [activeProjectId, setActiveProject, callStatus, joinCall, startCall]);

  useEffect(() => {
    const safeCompanyId = currentUser?.companyId || currentUser?.uid || '';
    const currentMeetingCallId = callId || joinCallId || activeCallRoomId;

    const fetchChatMessages = async () => {
      try {
        let msgs: any[] = [];
        let query = supabase.from('chat_messages').select('*');
        if (currentMeetingCallId) {
          query = query.eq('call_id', currentMeetingCallId);
        }
        const { data, error } = await query.order('created_at', { ascending: true }).limit(100);

        if (!error && data) msgs = data;

        if (msgs && msgs.length > 0) {
          const formatted = msgs.map(d => {
            let rawText = d.message || d.text || '';
            let fileUrl = d.file_url || d.fileUrl || null;
            if (rawText && rawText.includes('[FILE:')) {
              const match = rawText.match(/\[FILE:(.*?)\]/);
              if (match) {
                if (!fileUrl) fileUrl = match[1];
                rawText = rawText.replace(/\[FILE:.*?\]/g, '').trim();
              }
            }
            return {
              id: d.id,
              sender: d.sender_name || d.sender || 'System',
              avatar: (d.sender_name || d.sender || 'U').substring(0, 2).toUpperCase(),
              time: new Date(d.created_at || d.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: rawText,
              isAI: d.is_ai,
              fileUrl: fileUrl,
              reference: d.reference,
              createdAt: d.created_at
            };
          });

          setMessages(prev => {
            const merged = [...prev];
            formatted.forEach(f => {
              if (!merged.some(m => m.id === f.id)) merged.push(f);
            });
            return merged;
          });
        }
      } catch (chatErr) {
        console.warn("Chat fetch fallback handled:", chatErr);
      }
    };

    fetchChatMessages();

    const fetchUpcomingCalls = async () => {
      try {
        let events: any[] = [];
        try {
          const { data } = await supabase
            .from('calendar_events')
            .select('*');
          if (data) events = data.filter((e: any) => !e.type || e.type === 'call');
        } catch (evErr) {
          console.warn("Calendar events query fallback handled:", evErr);
        }

        let configCalls: any[] = [];
        try {
          if (safeCompanyId) {
            const { data: config } = await supabase
              .from('system_config')
              .select('*')
              .eq('id', `schedule_calls_${safeCompanyId}`)
              .maybeSingle();
            const cData = (config as any)?.data || config;
            if (cData?.calls) configCalls = cData.calls;
          }
        } catch (cfgErr) { }

        const dbCalls = (events || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date || e.event_date || e.start_date || new Date().toISOString().split('T')[0],
          time: e.time || '10:00',
          meetingLink: e.meeting_link || e.meetingLink || `/project/${e.project_id || 'global'}/meet`
        }));

        const mergedMap = new Map();
        [...configCalls, ...dbCalls].forEach(item => {
          if (item && item.title) mergedMap.set(item.id || item.title, item);
        });

        setUpcomingCalls(Array.from(mergedMap.values()));
      } catch (err) {
        console.warn("Error fetching upcoming calls:", err);
      }
    };

    fetchUpcomingCalls();

    const channel = supabase
      .channel(`chat_messages_${currentMeetingCallId}`)
      .on('broadcast', { event: 'new_chat_msg' }, ({ payload }) => {
        if (payload && payload.id) {
          let rawText = payload.text || payload.message || '';
          let fileUrl = payload.fileUrl || payload.file_url || null;
          if (rawText && rawText.includes('[FILE:')) {
            const match = rawText.match(/\[FILE:(.*?)\]/);
            if (match) {
              if (!fileUrl) fileUrl = match[1];
              rawText = rawText.replace(/\[FILE:.*?\]/g, '').trim();
            }
          }

          setMessages(prev => {
            if (prev.some(m => m.id === payload.id || (m.sender === (payload.sender || payload.sender_name) && m.text === rawText && m.fileUrl === fileUrl))) return prev;
            return [...prev, {
              id: payload.id,
              sender: payload.sender || payload.sender_name || 'System',
              avatar: payload.avatar || (payload.sender || 'U').substring(0, 2).toUpperCase(),
              time: payload.time || new Date(payload.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: rawText,
              isAI: payload.isAI || payload.is_ai,
              fileUrl: fileUrl,
              reference: payload.reference,
              createdAt: payload.createdAt || payload.created_at
            }];
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const d = payload.new;
        if (d && (d.call_id === currentMeetingCallId || d.project_id === (projectId || activeProjectId))) {
          let rawText = d.message || d.text || '';
          let fileUrl = d.file_url || d.fileUrl || null;
          if (rawText && rawText.includes('[FILE:')) {
            const match = rawText.match(/\[FILE:(.*?)\]/);
            if (match) {
              if (!fileUrl) fileUrl = match[1];
              rawText = rawText.replace(/\[FILE:.*?\]/g, '').trim();
            }
          }

          setMessages(prev => {
            if (prev.some(m => m.id === d.id || (m.sender === (d.sender_name || d.sender) && m.text === rawText && m.fileUrl === fileUrl))) return prev;
            return [...prev, {
              id: d.id,
              sender: d.sender_name || d.sender || 'System',
              avatar: (d.sender_name || d.sender || 'U').substring(0, 2).toUpperCase(),
              time: new Date(d.created_at || d.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: rawText,
              isAI: d.is_ai,
              fileUrl: fileUrl,
              reference: d.reference,
              createdAt: d.created_at
            }];
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(() => { });
      }
    };
  }, [currentUser, projectId, activeProjectId, callId, isInCall, joinCallId, activeCallRoomId]);

  const handleFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const safeComp = currentUser?.companyId || 'global';
      const url = await uploadFileWithFallback(file, file.name, safeComp, 'chat_attachments');

      await sendChatMessage({ text: `Dateianhang: ${file.name}`, fileUrl: url });

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
    if (!newMessage.trim()) return;

    const userMessage = newMessage;
    setNewMessage('');

    try {
      await sendChatMessage({ text: userMessage });

      if (userMessage.toLowerCase().includes('@ai') || userMessage.includes('?')) {
        setIsAITyping(true);
        let knowledgeContext = '';
        try {
          if (currentUser?.companyId) {
            const { data: docs } = await supabase.from('documents').select('*').eq('company_id', currentUser.companyId);
            if (docs && docs.length > 0) {
              knowledgeContext = `\n\nRelevant Knowledge Base Excerpts:\n${docs.slice(0, 3).map(c => `--- Document: ${c.name} ---\n${c.url}\n`).join('\n')}`;
            }
          }
        } catch (err) { console.error('Knowledge search fail', err); }

        const langInstruction = currentLang === 'de'
          ? 'Bitte antworte vollständig auf Deutsch.'
          : 'Please respond completely in English.';

        const context = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
        const prompt = `You are the "AI Concierge" for Kreativ-Desk OS. You are participating in a live project chat.\n${knowledgeContext}\nRecent chat history:\n${context}\nYou: ${userMessage}\n${langInstruction}\nProvide a helpful, concise response. If you reference a document, include a reference tag at the end: [REF: Document Name].`;

        const response = await callGeminiAPI('gemini-2.5-flash', prompt);
        let responseText = response.text || 'I am here to help.';
        let reference = undefined;

        const refMatch = responseText.match(/\[REF:\s*(.*?)\]/);
        if (refMatch) {
          reference = refMatch[1];
          responseText = responseText.replace(refMatch[0], '').trim();
        }

        await sendChatMessage({
          sender: 'AI Concierge',
          avatar: 'AI',
          text: responseText,
          isAI: true,
          reference: reference || undefined
        });
      }
    } catch (error: any) { console.error('AI chat fail', error); } finally { setIsAITyping(false); }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const context = messages.map(m => `${m.sender}${m.isTranscript ? (currentLang === 'de' ? ' (gesprochen)' : ' (spoken)') : ''}: ${m.text}`).join('\n');
      const prompt = currentLang === 'de'
        ? `Basierend auf folgendem Meeting-Chat und gesprochenem Transkript, erstelle eine prägnante Zusammenfassung auf Deutsch mit 3 Stichpunkten (Action Items). Bitte erstelle alle Überschriften und Inhalte VOLLSTÄNDIG auf Deutsch (z.B. "Zusammenfassung:", "Wichtige Aufgaben:"). Formatiere als klaren Text ohne Markdown-Sternchen (*), verwende einfache Bindestriche (-).\nTranskript:\n${context}`
        : `Based on the following meeting chat and spoken transcript, generate a concise meeting summary in English with 3 bullet points of Action Items. Format headings and text completely in English (e.g., "Summary:", "Action Items:"). Format as clean text without markdown asterisks if possible, just use bullet points (-).\nTranscript:\n${context}`;

      const response = await callGeminiAPI('gemini-2.5-flash', [{ text: prompt }]);
      setMeetingSummary(typeof response === 'string' ? response : (response.text || JSON.stringify(response)));
      setShowChat(true);
    } catch (error: any) {
      setMeetingSummary(currentLang === 'de' ? "Fehler beim Erstellen der Zusammenfassung." : "Failed to generate summary.");
    }
    finally { setIsGeneratingSummary(false); }
  };

  const handleScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCallEvent.title || !newCallEvent.date || !currentUser || !currentUser.companyId) return;
    try {
      const eventId = `evt-${Date.now()}`;
      const targetProjectId = projectId || activeProjectId || 'internal';
      const meetingId = generatedMeetingId || `meet-${Date.now()}`;
      const meetingLink = `/project/${targetProjectId}/meet?join=${meetingId}`;
      const allParticipants = [
        ...(newCallEvent.participants || []),
        ...(newCallEvent.externalEmails || [])
      ];

      // 1. Pre-register video call so external links work
      try {
        await supabase.from('video_calls').upsert({
          id: meetingId,
          host_id: currentUser.uid || 'user',
          room_name: targetProjectId,
          status: 'active',
          created_at: new Date().toISOString()
        });
      } catch (vcErr) {
        console.warn("video_calls upsert fallback handled:", vcErr);
      }

      const newCallObj = {
        id: eventId,
        title: newCallEvent.title,
        date: newCallEvent.date,
        event_date: newCallEvent.date,
        start_date: newCallEvent.date,
        time: newCallEvent.time,
        type: 'call',
        description: newCallEvent.description || '',
        meetingLink: meetingLink,
        meeting_link: meetingLink,
        projectId: targetProjectId,
        project_id: targetProjectId,
        company_id: currentUser.companyId,
        owner_id: currentUser.uid,
        participants: allParticipants
      };

      setUpcomingCalls(prev => [newCallObj, ...prev]);

      // Save to local storage cache for Agenda tab
      try {
        const agendaCacheKey = `agenda_cache_${currentUser.companyId}`;
        const existingAgendaCache = JSON.parse(localStorage.getItem(agendaCacheKey) || '[]');
        localStorage.setItem(agendaCacheKey, JSON.stringify([newCallObj, ...existingAgendaCache]));
      } catch (cacheErr) {
        console.warn("Agenda cache sync fail:", cacheErr);
      }

      // 2. Backup to documents (both calls and agenda events)
      try {
        const existingConfig = await fetchSystemConfigJSON<{ calls?: any[] }>(`schedule_calls_${currentUser.companyId}`, currentUser.companyId);
        const cCalls = existingConfig?.calls || [];
        await saveSystemConfigJSON(`schedule_calls_${currentUser.companyId}`, { calls: [newCallObj, ...cCalls], companyId: currentUser.companyId }, currentUser.companyId, currentUser.uid);

        const agendaConfig = await fetchSystemConfigJSON<{ events?: any[] }>(`agenda_events_${currentUser.companyId}`, currentUser.companyId);
        const cEvents = agendaConfig?.events || [];
        await saveSystemConfigJSON(`agenda_events_${currentUser.companyId}`, { events: [newCallObj, ...cEvents], companyId: currentUser.companyId }, currentUser.companyId, currentUser.uid);
      } catch (backupErr) { }

      // 3. Insert into calendar_events with standard DB schema
      try {
        const descParts = [
          newCallEvent.description || '',
          newCallEvent.time ? `Uhrzeit: ${newCallEvent.time}` : '',
          'Typ: call',
          meetingLink ? `Meeting Link: ${meetingLink}` : '',
          allParticipants.length ? `Teilnehmer: ${allParticipants.join(', ')}` : ''
        ].filter(Boolean).join('\n');

        const eventToInsert: any = {
          title: newCallEvent.title,
          description: descParts,
          start_date: newCallEvent.date || new Date().toISOString().split('T')[0],
          end_date: newCallEvent.date || new Date().toISOString().split('T')[0],
          location: meetingLink || '',
          company_id: currentUser.companyId,
          project_id: targetProjectId,
          created_at: new Date().toISOString()
        };

        const { error: insertErr } = await supabase.from('calendar_events').insert(eventToInsert);
        if (insertErr) {
          await supabase.from('calendar_events').insert({
            title: newCallEvent.title,
            description: descParts,
            company_id: currentUser.companyId,
            created_at: new Date().toISOString()
          });
        }
      } catch (calInsErr) {
        console.warn("Calendar events insert handled:", calInsErr);
      }

      // Trigger notification bell
      await sendNotification({
        companyId: currentUser.companyId,
        title: 'Neuer Video Call geplant',
        message: `Video Call "${newCallEvent.title}" am ${newCallEvent.date} um ${newCallEvent.time} Uhr angesetzt.`,
        type: 'call',
        link: meetingLink
      });

      // Trigger external email dispatch via server API & mailto link if external emails were entered
      if (newCallEvent.externalEmails && newCallEvent.externalEmails.length > 0) {
        const recipients = newCallEvent.externalEmails;
        const fullMeetingUrl = `${window.location.origin}${meetingLink}`;

        // 1. Call Vercel / API Serverless Email Endpoint
        try {
          await fetch('/api/send-invitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newCallEvent.title,
              date: newCallEvent.date,
              time: newCallEvent.time,
              description: newCallEvent.description,
              meetingLink: fullMeetingUrl,
              recipients,
              language: currentLang,
              type: 'call',
              senderName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Carlo Vescio',
              companyId: currentUser.companyId
            })
          });
        } catch (apiErr) {
          console.warn("API invitation dispatch handled:", apiErr);
        }

        // 2. Open prefilled mailto link for direct mail app dispatch (Bilingual DE/EN)
        const host = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Carlo Vescio';
        const isDe = currentLang === 'de';
        const subject = encodeURIComponent(
          isDe ? `📹 Einladung zum Live-Videocall | Kreativ Desk OS` : `📹 Invitation to Live Video Call | Kreativ Desk OS`
        );
        const bodyText = encodeURIComponent(
          isDe
            ? `Hallo,\n\n${host} lädt dich zu einem Live-Videocall auf Kreativ Desk OS ein!\n\n` +
              `🚀 MEETING DETAILS:\n` +
              `• Titel: ${newCallEvent.title}\n` +
              `• Datum: ${newCallEvent.date} um ${newCallEvent.time} Uhr\n` +
              `${newCallEvent.description ? `• Notizen: ${newCallEvent.description}\n` : ''}` +
              `• Direkt-Link: ${fullMeetingUrl}\n\n` +
              `✨ HINWEIS FÜR GÄSTE:\n` +
              `Kein Login oder Software-Download erforderlich. Klicke einfach auf den Link oben, gib deinen Namen ein und tritt sofort bei.\n\n` +
              `Freundliche Grüsse,\n` +
              `Kreativ Desk OS\n` +
              `https://www.kreativdesk.ch`
            : `Hello,\n\n${host} invites you to a live video call on Kreativ Desk OS!\n\n` +
              `🚀 MEETING DETAILS:\n` +
              `• Title: ${newCallEvent.title}\n` +
              `• Date: ${newCallEvent.date} at ${newCallEvent.time}\n` +
              `${newCallEvent.description ? `• Notes: ${newCallEvent.description}\n` : ''}` +
              `• Direct Link: ${fullMeetingUrl}\n\n` +
              `✨ NOTE FOR GUESTS:\n` +
              `No login or software download required. Simply click the link above, enter your name, and join immediately.\n\n` +
              `Best regards,\n` +
              `Kreativ Desk OS\n` +
              `https://www.kreativdesk.ch`
        );

        const mailtoUrl = `mailto:${recipients.join(',')}?subject=${subject}&body=${bodyText}`;
        setTimeout(() => {
          window.location.href = mailtoUrl;
        }, 400);

        addToast(`📩 E-Mail-Einladung an ${recipients.join(', ')} gestartet!`, 'info');
      }

      setIsScheduleModalOpen(false);
      setNewCallEvent({ title: '', date: '', time: '10:00', type: 'call', description: '', participants: [], externalEmails: [] });
      setNewCallExternalEmailInput('');
      addToast(currentLang === 'de' ? 'Video Call erfolgreich geplant!' : 'Video call scheduled successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(currentLang === 'de' ? 'Fehler beim Planen des Calls' : 'Error scheduling call', 'error');
    }
  };

  const currentProjectMembers = (companyUsers || []).filter((u: any) =>
    (projectMembers || []).some((pm: any) => pm.projectId === (projectId || activeProjectId) && pm.userId === u.id) && u.id !== currentUser?.uid
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#3b82f6');
  const [strokeWidth, setStrokeWidth] = useState(3);

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

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const executeEmailInvite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inviteUrl = `${window.location.origin}/guest-meet/${activeCallRoomId}`;
    const hostName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Kreativ Desk Team';
    const isDe = currentLang === 'de';

    const parsedEmails = targetEmail
      .split(/[,;\s\n]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    const recipientString = parsedEmails.length > 0 ? parsedEmails.join(',') : targetEmail.trim();

    const emailSubject = isDe
      ? `📹 Einladung zum Live-Videocall | Kreativ Desk OS`
      : `📹 Invitation to Live Video Call | Kreativ Desk OS`;

    const emailBody = isDe
      ? `Hallo,\n\n${hostName} lädt dich zu einem Live-Videocall auf Kreativ Desk OS ein!\n\n` +
      `📌 MEETING DETAILS:\n` +
      `• Raum-ID: ${activeCallRoomId}\n` +
      `• Direkt-Link: ${inviteUrl}\n\n` +
      `✨ HINWEIS FÜR GÄSTE:\n` +
      `Kein Login oder Software-Download erforderlich. Klicke einfach auf den Link oben, gib deinen Namen ein und tritt sofort bei.\n\n` +
      `Freundliche Grüsse,\n` +
      `Kreativ Desk OS\n` +
      `https://www.kreativdesk.ch`
      : `Hello,\n\n${hostName} invites you to a live video call on Kreativ Desk OS!\n\n` +
      `📌 MEETING DETAILS:\n` +
      `• Room ID: ${activeCallRoomId}\n` +
      `• Direct Link: ${inviteUrl}\n\n` +
      `✨ NOTE FOR GUESTS:\n` +
      `No login or software download required. Simply click the link above, enter your name, and join immediately.\n\n` +
      `Best regards,\n` +
      `Kreativ Desk OS\n` +
      `https://www.kreativdesk.ch`;

    setIsSendingEmail(true);
    try {
      if (parsedEmails.length > 0) {
        await Promise.allSettled(
          parsedEmails.map(email =>
            fetch('/api/send-invite-webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: email,
                email,
                roomUrl: inviteUrl,
                roomId: activeCallRoomId,
                senderName: hostName,
                language: currentLang,
                subject: emailSubject,
                body: emailBody,
                message: emailBody
              })
            }).catch(err => console.log("Webhook call note:", err))
          )
        );
      } else if (targetEmail.trim()) {
        await fetch('/api/send-invite-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: targetEmail.trim(),
            email: targetEmail.trim(),
            roomUrl: inviteUrl,
            roomId: activeCallRoomId,
            senderName: hostName,
            language: currentLang,
            subject: emailSubject,
            body: emailBody,
            message: emailBody
          })
        }).catch(err => console.log("Webhook call note:", err));
      }

      window.open(`mailto:${recipientString}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank');
      const count = parsedEmails.length || 1;
      addToast(
        isDe
          ? `✉️ Einladung für ${count > 1 ? `${count} Teilnehmer` : targetEmail || 'Gast'} vorbereitet & gesendet!`
          : `✉️ Invite prepared for ${count > 1 ? `${count} participants` : targetEmail || 'guest'}!`,
        'success'
      );
      setShowEmailModal(false);
      setTargetEmail('');
    } catch (err) {
      console.error("Email send error:", err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const ensureCallRegistered = async (roomId: string) => {
    try {
      const targetProjectId = projectId || activeProjectId || 'global';
      await supabase.from('video_calls').upsert({
        id: roomId,
        host_id: currentUser?.uid || 'host',
        room_name: targetProjectId,
        status: 'active',
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Pre-register video call handled:", err);
    }
  };

  const handleQuickInvite = async (mode: 'copy' | 'whatsapp' | 'email') => {
    const inviteUrl = `${window.location.origin}/guest-meet/${activeCallRoomId}`;
    const isDe = currentLang === 'de';

    await ensureCallRegistered(activeCallRoomId);

    const whatsappMsg = isDe
      ? `📹 *Einladung zum Live-Videocall (Kreativ Desk OS)*\n\nHallo! Du bist zu einem Videocall eingeladen. Klicke einfach auf den Link, um ohne Login beizutreten:\n👉 ${inviteUrl}`
      : `📹 *Invitation to Live Video Call (Kreativ Desk OS)*\n\nHello! You are invited to a video call. Simply click the link to join without login:\n👉 ${inviteUrl}`;

    try {
      navigator.clipboard.writeText(inviteUrl).catch(() => { });
    } catch (e) { }

    if (mode === 'copy') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      addToast(isDe ? '📋 Einladungs-Link kopiert!' : '📋 Invite link copied!', 'success');
    } else if (mode === 'whatsapp') {
      addToast(isDe ? '💬 WhatsApp wird geöffnet...' : '💬 Opening WhatsApp...', 'success');
      window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    } else if (mode === 'email') {
      setShowEmailModal(true);
    }
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
            <button onClick={openHistoryModal} className="px-4 py-2 bg-surface border border-border text-text-primary rounded-md text-sm font-bold hover:bg-white/5 transition-colors flex items-center gap-2 shadow-sm cursor-pointer" title="Videocall-Verlauf anzeigen">
              <History size={16} className="text-accent-ai" /> {currentLang === 'de' ? 'Historie' : 'History'}
            </button>
            <button onClick={openScheduleModal} className="tour-meet-schedule px-4 py-2 bg-surface border border-border text-text-primary rounded-md text-sm font-bold hover:bg-white/5 transition-colors flex items-center gap-2 shadow-sm">
              <Calendar size={16} /> {t('schedule_call')}
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative">

          <div className="flex-1 bg-surface border border-border/50 rounded-2xl md:rounded-3xl overflow-y-auto custom-scrollbar flex flex-col shadow-sm relative min-h-[50vh] md:min-h-0">

            {activeView === 'video' ? (
              callStatus === 'idle' ? (
                <div className="flex flex-col items-center justify-start md:justify-center min-h-full py-6 px-4 md:p-8 max-w-md mx-auto text-center animate-in zoom-in-95 pb-36 md:pb-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-accent-ai/10 text-accent-ai rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shrink-0"><Users size={36} /></div>
                  <h3 className="text-base md:text-lg font-bold text-text-primary mb-1 md:mb-2">{t('start_call')}</h3>
                  <p className="text-xs md:text-sm text-text-muted mb-4 md:mb-6 font-medium">{t('who_to_call')}</p>

                  {currentProjectMembers.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-6 md:mb-8">
                      {currentProjectMembers.map((user: any) => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <button key={user.id} onClick={() => toggleUserSelection(user.id)} className={cn("flex flex-col items-center gap-1 transition-all cursor-pointer", isSelected ? "opacity-100 scale-110" : "opacity-50 hover:opacity-80 grayscale hover:grayscale-0")}>
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white border-2", isSelected ? "border-accent-ai bg-accent-ai" : "border-border bg-surface")}>
                              {sanitizeUrl(user.avatar) ? <img src={sanitizeUrl(user.avatar)} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold text-text-muted">{user.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-center items-center gap-3 w-full mb-5">
                    <button onClick={async () => { await ensureCallRegistered(activeCallRoomId); await startCall(selectedUserIds, activeCallRoomId); }} className="w-full px-6 py-3 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <PhoneCall size={18} /> {selectedUserIds.length > 0 ? `${selectedUserIds.length} ${t('call_selected')}` : t('start_rundruf')}
                    </button>
                  </div>

                  {/* 🔥 Schnell-Teilen per WhatsApp & E-Mail für externe Partner */}
                  <div className="w-full bg-surface/50 border border-border/80 p-3.5 md:p-4 rounded-2xl space-y-3 mb-5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted flex items-center justify-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-500 shrink-0" />
                      <span>Schnell-Einladung für externe Partner & Bauherren</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleQuickInvite('copy')}
                        className="px-3 py-2.5 bg-background hover:bg-surface border border-border rounded-xl font-bold text-xs text-text-primary flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        {copiedLink ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        Link kopieren
                      </button>

                      <button
                        onClick={() => handleQuickInvite('whatsapp')}
                        className="px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        💬 WhatsApp
                      </button>

                      <button
                        onClick={() => handleQuickInvite('email')}
                        className="px-3 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        ✉️ E-Mail
                      </button>
                    </div>
                  </div>

                  <div className="relative flex items-center gap-2 w-full mb-5"><div className="flex-1 h-px bg-border/50"></div><span className="text-xs text-text-muted font-bold uppercase tracking-widest">ODER</span><div className="flex-1 h-px bg-border/50"></div></div>

                  <div className="w-full flex gap-2">
                    <input type="text" value={joinCallId} onChange={e => setJoinCallId(e.target.value)} placeholder="Meeting-ID..." className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                    <button onClick={() => joinCall()} disabled={!joinCallId.trim()} className="px-5 py-2.5 bg-surface border border-border rounded-xl font-bold text-text-primary hover:bg-white/5 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"><PhoneForwarded size={16} /> Join</button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative bg-black">
                  <div ref={mainVideoRef} className="absolute inset-0 bg-transparent z-0" />

                  <div className={cn("absolute inset-0 z-10 grid gap-1",
                    Object.keys(remoteStreams).length === 0 ? "grid-cols-1" :
                      Object.keys(remoteStreams).length === 1 ? "grid-cols-1" :
                        Object.keys(remoteStreams).length === 2 ? "grid-cols-2" :
                          Object.keys(remoteStreams).length <= 4 ? "grid-cols-2 grid-rows-2" :
                            "grid-cols-3 grid-rows-2"
                  )}>
                    {Object.entries(remoteStreams).map(([peerId, stream]) => (
                      <div key={peerId} className="w-full h-full relative overflow-hidden bg-zinc-900 border border-white/5">
                        <RemoteVideo stream={stream} />
                      </div>
                    ))}
                    {Object.keys(remoteStreams).length === 0 && (
                      <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                        <Loader2 size={40} className="animate-spin mb-4 text-accent-ai" />
                        <p className="font-bold text-sm tracking-widest uppercase text-white">Warte auf Teilnehmer...</p>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-24 right-4 w-24 h-36 md:bottom-6 md:right-6 md:w-48 md:h-32 bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl z-20 group relative">
                    {(bgMode === 'preset' || bgMode === 'custom' || bgMode === 'screensaver') && (
                      <div
                        className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-300"
                        style={{
                          backgroundImage: `url(${bgMode === 'custom' ? customBgImage : bgMode === 'screensaver' ? screensaverBg : bgImageUrl})`
                        }}
                      />
                    )}
                    <video
                      ref={(el) => {
                        localVideoRef.current = el;
                        if (el && localStream && el.srcObject !== localStream) {
                          el.srcObject = localStream;
                          el.play().catch(e => console.log("Local video play err:", e));
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className={cn(
                        "w-full h-full object-cover relative z-10 transition-all duration-300",
                        !isScreenSharing && "transform -scale-x-100",
                        (bgMode === 'preset' || bgMode === 'custom' || bgMode === 'screensaver') && "opacity-90"
                      )}
                      style={bgMode === 'blur' ? { filter: `blur(${bgBlurAmount})` } : undefined}
                    />
                    <button
                      onClick={() => setShowBgModal(true)}
                      className="absolute top-2 right-2 z-20 p-1.5 bg-black/60 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
                      title="Hintergrund wechseln"
                    >
                      <Image size={14} />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 p-2.5 rounded-2xl shadow-2xl z-30 pointer-events-auto">
                    <button onClick={toggleMic} className={cn("p-3 md:p-4 rounded-xl transition-all border", isMicOn ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700" : "bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20")} title="Mikrofon">{isMicOn ? <Mic size={20} /> : <MicOff size={20} />}</button>
                    <button onClick={toggleCam} className={cn("p-3 md:p-4 rounded-xl transition-all border", isCamOn ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700" : "bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20")} title="Kamera">{isCamOn ? <Video size={20} /> : <VideoOff size={20} />}</button>
                    <button
                      onClick={() => setShowBgModal(true)}
                      className={cn(
                        "p-3 md:p-4 rounded-xl transition-all border cursor-pointer",
                        bgMode !== 'none'
                          ? "bg-accent-ai text-white border-accent-ai shadow-lg shadow-accent-ai/20"
                          : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                      )}
                      title="Hintergrund & Weichzeichner anpassen"
                    >
                      <Image size={20} />
                    </button>
                    <button onClick={toggleScreenShare} className={cn("p-3 md:p-4 rounded-xl transition-all hidden md:block border", !isScreenSharing ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700" : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20")} title="Bildschirm teilen">{!isScreenSharing ? <MonitorUp size={20} /> : <MonitorOff size={20} />}</button>
                    <button onClick={toggleTranscription} className={cn("p-3 md:p-4 rounded-xl transition-all hidden md:block border", isTranscribing ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700")} title="Live Transkription">{isTranscribing ? <Captions size={20} className="animate-pulse" /> : <Captions size={20} />}</button>
                    <div className="w-px h-8 bg-slate-700/60 mx-1 md:mx-2"></div>
                    <button onClick={hangUp} className="px-5 py-3 md:px-6 md:py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white border border-red-500 transition-all shadow-lg shadow-red-600/30 flex items-center gap-2"><PhoneOff size={18} /> <span className="hidden md:inline">{t('leave_call')}</span></button>
                  </div>

                  {currentTranscript && (
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl text-white text-lg font-medium max-w-2xl text-center shadow-2xl z-40 pointer-events-none animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
                      {currentTranscript}
                    </div>
                  )}

                  <div className="absolute top-6 left-4 flex flex-col md:flex-row items-start md:items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 px-4 py-2.5 rounded-xl shadow-lg z-30">
                    <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Meeting ID</span><span className="text-xs md:text-sm font-mono font-bold text-white">{callId || joinCallId}</span></div>
                    <div className="w-px h-8 bg-slate-700/60 hidden md:block mx-1"></div>
                    <button onClick={() => handleQuickInvite('copy')} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-lg text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer" title="Gäste-Einladungslink kopieren">
                      {copiedLink ? <CheckCircle2 size={16} className="text-emerald-400" /> : <LinkIcon size={16} />}
                      <span className="hidden sm:inline">{copiedLink ? 'Link kopiert!' : 'Link kopieren'}</span>
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
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2"><Clock size={14} /> {t('upcoming_calls')}</h3>
              {upcomingCalls.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {upcomingCalls.slice(0, 2).map((call, idx) => (
                    <div key={idx} className="bg-surface border border-border/50 rounded-lg p-3 flex items-center justify-between shadow-sm">
                      <div>
                        <h4 className="font-bold text-text-primary text-xs">{call.title}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5 font-medium">{new Date(call.date).toLocaleDateString()} • {call.time} Uhr</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleDownloadICS(call)}
                          className="p-1.5 bg-surface hover:bg-white/10 border border-border/50 text-text-muted hover:text-text-primary rounded-md text-xs font-bold transition-colors cursor-pointer"
                          title="📅 .ics Kalenderdatei herunterladen"
                        >
                          <Calendar size={13} />
                        </button>
                        <button onClick={() => { joinCall(call.meetingLink.split('join=')[1] || null); }} className="px-3 py-1.5 bg-accent-success/10 text-accent-success hover:bg-accent-success/20 border border-accent-success/20 rounded-md text-xs font-bold transition-colors">
                          {t('join_now')}
                        </button>
                      </div>
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
                    {!!sanitizeUrl(msg.fileUrl) && (
                      <div className="mt-2 space-y-2">
                        {isImageFile(msg.fileUrl, msg.text) ? (
                          <a
                            href={sanitizeUrl(msg.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block max-w-xs group relative rounded-xl overflow-hidden border border-border/60 bg-black/20 shadow-sm transition-transform hover:scale-[1.02]"
                          >
                            <img
                              src={sanitizeUrl(msg.fileUrl)}
                              alt={msg.text || 'Angehängtes Bild'}
                              className="w-full max-h-60 object-contain rounded-xl bg-surface/40"
                              loading="lazy"
                            />
                            <div className="p-2 bg-surface/90 border-t border-border/50 text-[11px] font-bold text-accent-ai flex items-center justify-between gap-1.5">
                              <span className="truncate">{msg.text?.replace(/^Dateianhang:\s*/, '') || 'Bild ansehen'}</span>
                              <Download size={13} className="shrink-0" />
                            </div>
                          </a>
                        ) : (
                          <a
                            href={sanitizeUrl(msg.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-accent-ai hover:underline text-xs font-bold bg-accent-ai/10 px-3 py-2 rounded-xl border border-accent-ai/20 shadow-sm transition-all hover:bg-accent-ai/20"
                          >
                            <Paperclip size={14} /> {msg.text?.replace(/^Dateianhang:\s*/, '') || 'Datei ansehen / herunterladen'}
                          </a>
                        )}
                      </div>
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
                <h2 className="text-lg font-bold flex items-center gap-2 text-text-primary"><Calendar size={20} className="text-accent-ai" /> {t('schedule_video_call')}</h2>
                <button onClick={() => setIsScheduleModalOpen(false)} className="text-text-muted hover:text-text-primary bg-background p-1.5 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleScheduleCall} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('meeting_title')}</label>
                  <input type="text" value={newCallEvent.title} onChange={e => setNewCallEvent({ ...newCallEvent, title: e.target.value })} className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-ai text-text-primary font-bold" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('date')}</label>
                    <input type="date" value={newCallEvent.date} onChange={e => setNewCallEvent({ ...newCallEvent, date: e.target.value })} className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-ai text-text-primary font-bold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('time')}</label>
                    <input type="time" value={newCallEvent.time} onChange={e => setNewCallEvent({ ...newCallEvent, time: e.target.value })} className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-ai text-text-primary font-bold" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{t('description')}</label>
                  <textarea value={newCallEvent.description} onChange={e => setNewCallEvent({ ...newCallEvent, description: e.target.value })} className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-ai resize-none h-20 text-text-primary font-medium custom-scrollbar" />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Users size={14} /> {t('invite_participants')}
                  </label>

                  {/* CHIPS FOR SELECTED PARTICIPANTS (TEAM & EXTERNAL) */}
                  <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-background border border-border/50 rounded-xl mb-2">
                    {((newCallEvent.participants || []).length > 0 || (newCallEvent.externalEmails || []).length > 0) ? (
                      <>
                        {(newCallEvent.participants || []).map((pId) => {
                          const member = currentProjectMembers.find((m: any) => m.id === pId);
                          return (
                            <div key={pId} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <UserCheck size={12} />
                              <span>{member?.name || pId}</span>
                              <button
                                type="button"
                                onClick={() => setNewCallEvent(prev => ({
                                  ...prev,
                                  participants: prev.participants.filter(id => id !== pId)
                                }))}
                                className="hover:text-red-500 ml-1 p-0.5"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                        {(newCallEvent.externalEmails || []).map((email) => (
                          <div key={email} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <Mail size={12} />
                            <span>{email}</span>
                            <button
                              type="button"
                              onClick={() => setNewCallEvent(prev => ({
                                ...prev,
                                externalEmails: prev.externalEmails.filter(e => e !== email)
                              }))}
                              className="hover:text-red-500 ml-1 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <span className="text-xs text-text-muted italic p-1">
                        {currentLang === 'de' ? 'Noch keine Teilnehmer ausgewählt.' : 'No participants selected yet.'}
                      </span>
                    )}
                  </div>

                  {/* TEAM CHECKBOXES */}
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
                            {sanitizeUrl(user.avatar) ? <img src={sanitizeUrl(user.avatar)} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                          </div>
                          <p className="text-xs font-bold truncate text-text-primary">{user.name}</p>
                        </div>
                      </label>
                    ))}
                    {currentProjectMembers.length === 0 && (
                      <p className="text-xs text-text-muted p-2 col-span-full">Keine weiteren Teammitglieder im Projekt.</p>
                    )}
                  </div>

                  {/* EXTERNAL EMAIL INPUT FOR CALLS */}
                  <div className="mt-3">
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      {currentLang === 'de' ? 'Externe E-Mail-Adresse (Bauherren, Partner) hinzufügen:' : 'Add External Email Address (Clients, Partners):'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="z.B. bauherr@beispiel.ch"
                        value={newCallExternalEmailInput}
                        onChange={(e) => setNewCallExternalEmailInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCallExternalEmail();
                          }
                        }}
                        className="flex-1 bg-background border border-border/50 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent-ai text-text-primary font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddCallExternalEmail}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                      >
                        + {currentLang === 'de' ? 'Hinzufügen' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <LinkIcon size={14} /> {t('external_link')}
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

                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCallEvent.title || !newCallEvent.date) {
                        addToast(currentLang === 'de' ? 'Bitte zuerst Titel und Datum eingeben' : 'Please enter title and date first', 'error');
                        return;
                      }
                      handleDownloadICS({
                        title: newCallEvent.title,
                        date: newCallEvent.date,
                        time: newCallEvent.time,
                        description: newCallEvent.description,
                        meetingLink: `/project/${projectId || activeProjectId || 'global'}/meet?join=${generatedMeetingId}`
                      });
                    }}
                    className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Calendar size={14} /> 📅 .ics Datei
                  </button>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('cancel')}</button>
                    <button type="submit" className="px-8 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg shadow-accent-ai/20">{t('schedule')}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
        {showEmailModal && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Mail size={18} className="text-accent-ai" />
                  {currentLang === 'de' ? 'E-Mail Einladung(en) senden' : 'Send Email Invitation(s)'}
                </h3>
                <button onClick={() => setShowEmailModal(false)} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-white/5">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {currentLang === 'de'
                  ? 'Trage eine oder mehrere E-Mail-Adressen deiner Gäste/Partner ein (durch Komma, Strichpunkt oder neue Zeile getrennt):'
                  : 'Enter one or multiple email addresses for your guests/partners (separated by commas, semicolons, or newlines):'}
              </p>

              <form onSubmit={executeEmailInvite} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                      {currentLang === 'de' ? 'Empfänger E-Mail(s)' : 'Recipient Email(s)'}
                    </label>
                    {(() => {
                      const count = targetEmail
                        .split(/[,;\s\n]+/)
                        .map(e => e.trim())
                        .filter(e => e.length > 0 && e.includes('@')).length;
                      return count > 0 ? (
                        <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          ✓ {count} {currentLang === 'de' ? (count === 1 ? 'Empfänger' : 'Empfänger') : (count === 1 ? 'recipient' : 'recipients')}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <textarea
                    rows={3}
                    value={targetEmail}
                    onChange={e => setTargetEmail(e.target.value)}
                    placeholder={currentLang === 'de'
                      ? "z.B. partner1@firma.ch, partner2@firma.ch\noder eine E-Mail pro Zeile..."
                      : "e.g. partner1@example.com, partner2@example.com\nor one email per line..."}
                    className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-accent-ai outline-none transition-colors custom-scrollbar resize-none font-medium"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary rounded-xl border border-border/50 hover:bg-white/5 transition-colors"
                  >
                    {currentLang === 'de' ? 'Abbrechen' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {currentLang === 'de' ? 'Einladung(en) senden' : 'Send Invitation(s)'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
        {isHistoryModalOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border/50 rounded-3xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-ai/10 text-accent-ai rounded-xl flex items-center justify-center">
                    <History size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      {currentLang === 'de' ? 'Videocall Verlauf & Historie' : 'Video Call History'}
                    </h2>
                    <p className="text-xs text-text-muted">
                      {currentLang === 'de' ? 'Übersicht aller getätigten und geplanten Video Calls' : 'Overview of all completed and scheduled video calls'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="text-text-muted hover:text-text-primary bg-background p-2 rounded-xl transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 py-2">
                {isLoadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                    <Loader2 size={32} className="animate-spin text-accent-ai mb-2" />
                    <p className="text-xs font-bold">Historie wird geladen...</p>
                  </div>
                ) : callHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-text-muted text-center">
                    <Clock size={36} className="mb-2 opacity-50" />
                    <p className="text-sm font-bold">Noch keine Anruf-Historie vorhanden.</p>
                    <p className="text-xs text-text-muted mt-1">Getätigte und geplante Calls werden hier automatisch aufgezeichnet.</p>
                  </div>
                ) : (
                  callHistory.map((item, idx) => (
                    <div key={item.id || idx} className="bg-background border border-border/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-accent-ai/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-text-primary">{item.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-ai/10 text-accent-ai border border-accent-ai/20">
                            ID: {item.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted font-medium">
                          <span>👤 {item.callerName}</span>
                          <span>•</span>
                          <span>📅 {new Date(item.createdAt).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            const fullUrl = `${window.location.origin}${item.meetingLink}`;
                            navigator.clipboard.writeText(fullUrl);
                            addToast(currentLang === 'de' ? 'Link kopiert!' : 'Link copied!', 'success');
                          }}
                          className="p-2 bg-surface hover:bg-white/10 border border-border/50 rounded-xl text-text-muted hover:text-text-primary transition-colors text-xs font-bold cursor-pointer"
                          title="Link kopieren"
                        >
                          <Copy size={16} />
                        </button>

                        <button
                          onClick={() => handleDownloadICS({
                            title: item.title,
                            createdAt: item.createdAt,
                            meetingLink: item.meetingLink,
                            id: item.id
                          })}
                          className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="📅 .ics Kalenderdatei herunterladen"
                        >
                          <Calendar size={14} /> .ics
                        </button>

                        <button
                          onClick={() => {
                            setIsHistoryModalOpen(false);
                            const joinPart = item.meetingLink?.split('join=')[1];
                            if (joinPart) joinCall(joinPart);
                            else navigate(item.meetingLink);
                          }}
                          className="px-4 py-2 bg-accent-ai text-white rounded-xl text-xs font-bold hover:bg-accent-ai/90 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <PhoneForwarded size={14} /> Beitreten
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end shrink-0 mt-2">
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="px-6 py-2 bg-surface hover:bg-white/5 border border-border/50 text-text-primary rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {currentLang === 'de' ? 'Schliessen' : 'Close'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
        {showBgModal && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-surface border border-border/50 rounded-3xl p-6 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-ai/10 text-accent-ai rounded-xl flex items-center justify-center">
                    <Image size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      {currentLang === 'de' ? 'Kamera-Hintergrund & Weichzeichner' : 'Camera Background & Blur'}
                    </h2>
                    <p className="text-xs text-text-muted">
                      {currentLang === 'de' ? 'Wähle einen Vorlagen-Hintergrund, Weichzeichner oder lade ein eigenes Bild hoch' : 'Select a preset background, blur, or upload your own image'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowBgModal(false)} className="text-text-muted hover:text-text-primary bg-background p-2 rounded-xl transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <input type="file" ref={bgFileInputRef} accept="image/*" className="hidden" onChange={handleCustomBgUpload} />

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1 py-2">

                {/* MODES: NONE & BLUR */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Standard & Weichzeichner</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleSelectBgMode('none')}
                      className={cn("p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer", bgMode === 'none' ? "bg-accent-ai/10 border-accent-ai text-accent-ai font-bold shadow-md" : "bg-background border-border/60 text-text-muted hover:text-text-primary hover:border-border")}
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg">🚫</div>
                      <span className="text-xs text-center font-bold">Kein Effekt</span>
                    </button>

                    <button
                      onClick={() => handleSelectBgMode('blur', undefined, '8px')}
                      className={cn("p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer", bgMode === 'blur' && bgBlurAmount === '8px' ? "bg-accent-ai/10 border-accent-ai text-accent-ai font-bold shadow-md" : "bg-background border-border/60 text-text-muted hover:text-text-primary hover:border-border")}
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg backdrop-blur-sm border border-border/40">💧</div>
                      <span className="text-xs text-center font-bold">Blur Leicht</span>
                    </button>

                    <button
                      onClick={() => handleSelectBgMode('blur', undefined, '20px')}
                      className={cn("p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer", bgMode === 'blur' && bgBlurAmount === '20px' ? "bg-accent-ai/10 border-accent-ai text-accent-ai font-bold shadow-md" : "bg-background border-border/60 text-text-muted hover:text-text-primary hover:border-border")}
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg backdrop-blur-md border border-border/40">🌫️</div>
                      <span className="text-xs text-center font-bold">Blur Stark</span>
                    </button>
                  </div>
                </div>

                {/* CUSTOM UPLOAD & SCREENSAVER */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Eigenes Bild & Screensaver</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => bgFileInputRef.current?.click()}
                      className={cn("p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer relative overflow-hidden", bgMode === 'custom' ? "bg-accent-ai/10 border-accent-ai text-accent-ai font-bold shadow-md" : "bg-background border-border/60 text-text-muted hover:text-text-primary hover:border-border")}
                    >
                      {customBgImage ? (
                        <img src={customBgImage} className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-lg shrink-0">📁</div>
                      )}
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-bold text-text-primary truncate">Eigenes Bild hochladen</p>
                        <p className="text-[10px] text-text-muted mt-0.5">JPG, PNG (computer)</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        if (!screensaverBg) {
                          addToast(currentLang === 'de' ? 'Kein Screensaver-Bild in den Einstellungen hinterlegt' : 'No screensaver background set in settings', 'info');
                          return;
                        }
                        handleSelectBgMode('screensaver', screensaverBg);
                      }}
                      className={cn("p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer relative overflow-hidden", bgMode === 'screensaver' ? "bg-accent-ai/10 border-accent-ai text-accent-ai font-bold shadow-md" : "bg-background border-border/60 text-text-muted hover:text-text-primary hover:border-border")}
                    >
                      {screensaverBg ? (
                        <img src={screensaverBg} className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-lg shrink-0">🖥️</div>
                      )}
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-bold text-text-primary truncate">Screensaver Bild</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Firmen-Hintergrund</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* PRESET GALLERY */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Architektur & Studio Templates</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'alpine', name: 'Schweizer Alpen', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=80', icon: '🏔️' },
                      { id: 'loft', name: 'Glas Loft', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', icon: '🏛️' },
                      { id: 'studio', name: 'Architektur Studio', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80', icon: '🏢' },
                      { id: 'dark_luxury', name: 'Dark Luxury', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80', icon: '🌌' },
                      { id: 'minimalist', name: 'Minimalist Atelier', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80', icon: '🎨' }
                    ].map(preset => {
                      const isSelected = bgMode === 'preset' && bgImageUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectBgMode('preset', preset.url)}
                          className={cn(
                            "group relative rounded-2xl overflow-hidden border transition-all cursor-pointer h-24 flex flex-col justify-end p-2.5",
                            isSelected ? "border-accent-ai ring-2 ring-accent-ai/40 shadow-lg" : "border-border/60 hover:border-border"
                          )}
                        >
                          <img src={preset.url} alt={preset.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="relative z-10 flex items-center justify-between text-white">
                            <span className="text-xs font-bold truncate flex items-center gap-1">
                              <span>{preset.icon}</span> {preset.name}
                            </span>
                            {isSelected && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end shrink-0 mt-2">
                <button
                  onClick={() => setShowBgModal(false)}
                  className="px-6 py-2.5 bg-accent-ai text-white rounded-xl text-xs font-bold hover:bg-accent-ai/90 transition-colors shadow-md cursor-pointer"
                >
                  {currentLang === 'de' ? 'Übernehmen & Schliessen' : 'Apply & Close'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </motion.div>
    </div>
  );
}
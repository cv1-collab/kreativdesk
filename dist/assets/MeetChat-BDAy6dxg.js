import { j as jsxRuntimeExports, am as Monitor, m as motion, V as Video, P as PenTool, an as MessageSquare, d as Calendar, ao as PhoneOff, ap as Phone, aq as Eraser, T as Trash2, ar as MicOff, as as Mic, at as MonitorUp, L as LoaderCircle, au as FileCheck, av as ChevronRight, K as Clock, g as Sparkles, X, F as FileText, aw as Paperclip, a5 as Send } from './vendor-ui-B7yEkTas.js';
import { h as useParams, u as useNavigate, r as reactExports, d as reactDomExports } from './vendor-core-egDwzlzP.js';
import { a as useAuth, g as useToast, u as useLanguage, i as useVideoCall, f as db, c as cn } from './index-CYJ5UA-3.js';
import { a as callGeminiEmbedAPI, c as callGeminiAPI } from './geminiClient-B27RHJ_Z.js';
import { q as query, H as orderBy, k as where, j as collection, m as onSnapshot, s as setDoc, e as doc, A as serverTimestamp, l as getDocs } from './vendor-firebase-CKkb2kaw.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';

const localTranslations = {
  en: {
    meet_chat_title: "Meet & Chat",
    meet_chat_desc: "Live video collaboration and project chat.",
    live_collaboration: "Live Collaboration",
    weekly_coordination: "Weekly Coordination & Planning",
    schedule_call: "Schedule Call",
    leave_call: "Leave Call",
    join_call: "Join Call",
    video: "Video",
    whiteboard: "Whiteboard",
    ready_to_join: "Ready to join?",
    join_weekly_meeting: "Start an instant meeting or join an upcoming call.",
    project_chat: "Project Chat",
    ai_summary: "AI Summary",
    type_message: "Type your message...",
    schedule_video_call: "Schedule Video Call",
    meeting_title: "Meeting Title",
    date: "Date",
    time: "Time",
    description: "Description",
    cancel: "Cancel",
    schedule: "Schedule",
    upcoming_calls: "Upcoming Calls",
    no_upcoming_calls: "No upcoming calls.",
    join_now: "Join Now",
    mobile_blocked_title: "Desktop Only Feature",
    mobile_blocked_desc: "Video calls and live collaboration are only available on desktop devices to ensure a stable connection and optimal performance. Please open Kreativ-Desk on your computer."
  },
  de: {
    meet_chat_title: "Meet & Chat",
    meet_chat_desc: "Live-Video-Kollaboration und Projekt-Chat.",
    live_collaboration: "Live Kollaboration",
    weekly_coordination: "Wöchentliche Koordination & Planung",
    schedule_call: "Call planen",
    leave_call: "Call verlassen",
    join_call: "Call beitreten",
    video: "Video",
    whiteboard: "Whiteboard",
    ready_to_join: "Bereit zur Teilnahme?",
    join_weekly_meeting: "Starte ein Meeting oder nimm an einem geplanten Call teil.",
    project_chat: "Projekt Chat",
    ai_summary: "KI Zusammenfassung",
    type_message: "Nachricht schreiben...",
    schedule_video_call: "Video Call planen",
    meeting_title: "Meeting Titel",
    date: "Datum",
    time: "Zeit",
    description: "Beschreibung",
    cancel: "Abbrechen",
    schedule: "Planen",
    upcoming_calls: "Bevorstehende Video Calls",
    no_upcoming_calls: "Keine geplanten Calls vorhanden.",
    join_now: "Teilnehmen",
    mobile_blocked_title: "Nur auf Desktop verfügbar",
    mobile_blocked_desc: "Video-Calls und das Live-Whiteboard sind auf Smartphones und Tablets deaktiviert, um Verbindungsabbrüche zu verhindern. Bitte öffne Kreativ-Desk an deinem Computer."
  }
};
function MeetChat() {
  const { projectId } = useParams();
  useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const { isInCall, setIsInCall, setIsMinimized, setIsChatOpen, setPlaceholderElement } = useVideoCall();
  const [activeView, setActiveView] = reactExports.useState("video");
  const [showChat, setShowChat] = reactExports.useState(() => window.innerWidth >= 1024);
  const [isGeneratingSummary, setIsGeneratingSummary] = reactExports.useState(false);
  const [meetingSummary, setMeetingSummary] = reactExports.useState(null);
  const [messages, setMessages] = reactExports.useState([]);
  const [upcomingCalls, setUpcomingCalls] = reactExports.useState([]);
  const [newMessage, setNewMessage] = reactExports.useState("");
  const [isAITyping, setIsAITyping] = reactExports.useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = reactExports.useState(false);
  const [newCallEvent, setNewCallEvent] = reactExports.useState({ title: "", date: "", time: "10:00", type: "call", description: "" });
  const [isMuted, setIsMuted] = reactExports.useState(false);
  const messagesEndRef = reactExports.useRef(null);
  const mainVideoRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (setIsChatOpen) setIsChatOpen(showChat);
  }, [showChat, setIsChatOpen]);
  const handleVideoRef = reactExports.useCallback((node) => {
    mainVideoRef.current = node;
    if (activeView === "video") {
      setPlaceholderElement(node);
    }
  }, [activeView, setPlaceholderElement]);
  reactExports.useEffect(() => {
    if (activeView === "video") {
      setPlaceholderElement(mainVideoRef.current);
    } else {
      setPlaceholderElement(null);
    }
  }, [activeView, setPlaceholderElement]);
  reactExports.useEffect(() => {
    if (isInCall && activeView !== "video") setIsMinimized(true);
    if (isInCall && activeView === "video") setIsMinimized(false);
  }, [activeView, isInCall, setIsMinimized]);
  reactExports.useEffect(() => {
    return () => {
      if (setIsMinimized) setIsMinimized(true);
      if (setIsChatOpen) setIsChatOpen(false);
      setPlaceholderElement(null);
    };
  }, [setIsMinimized, setIsChatOpen, setPlaceholderElement]);
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.companyId) return;
    const q = query(
      collection(db, "chatMessages"),
      where("companyId", "==", currentUser.companyId),
      where("projectId", "==", projectId || "global"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = [];
      snapshot.forEach((doc2) => {
        const data = doc2.data();
        fetchedMessages.push({
          id: doc2.id,
          sender: data.sender || "Unknown",
          avatar: data.avatar || "U",
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: data.text,
          isAI: data.isAI,
          reference: data.reference,
          createdAt: data.createdAt
        });
      });
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [currentUser, projectId]);
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.companyId) return;
    const q = query(
      collection(db, "calendarEvents"),
      where("companyId", "==", currentUser.companyId),
      where("type", "==", "call")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map((doc2) => doc2.data()).filter((c) => c.projectId === (projectId || "global") || c.projectId === "internal").sort((a, b) => (/* @__PURE__ */ new Date(`${a.date}T${a.time}`)).getTime() - (/* @__PURE__ */ new Date(`${b.date}T${b.time}`)).getTime());
      const relevantCalls = calls.filter((c) => {
        const callTime = (/* @__PURE__ */ new Date(`${c.date}T${c.time}`)).getTime();
        return callTime >= Date.now() - 2 * 60 * 60 * 1e3;
      });
      setUpcomingCalls(relevantCalls);
    });
    return () => unsubscribe();
  }, [currentUser, projectId]);
  const canvasRef = reactExports.useRef(null);
  const canvasContainerRef = reactExports.useRef(null);
  const [isDrawing, setIsDrawing] = reactExports.useState(false);
  const [strokeColor, setStrokeColor] = reactExports.useState("#3b82f6");
  const [strokeWidth, setStrokeWidth] = reactExports.useState(3);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  reactExports.useEffect(() => {
    scrollToBottom();
  }, [messages, isAITyping]);
  reactExports.useEffect(() => {
    if (activeView === "whiteboard" && canvasRef.current && canvasContainerRef.current) {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeView]);
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  };
  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !db || !currentUser?.companyId) return;
    const userMessage = newMessage;
    const senderName = currentUser?.email?.split("@")[0] || "User";
    const avatarInitials = senderName.substring(0, 2).toUpperCase();
    setNewMessage("");
    try {
      const msgId = `msg-${Date.now()}`;
      await setDoc(doc(db, "chatMessages", msgId), {
        id: msgId,
        sender: senderName,
        avatar: avatarInitials,
        senderId: currentUser.uid,
        companyId: currentUser.companyId,
        projectId: projectId || "global",
        timestamp: Date.now(),
        text: userMessage,
        createdAt: serverTimestamp()
      });
      if (userMessage.toLowerCase().includes("@ai") || userMessage.includes("?")) {
        setIsAITyping(true);
        let knowledgeContext = "";
        try {
          const queryEmbeddingResult = await callGeminiEmbedAPI("gemini-embedding-2-preview", [userMessage]);
          const queryEmbedding = queryEmbeddingResult.embeddings?.[0]?.values;
          const q = query(collection(db, "knowledgeDocs"), where("companyId", "==", currentUser.companyId));
          const querySnapshot = await getDocs(q);
          const docs = querySnapshot.docs.map((doc2) => doc2.data());
          if (docs.length > 0 && queryEmbedding) {
            const allChunks = [];
            docs.forEach((doc2) => {
              if (doc2.chunks && Array.isArray(doc2.chunks)) {
                doc2.chunks.forEach((chunk) => {
                  if (chunk.embedding) {
                    let dotProduct = 0, normA = 0, normB = 0;
                    for (let i = 0; i < queryEmbedding.length; i++) {
                      dotProduct += queryEmbedding[i] * chunk.embedding[i];
                      normA += queryEmbedding[i] * queryEmbedding[i];
                      normB += chunk.embedding[i] * chunk.embedding[i];
                    }
                    allChunks.push({ text: chunk.text, title: doc2.title, score: normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) });
                  }
                });
              } else if (doc2.content) {
                allChunks.push({ text: doc2.content.substring(0, 1500), title: doc2.title, score: 0.5 });
              }
            });
            allChunks.sort((a, b) => b.score - a.score);
            const topChunks = allChunks.slice(0, 3);
            if (topChunks.length > 0) {
              knowledgeContext = `

Relevant Knowledge Base Excerpts:
${topChunks.map((c) => `--- Document: ${c.title} ---
${c.text}
`).join("\n")}`;
            }
          }
        } catch (err) {
        }
        const context = messages.map((m) => `${m.sender}: ${m.text}`).join("\n");
        const prompt = `You are the "AI Concierge" for Kreativ-Desk OS. You are participating in a live project chat.
        ${knowledgeContext}
        Recent chat history:
        ${context}
        You: ${userMessage}
        Provide a helpful, concise response. If you reference a document, include a reference tag at the end: [REF: Document Name].`;
        const response = await callGeminiAPI("gemini-2.5-flash", prompt);
        let responseText = response.text || "I am here to help.";
        let reference = void 0;
        const refMatch = responseText.match(/\[REF:\s*(.*?)\]/);
        if (refMatch) {
          reference = refMatch[1];
          responseText = responseText.replace(refMatch[0], "").trim();
        }
        const aiMsgId = `msg-${Date.now()}`;
        await setDoc(doc(db, "chatMessages", aiMsgId), {
          id: aiMsgId,
          sender: "AI Concierge",
          avatar: "AI",
          senderId: currentUser.uid,
          companyId: currentUser.companyId,
          projectId: projectId || "global",
          timestamp: Date.now(),
          text: responseText,
          isAI: true,
          reference: reference || null,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
    } finally {
      setIsAITyping(false);
    }
  };
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const context = messages.map((m) => `${m.sender}: ${m.text}`).join("\n");
      const prompt = `Based on the following meeting chat transcript, generate a concise meeting summary with 3 bullet points of Action Items. 
      Format as clean text without markdown asterisks if possible, just use bullet points (-).
      Transcript:
      ${context}`;
      const response = await callGeminiAPI("gemini-2.5-flash", prompt);
      setMeetingSummary(response.text || "Summary generated.");
      setShowChat(true);
    } catch (error) {
      setMeetingSummary("Failed to generate summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  const handleScheduleCall = async (e) => {
    e.preventDefault();
    if (!newCallEvent.title || !newCallEvent.date || !currentUser || !currentUser.companyId || !db) return;
    try {
      const eventId = `evt-${Date.now()}`;
      const targetProjectId = projectId || "internal";
      await setDoc(doc(db, "calendarEvents", eventId), {
        ...newCallEvent,
        type: "call",
        id: eventId,
        ownerId: currentUser.uid,
        companyId: currentUser.companyId,
        projectId: targetProjectId,
        timestamp: (/* @__PURE__ */ new Date(`${newCallEvent.date}T${newCallEvent.time}`)).getTime(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        meetingLink: `/project/${targetProjectId}/meet?room=${Date.now()}`
      });
      setIsScheduleModalOpen(false);
      setNewCallEvent({ title: "", date: "", time: "10:00", type: "call", description: "" });
      const msgId = `msg-${Date.now()}`;
      const sysMsgText = language === "de" ? `Ein neuer Video-Call "${newCallEvent.title}" wurde für den ${newCallEvent.date} um ${newCallEvent.time} Uhr geplant.` : `A new video call "${newCallEvent.title}" has been scheduled for ${newCallEvent.date} at ${newCallEvent.time}.`;
      await setDoc(doc(db, "chatMessages", msgId), {
        id: msgId,
        sender: "System",
        avatar: "SYS",
        senderId: currentUser.uid,
        companyId: currentUser.companyId,
        projectId: projectId || "global",
        timestamp: Date.now(),
        text: sysMsgText,
        createdAt: serverTimestamp()
      });
      addToast(t("schedule") + " " + t("completed"), "success");
    } catch (err) {
      console.error("Failed to schedule call", err);
      addToast(t("upload_failed"), "error");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col h-full bg-background relative overflow-hidden text-text-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center flex-1 min-h-[70vh] py-12 px-6 text-center lg:hidden animate-in fade-in z-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 shadow-inner shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "w-12 h-12" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-text-primary mb-3 tracking-tight", children: t("mobile_blocked_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted max-w-md leading-relaxed font-medium", children: t("mobile_blocked_desc") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "hidden lg:flex flex-1 flex-col min-h-0 space-y-4 h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 overflow-x-auto pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: t("live_collaboration") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm mt-1", children: t("weekly_coordination") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-surface border border-border rounded-lg p-1 shadow-sm shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveView("video"), className: cn("px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2", activeView === "video" ? "bg-accent-ai/10 text-accent-ai" : "text-text-muted hover:text-text-primary"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { size: 16 }),
            " ",
            t("video")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveView("whiteboard"), className: cn("px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2", activeView === "whiteboard" ? "bg-accent-ai/10 text-accent-ai" : "text-text-muted hover:text-text-primary"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PenTool, { size: 16 }),
            " ",
            t("whiteboard")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowChat(!showChat), className: cn("p-2 rounded-lg border transition-colors", showChat ? "bg-accent-ai/20 border-accent-ai/30 text-accent-ai" : "bg-surface border-border text-text-muted hover:text-text-primary"), title: t("project_chat"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-border mx-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsScheduleModalOpen(true), className: "px-4 py-2 bg-surface border border-border text-text-primary rounded-md text-sm font-bold hover:bg-white/5 transition-colors flex items-center gap-2 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 16 }),
            " ",
            t("schedule_call")
          ] }),
          isInCall ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsInCall(false), className: "px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-sm font-bold hover:bg-red-500/20 transition-colors shadow-sm flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneOff, { size: 16 }),
            " ",
            t("leave_call")
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            setIsInCall(true);
            setActiveView("video");
          }, className: "px-4 py-2 bg-accent-success/10 border border-accent-success/20 text-accent-success rounded-md text-sm font-bold hover:bg-accent-success/20 transition-colors shadow-sm flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 16 }),
            " ",
            t("join_call")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col md:flex-row gap-4 min-h-0 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 bg-black border border-border rounded-xl relative overflow-hidden flex flex-col shadow-lg min-h-[50vh] md:min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: handleVideoRef, className: "absolute inset-0 bg-transparent z-0" }),
            !isInCall && activeView === "video" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex flex-col z-10 bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative flex flex-col items-center justify-center p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-background border border-border flex items-center justify-center mb-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { size: 36, className: "text-text-muted" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-medium text-text-primary mb-2", children: t("ready_to_join") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted mb-8 max-w-sm text-center", children: t("join_weekly_meeting") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsInCall(true), className: "px-8 py-3 bg-accent-success text-white rounded-lg font-bold hover:bg-accent-success/90 transition-colors shadow-lg shadow-accent-success/20 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 20 }),
                " ",
                t("join_now")
              ] })
            ] }) }),
            activeView === "whiteboard" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: canvasContainerRef, className: "absolute inset-0 bg-surface [background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden z-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 left-4 z-30 bg-background/80 backdrop-blur-md border border-border rounded-lg p-2 flex flex-col gap-2 shadow-xl", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2 border-b border-border pb-2", children: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#71717a"].map((color) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                  setStrokeColor(color);
                  setStrokeWidth(3);
                }, className: cn("w-6 h-6 rounded-full border-2 transition-transform hover:scale-110", strokeColor === color && strokeWidth !== 20 ? "border-text-primary scale-110" : "border-transparent"), style: { backgroundColor: color } }, color)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                  setStrokeColor("var(--color-surface)");
                  setStrokeWidth(20);
                }, className: cn("p-2 rounded-md transition-colors flex items-center justify-center", strokeWidth === 20 ? "bg-white/10 text-text-primary" : "text-text-muted hover:bg-white/5 hover:text-text-primary"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eraser, { size: 18 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearCanvas, className: "p-2 rounded-md text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 18 }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, onPointerDown: startDrawing, onPointerMove: draw, onPointerUp: stopDrawing, onPointerOut: stopDrawing, className: "absolute inset-0 w-full h-full cursor-crosshair touch-none" })
            ] })
          ] }),
          !isInCall && activeView === "video" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-border rounded-full px-6 py-3 flex items-center gap-4 shadow-lg z-30 pointer-events-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsMuted(!isMuted), className: cn("w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm", isMuted ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-background border border-border text-text-primary hover:bg-white/5"), children: isMuted ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-12 h-12 rounded-full bg-background border border-border hover:bg-white/5 flex items-center justify-center text-text-primary transition-all shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-12 h-12 rounded-full bg-background border border-border hover:bg-white/5 flex items-center justify-center text-text-primary transition-all shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MonitorUp, { size: 20 }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("bg-surface border border-border rounded-xl flex flex-col shrink-0 transition-all duration-300 relative z-40 shadow-lg", showChat ? "h-[40vh] md:h-auto md:w-96 opacity-100" : "h-0 md:w-0 opacity-0 overflow-hidden border-none"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between bg-surface/50 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 16, className: "text-text-muted" }),
              " ",
              t("project_chat")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleGenerateSummary, disabled: isGeneratingSummary, className: "px-3 py-1.5 bg-accent-ai/10 text-accent-ai rounded-md text-xs font-bold hover:bg-accent-ai/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm", children: [
                isGeneratingSummary ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck, { size: 12 }),
                " ",
                t("ai_summary")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowChat(false), className: "text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 bg-background/30 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14 }),
              " ",
              t("upcoming_calls")
            ] }),
            upcomingCalls.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: upcomingCalls.slice(0, 2).map((call, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-lg p-3 flex items-center justify-between shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-text-primary text-xs", children: call.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-text-muted mt-0.5 font-medium", children: [
                  new Date(call.date).toLocaleDateString(),
                  " • ",
                  call.time,
                  " Uhr"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                setIsInCall(true);
                setActiveView("video");
              }, className: "px-3 py-1.5 bg-accent-success/10 text-accent-success hover:bg-accent-success/20 border border-accent-success/20 rounded-md text-xs font-bold transition-colors", children: t("join_now") })
            ] }, idx)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted italic", children: t("no_upcoming_calls") })
          ] }),
          meetingSummary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m-4 p-4 bg-accent-ai/10 border border-accent-ai/20 rounded-xl relative animate-in fade-in slide-in-from-top-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -top-3 left-4 bg-surface px-2 text-xs font-bold text-accent-ai flex items-center gap-1 border border-border rounded-full shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
              " ",
              t("ai_summary")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMeetingSummary(null), className: "absolute top-2 right-2 text-text-muted hover:text-text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-text-primary whitespace-pre-wrap mt-2", children: meetingSummary })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar", children: [
            messages.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex gap-3 animate-in fade-in slide-in-from-bottom-2", msg.isAI ? "bg-accent-ai/5 border border-accent-ai/20 p-3 rounded-xl" : ""), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium shadow-sm", msg.isAI ? "bg-accent-ai text-white" : "bg-background border border-border"), children: msg.isAI ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14 }) : msg.avatar }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-sm font-bold", msg.isAI ? "text-accent-ai" : "text-text-primary"), children: msg.sender }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-text-muted", children: msg.time })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mt-1 leading-relaxed whitespace-pre-wrap font-medium", children: msg.text }),
                msg.reference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-flex items-center gap-1.5 bg-background border border-border rounded-md px-2 py-1 text-xs font-medium text-text-primary hover:bg-white/5 transition-colors cursor-pointer shadow-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 12, className: "text-accent-ai" }),
                  " ",
                  msg.reference
                ] })
              ] })
            ] }, msg.id)),
            isAITyping && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 bg-accent-ai/5 border border-accent-ai/20 p-3 rounded-xl animate-in fade-in", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-accent-ai text-white flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce", style: { animationDelay: "0ms" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce", style: { animationDelay: "150ms" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce", style: { animationDelay: "300ms" } })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-border bg-surface/50 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSendMessage, className: "relative flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "absolute left-3 text-text-muted hover:text-text-primary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 18 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newMessage, onChange: (e) => setNewMessage(e.target.value), placeholder: t("type_message"), className: "w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-12 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-ai/50 transition-all placeholder:text-text-muted shadow-sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !newMessage.trim() || isAITyping, className: "absolute right-2 p-1.5 bg-accent-ai text-white rounded-md hover:bg-accent-ai/90 transition-colors disabled:opacity-50 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14 }) })
          ] }) })
        ] })
      ] }),
      isScheduleModalOpen && typeof document !== "undefined" && reactDomExports.createPortal(
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6 border-b border-border pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 20, className: "text-accent-ai" }),
              " ",
              t("schedule_video_call")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsScheduleModalOpen(false), className: "text-text-muted hover:text-text-primary bg-background p-1.5 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleScheduleCall, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1", children: t("meeting_title") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newCallEvent.title, onChange: (e) => setNewCallEvent({ ...newCallEvent, title: e.target.value }), className: "w-full bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-ai/50 text-text-primary font-bold", required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1", children: t("date") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: newCallEvent.date, onChange: (e) => setNewCallEvent({ ...newCallEvent, date: e.target.value }), className: "w-full bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-ai/50 text-text-primary font-bold", required: true })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1", children: t("time") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "time", value: newCallEvent.time, onChange: (e) => setNewCallEvent({ ...newCallEvent, time: e.target.value }), className: "w-full bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-ai/50 text-text-primary font-bold", required: true })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1", children: t("description") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: newCallEvent.description, onChange: (e) => setNewCallEvent({ ...newCallEvent, description: e.target.value }), className: "w-full bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-ai/50 resize-none h-20 text-text-primary font-bold" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 flex justify-end gap-3 border-t border-border mt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsScheduleModalOpen(false), className: "px-4 py-2 border border-transparent hover:border-border rounded-md text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("cancel") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "px-6 py-2 bg-accent-ai text-white rounded-md text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg", children: t("schedule") })
            ] })
          ] })
        ] }) }),
        document.body
        // Rendert das Modal ganz ans Ende des HTML-Dokuments
      )
    ] })
  ] });
}

export { MeetChat as default };

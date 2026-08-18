import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useVideoCall } from '../contexts/VideoCallContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, PhoneForwarded, Loader2, Users, MonitorUp, MonitorOff, Paperclip, Download, Calendar, Image, CheckCircle2, X } from 'lucide-react';
import { cn, sanitizeUrl } from '../utils';
import { uploadFileWithFallback } from '../utils/cloudStorageHelper';
import { downloadICSFile } from '../utils/icsGenerator';

const isImageFile = (url?: string, text?: string): boolean => {
  if (!url && !text) return false;
  const target = (url || '') + (text || '');
  return /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(target) || (url?.startsWith('data:image/') ?? false);
};

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
          video.play().catch(() => {});
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
  return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover relative z-10" />;
};

export default function GuestMeet() {
  const { joinId } = useParams<{ joinId: string }>();
  const navigate = useNavigate();
  const [guestName, setGuestName] = useState(() => localStorage.getItem('kreativdesk_guest_name') || '');
  const [guestEmail, setGuestEmail] = useState('');
  const [meetingCompanyId, setMeetingCompanyId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const [showBgModal, setShowBgModal] = useState(false);
  const [bgMode, setBgMode] = useState<'none' | 'blur' | 'preset' | 'custom'>(() => (localStorage.getItem('guest_bg_mode') as any) || 'none');
  const [bgBlurAmount, setBgBlurAmount] = useState<string>(() => localStorage.getItem('guest_bg_blur') || '12px');
  const [bgImageUrl, setBgImageUrl] = useState<string>(() => localStorage.getItem('guest_bg_image') || '');
  const [customBgImage, setCustomBgImage] = useState<string>(() => localStorage.getItem('guest_custom_bg') || '');

  const handleSelectBgMode = (mode: 'none' | 'blur' | 'preset' | 'custom', url?: string, blur?: string) => {
    setBgMode(mode);
    localStorage.setItem('guest_bg_mode', mode);
    if (blur) { setBgBlurAmount(blur); localStorage.setItem('guest_bg_blur', blur); }
    if (url) { setBgImageUrl(url); localStorage.setItem('guest_bg_image', url); }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = (reader.result as string) || '';
      setCustomBgImage(result);
      localStorage.setItem('guest_custom_bg', result);
      handleSelectBgMode('custom', result);
    };
    reader.readAsDataURL(file);
  };

  const {
    localStream, remoteStreams, isMicOn, isCamOn, callStatus,
    joinCall, hangUp, toggleMic, toggleCam, setJoinCallId, isInCall,
    toggleScreenShare: contextToggleScreenShare
  } = useVideoCall();

  const handleToggleScreenShare = async () => {
    try {
      if (contextToggleScreenShare) {
        await contextToggleScreenShare();
        setIsScreenSharing(prev => !prev);
      } else if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
      } else {
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  // Validate Meeting ID
  useEffect(() => {
    if (!joinId) {
      setTimeout(() => {
        setError('Ungültiger Meeting-Link.');
      }, 0);
      return;
    }
    setTimeout(() => {
      setJoinCallId(joinId);
    }, 0);
    
    // Check if meeting exists
    const checkMeeting = async () => {
      try {
        const { data: callDoc, error: fetchErr } = await supabase
          .from('video_calls')
          .select('*')
          .eq('id', joinId)
          .maybeSingle();

        if (fetchErr) {
          console.warn("Supabase video_calls query info:", fetchErr);
        }

        if (callDoc) {
          setMeetingCompanyId(callDoc.company_id || null);
          setError('');
        } else {
          if (joinId && joinId.length >= 3) {
            try {
              await supabase.from('video_calls').upsert({
                id: joinId,
                project_id: 'global',
                company_id: 'guest',
                caller_name: 'Guest Room',
                created_at: new Date().toISOString()
              });
            } catch (e) {
              console.warn("Guest room upsert handled:", e);
            }
            setError('');
          } else {
            setError('Dieses Meeting existiert nicht oder wurde bereits beendet.');
          }
        }
      } catch (err) {
        console.error("Guest meeting check error:", err);
        if (joinId && joinId.length >= 3) {
          setError('');
        } else {
          setError('Fehler beim Abrufen des Meetings.');
        }
      }
    };
    checkMeeting();
  }, [joinId, setJoinCallId]);

  // Subscribe to chat
  useEffect(() => {
    if (!isJoined || !joinId) return;
    
    const fetchChat = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('call_id', joinId)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data.map(d => ({
          id: d.id,
          sender: d.sender_name || d.sender || 'Gast',
          avatar: (d.sender_name || d.sender || 'G').substring(0, 2).toUpperCase(),
          time: new Date(d.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: d.message || d.text,
          fileUrl: d.file_url || d.fileUrl
        })));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };
    fetchChat();

    // Supabase Realtime channel subscription for instant broadcast & db changes
    const channel = supabase
      .channel(`chat_messages_${joinId}`)
      .on('broadcast', { event: 'new_chat_msg' }, ({ payload }) => {
        if (payload && payload.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.id)) return prev;
            return [...prev, {
              id: payload.id,
              sender: payload.sender || payload.sender_name || 'Gast',
              avatar: payload.avatar || (payload.sender || 'G').substring(0, 2).toUpperCase(),
              time: payload.time || new Date(payload.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: payload.text || payload.message,
              fileUrl: payload.fileUrl || payload.file_url
            }];
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `call_id=eq.${joinId}` }, (payload) => {
        const d = payload.new;
        if (d) {
          setMessages(prev => {
            if (prev.some(m => m.id === d.id)) return prev;
            return [...prev, {
              id: d.id,
              sender: d.sender_name || d.sender || 'Gast',
              avatar: (d.sender_name || d.sender || 'G').substring(0, 2).toUpperCase(),
              time: new Date(d.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: d.message || d.text,
              fileUrl: d.file_url || d.fileUrl
            }];
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [isJoined, joinId]);

  // Handle Video Streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn(e));
    }
  }, [localStream]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || error) return;
    localStorage.setItem('kreativdesk_guest_name', guestName);
    setIsJoined(true);
    await joinCall(joinId);

    // Lead Capture (Optional)
    if (meetingCompanyId && guestEmail.trim()) {
      try {
        await supabase.from('leads').insert({
          first_name: guestName,
          email: guestEmail,
          status: 'New',
          source: 'Video Call Guest',
          company_id: meetingCompanyId,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to save lead:', err);
      }
    }
  };

  const handleGuestFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !joinId) return;

    setIsUploadingFile(true);
    try {
      const url = await uploadFileWithFallback(file, file.name, 'guest', 'chat_attachments');
      const msgId = `msg-${Date.now()}`;
      const text = `Dateianhang: ${file.name}`;
      const msgObj = {
        id: msgId,
        sender: guestName || 'Gast',
        avatar: (guestName || 'G').substring(0, 2).toUpperCase(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: text,
        fileUrl: url
      };

      setMessages(prev => [...prev, msgObj]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      supabase.channel(`chat_messages_${joinId}`).send({
        type: 'broadcast',
        event: 'new_chat_msg',
        payload: msgObj
      }).catch(() => {});

      await supabase.from('chat_messages').insert({
        id: msgId,
        call_id: joinId,
        sender_id: 'guest-' + Date.now(),
        sender_name: guestName || 'Gast',
        message: text,
        file_url: url,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Guest file upload error:", err);
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !joinId) return;
    
    const text = newMessage;
    setNewMessage('');
    const msgId = `msg-${Date.now()}`;
    
    const msgObj = {
      id: msgId,
      sender: guestName,
      avatar: guestName.substring(0, 2).toUpperCase(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };

    // Optimistic UI Update
    setMessages(prev => [...prev, msgObj]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // Broadcast in real-time to all connected peers
    supabase.channel(`chat_messages_${joinId}`).send({
      type: 'broadcast',
      event: 'new_chat_msg',
      payload: msgObj
    }).catch(() => {});

    try {
      const { error: err1 } = await supabase.from('chat_messages').insert({
        id: msgId,
        call_id: joinId,
        sender_id: 'guest-' + Date.now(),
        sender_name: guestName,
        message: text,
        created_at: new Date().toISOString()
      });

      if (err1) {
        console.warn("Primary insert warning, trying fallback:", err1.message);
        try {
          await supabase.from('chat_messages').insert({
            id: msgId + '-fb',
            call_id: joinId,
            sender_id: 'guest-' + Date.now(),
            sender: guestName,
            text: text,
            created_at: new Date().toISOString()
          });
        } catch (fbErr) {
          console.error("Fallback insert error:", fbErr);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleLeave = () => {
    hangUp();
    navigate('/');
  };

  if (!isJoined) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border p-8 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 bg-accent-ai/10 text-accent-ai rounded-full flex items-center justify-center mb-6">
            <Users size={40} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Gast-Teilnahme</h2>
          <p className="text-sm text-text-muted text-center mb-8">
            Du wurdest zu einem Kreativ Desk Meeting eingeladen.
            Bitte gib deinen Namen ein, um beizutreten.
          </p>

          {error ? (
            <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center mb-6">
              {error}
            </div>
          ) : (
            <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
              <input
                type="text"
                placeholder="Dein Name..."
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                required
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-accent-ai outline-none font-bold text-text-primary"
              />
              <input
                type="email"
                placeholder="Deine E-Mail (optional für Updates)"
                value={guestEmail}
                onChange={e => setGuestEmail(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-accent-ai outline-none font-medium text-text-primary"
              />
              <button
                type="submit"
                disabled={!guestName.trim()}
                className="w-full py-3 bg-accent-ai text-white rounded-xl font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <PhoneForwarded size={18} /> Beitreten
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Video Area */}
      <div className="flex-1 relative bg-black flex flex-col">
        {callStatus === 'calling' ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 size={40} className="text-accent-ai animate-spin mb-4" />
            <p className="text-white font-bold tracking-widest uppercase text-sm">Verbinde...</p>
          </div>
        ) : (
          <>
            <div className={cn("absolute inset-0 z-10 grid gap-1", 
              Object.keys(remoteStreams).length <= 1 ? "grid-cols-1" :
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
                  <p className="font-bold text-sm tracking-widest uppercase text-white">Warte auf Gastgeber...</p>
                </div>
              )}
            </div>
            <div className="absolute bottom-24 right-4 w-24 h-36 md:bottom-6 md:right-6 md:w-48 md:h-32 bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl z-20 group relative">
              {(bgMode === 'preset' || bgMode === 'custom') && (
                <div
                  className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-300"
                  style={{
                    backgroundImage: `url(${bgMode === 'custom' ? customBgImage : bgImageUrl})`
                  }}
                />
              )}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover relative z-10 transform -scale-x-100 transition-all duration-300",
                  (bgMode === 'preset' || bgMode === 'custom') && "opacity-90"
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
          </>
        )}

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 p-2.5 rounded-2xl shadow-2xl z-30">
          <button onClick={toggleMic} className={cn("p-3 md:p-4 rounded-xl transition-all border", isMicOn ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700" : "bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20")} title="Mikrofon Umschalten">
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button onClick={toggleCam} className={cn("p-3 md:p-4 rounded-xl transition-all border", isCamOn ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700" : "bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20")} title="Kamera Umschalten">
            {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
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
          <button onClick={handleToggleScreenShare} className={cn("p-3 md:p-4 rounded-xl transition-all border", isScreenSharing ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700")} title="Bildschirm Teilen">
            {isScreenSharing ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
          </button>
          <button
            onClick={() => {
              const meetingUrl = window.location.href;
              downloadICSFile([{
                title: `📹 Kreativ Desk Video Call (${joinId || 'Room'})`,
                description: `Direkt-Link zum Meeting: ${meetingUrl}`,
                startDate: new Date().toISOString().split('T')[0],
                startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                url: meetingUrl,
                location: 'Kreativ Desk OS (Online Meeting)'
              }], `Meeting_${joinId || 'Room'}`);
            }}
            className="p-3 md:p-4 rounded-xl transition-all border bg-slate-800 hover:bg-slate-700 text-white border-slate-700 cursor-pointer hidden sm:block"
            title="📅 .ics Kalenderdatei herunterladen"
          >
            <Calendar size={20} />
          </button>
          <div className="w-px h-8 bg-slate-700/60 mx-1 md:mx-2"></div>
          <button onClick={handleLeave} className="px-5 py-3 md:px-6 md:py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white border border-red-500 transition-all shadow-lg shadow-red-600/30 flex items-center gap-2">
            <PhoneOff size={18} /> <span className="hidden md:inline">Verlassen</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-full md:w-80 lg:w-96 bg-surface border-l border-border flex flex-col h-[40vh] md:h-full">
        <div className="p-4 border-b border-border/50 bg-background/50 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-sm text-text-primary uppercase tracking-widest">Meeting Chat</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs">
              Keine Nachrichten bisher.
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.sender === guestName ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-[10px] font-bold text-text-muted">{msg.sender}</span>
                  <span className="text-[9px] text-text-muted/50">{msg.time}</span>
                </div>
                <div className={cn("px-4 py-2.5 rounded-2xl text-sm font-medium", msg.sender === guestName ? "bg-accent-ai text-white rounded-br-sm" : "bg-background border border-border/50 text-text-primary rounded-bl-sm")}>
                  <div>{msg.text}</div>
                  {!!sanitizeUrl(msg.fileUrl) && (
                    <div className="mt-2">
                      {isImageFile(msg.fileUrl, msg.text) ? (
                        <a
                          href={sanitizeUrl(msg.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block max-w-xs group relative rounded-xl overflow-hidden border border-white/20 bg-black/30 shadow-md transition-transform hover:scale-[1.02]"
                        >
                          <img
                            src={sanitizeUrl(msg.fileUrl)}
                            alt={msg.text || 'Angehängtes Bild'}
                            className="w-full max-h-56 object-contain rounded-xl bg-black/40"
                            loading="lazy"
                          />
                          <div className="p-1.5 bg-black/70 backdrop-blur-sm text-[11px] font-bold text-white flex items-center justify-between gap-2">
                            <span className="truncate">{msg.text?.replace(/^Dateianhang:\s*/, '') || 'Bild ansehen'}</span>
                            <Download size={12} className="shrink-0" />
                          </div>
                        </a>
                      ) : (
                        <a
                          href={sanitizeUrl(msg.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold underline opacity-90 hover:opacity-100"
                        >
                          <Paperclip size={14} /> {msg.text?.replace(/^Dateianhang:\s*/, '') || 'Datei herunterladen'}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-background/50 border-t border-border/50">
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleGuestFileAttachment} />
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
              className="absolute left-3 text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
              title="Datei anhängen"
            >
              {isUploadingFile ? <Loader2 size={18} className="animate-spin text-accent-ai" /> : <Paperclip size={18} />}
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Nachricht schreiben..."
              disabled={isUploadingFile}
              className="w-full bg-surface border border-border/50 rounded-xl pl-10 pr-12 py-3 text-sm focus:border-accent-ai outline-none font-medium text-text-primary shadow-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isUploadingFile}
              className="absolute right-2 p-2 bg-accent-ai text-white rounded-lg disabled:opacity-50 disabled:bg-surface disabled:text-text-muted hover:bg-accent-ai/90 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

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
                    Kamera-Hintergrund & Weichzeichner
                  </h2>
                  <p className="text-xs text-text-muted">
                    Wähle einen Vorlagen-Hintergrund, Weichzeichner oder lade ein eigenes Bild hoch
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

              {/* CUSTOM UPLOAD */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Eigenes Bild</label>
                <button
                  onClick={() => bgFileInputRef.current?.click()}
                  className={cn("w-full p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer relative overflow-hidden", bgMode === 'custom' ? "bg-accent-ai/10 border-accent-ai text-accent-ai font-bold shadow-md" : "bg-background border-border/60 text-text-muted hover:text-text-primary hover:border-border")}
                >
                  {customBgImage ? (
                    <img src={customBgImage} className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-lg shrink-0">📁</div>
                  )}
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-bold text-text-primary truncate">Eigenes Hintergrund-Bild hochladen</p>
                    <p className="text-[10px] text-text-muted mt-0.5">JPG, PNG vom Computer auswählen</p>
                  </div>
                </button>
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
                Übernehmen & Schliessen
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

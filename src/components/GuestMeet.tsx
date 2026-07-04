import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, setDoc, doc, serverTimestamp, getDoc, addDoc } from 'firebase/firestore';
import { useVideoCall } from '../contexts/VideoCallContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, PhoneForwarded, Loader2, Users } from 'lucide-react';
import { cn } from '../utils';

export default function GuestMeet() {
  const { joinId } = useParams<{ joinId: string }>();
  const navigate = useNavigate();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [meetingCompanyId, setMeetingCompanyId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const {
    localStream, remoteStream, isMicOn, isCamOn, callStatus,
    joinCall, hangUp, toggleMic, toggleCam, setJoinCallId, isInCall
  } = useVideoCall();

  // Validate Meeting ID
  useEffect(() => {
    if (!joinId) {
      setError('Ungültiger Meeting-Link.');
      return;
    }
    setJoinCallId(joinId);
    
    // Check if meeting exists
    const checkMeeting = async () => {
      try {
        const callDoc = await getDoc(doc(db, 'videoCalls', joinId));
        if (!callDoc.exists()) {
          setError('Dieses Meeting existiert nicht oder wurde bereits beendet.');
        } else {
          setMeetingCompanyId(callDoc.data().companyId || null);
        }
      } catch (err) {
        console.error(err);
        setError('Fehler beim Abrufen des Meetings.');
      }
    };
    checkMeeting();
  }, [joinId, setJoinCallId]);

  // Subscribe to chat
  useEffect(() => {
    if (!isJoined || !joinId) return;
    
    const q = query(collection(db, `videoCalls/${joinId}/chatMessages`), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          sender: data.sender || 'Unknown',
          avatar: data.avatar || 'U',
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: data.text
        };
      }));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    
    return () => unsubscribe();
  }, [isJoined, joinId]);

  // Handle Video Streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn(e));
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn(e));
    }
  }, [remoteStream, callStatus]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || error) return;
    setIsJoined(true);
    await joinCall(joinId);

    // Lead Capture (Optional)
    if (meetingCompanyId && guestEmail.trim()) {
      try {
        await addDoc(collection(db, 'companyUsers'), {
          firstName: guestName,
          lastName: '',
          email: guestEmail,
          company: '',
          phone: '',
          isExternal: true,
          status: 'lead',
          source: 'Video Call',
          companyId: meetingCompanyId,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to save lead:', err);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !joinId) return;
    
    const text = newMessage;
    setNewMessage('');
    
    try {
      const msgId = `msg-${Date.now()}`;
      await setDoc(doc(db, `videoCalls/${joinId}/chatMessages`, msgId), {
        id: msgId,
        sender: guestName,
        avatar: guestName.substring(0, 2).toUpperCase(),
        senderId: 'guest-' + Date.now(),
        timestamp: Date.now(),
        text,
        createdAt: serverTimestamp(),
        isGuest: true
      });
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
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover relative z-10" />
            <div className="absolute bottom-24 right-4 w-24 h-36 md:bottom-6 md:right-6 md:w-48 md:h-32 bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl z-20">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
            </div>
          </>
        )}

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-background/90 backdrop-blur-xl border border-border/50 p-2 rounded-2xl shadow-2xl z-30">
          <button onClick={toggleMic} className={cn("p-3 md:p-4 rounded-xl transition-all", isMicOn ? "bg-surface hover:bg-white/10 text-white" : "bg-red-500 text-white shadow-lg")}>
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button onClick={toggleCam} className={cn("p-3 md:p-4 rounded-xl transition-all", isCamOn ? "bg-surface hover:bg-white/10 text-white" : "bg-red-500 text-white shadow-lg")}>
            {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <div className="w-px h-8 bg-border/50 mx-1 md:mx-2"></div>
          <button onClick={handleLeave} className="px-4 py-3 md:px-6 md:py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg flex items-center gap-2">
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
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-background/50 border-t border-border/50">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Nachricht schreiben..."
              className="w-full bg-surface border border-border/50 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-accent-ai outline-none font-medium text-text-primary shadow-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 p-2 bg-accent-ai text-white rounded-lg disabled:opacity-50 disabled:bg-surface disabled:text-text-muted hover:bg-accent-ai/90 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

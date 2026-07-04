import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoCall } from '../contexts/VideoCallContext';
import { useProject } from '../contexts/ProjectContext';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Maximize2, PhoneCall } from 'lucide-react';
import { cn } from '../utils';

export function GlobalVideoPlayer() {
  const navigate = useNavigate();
  const {
    remoteStream, localStream,
    isInCall, isMinimized, setIsMinimized,
    isMicOn, isCamOn,
    toggleMic, toggleCam, hangUp,
    incomingCall, setIncomingCall, joinCall
  } = useVideoCall();

  const { activeProjectId } = useProject();

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isMinimized && remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn(e));
    }
  }, [isMinimized, remoteStream]);

  useEffect(() => {
    if (isMinimized && localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn(e));
    }
  }, [isMinimized, localStream]);

  // ==========================================
  // 🔥 NEU: Der "Ringing" Modus (Eingehender Anruf)
  // ==========================================
  const handleAcceptCall = () => {
    if (!incomingCall) return;
    const targetId = incomingCall.id;
    const targetProject = incomingCall.projectId;

    setIncomingCall(null); // Popup schließen
    navigate(`/project/${targetProject}/meet`); // Ins richtige Projekt navigieren

    // Kurze Verzögerung, damit die UI sauber aufbauen kann, bevor WebRTC startet
    setTimeout(() => {
      joinCall(targetId);
    }, 500);
  };

  if (incomingCall && !isInCall) {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 z-[100] overflow-hidden flex flex-col animate-in slide-in-from-right-8 fade-in duration-500">
        <div className="p-6 flex flex-col items-center text-center relative overflow-hidden bg-background">
          {/* Pulsierender Hintergrund-Effekt */}
          <div className="absolute inset-0 bg-accent-ai/10 animate-pulse"></div>
          
          <div className="w-16 h-16 bg-accent-ai rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.4)] z-10 animate-bounce">
            <PhoneCall size={28} className="text-white" />
          </div>
          <h4 className="text-white font-bold text-lg z-10">{incomingCall.callerName}</h4>
          <p className="text-text-muted text-sm z-10 mt-1 font-medium">Startet einen Projekt-Call</p>
        </div>
        
        <div className="flex border-t border-white/5 bg-zinc-900">
          <button 
            onClick={() => setIncomingCall(null)} 
            className="flex-1 py-4 text-red-500 text-sm font-bold hover:bg-white/5 transition-colors border-r border-white/5"
          >
            Ablehnen
          </button>
          <button 
            onClick={handleAcceptCall} 
            className="flex-1 py-4 text-emerald-500 text-sm font-bold hover:bg-white/5 transition-colors"
          >
            Beitreten
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // Der normale PiP Modus (Aktiver, minimierter Anruf)
  // ==========================================
  if (!isInCall || !isMinimized) return null;

  const handleMaximize = () => {
    setIsMinimized(false);
    const projectId = activeProjectId || window.location.pathname.split('/')[2];
    navigate(`/project/${projectId}/meet`);
  };

  return (
    <div className="fixed bottom-6 right-6 w-72 md:w-80 h-48 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 z-[100] overflow-hidden flex flex-col group animate-in slide-in-from-bottom-5 fade-in duration-300">
      
      <video ref={remoteVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      
      <div className="absolute bottom-4 right-4 w-20 h-28 bg-black rounded-xl overflow-hidden shadow-lg border border-white/10">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
      </div>

      <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-black/80 to-transparent flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleMaximize} className="p-2 bg-black/50 hover:bg-accent-ai rounded-lg text-white backdrop-blur-sm transition-all shadow-md">
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity items-center">
        <button onClick={toggleMic} className={cn("p-2 rounded-lg backdrop-blur-sm transition-colors", isMicOn ? "bg-black/50 text-white hover:bg-black/80" : "bg-red-500 text-white")}>
          {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
        </button>
        <button onClick={toggleCam} className={cn("p-2 rounded-lg backdrop-blur-sm transition-colors", isCamOn ? "bg-black/50 text-white hover:bg-black/80" : "bg-red-500 text-white")}>
          {isCamOn ? <VideoIcon size={16} /> : <VideoOff size={16} />}
        </button>
        <button onClick={hangUp} className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white ml-auto shadow-lg transition-colors">
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
}
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';

const servers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:global.relay.metered.ca:80', username: '24338600', credential: 'KreativDesk2026!' },
    { urls: 'turn:global.relay.metered.ca:443', username: '24338600', credential: 'KreativDesk2026!' }
  ]
};

interface IncomingCall {
  id: string;
  projectId: string;
  callerName: string;
  targetUserIds?: string[];
}

interface VideoCallContextType {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  screenStream: MediaStream | null;
  isMicOn: boolean;
  isCamOn: boolean;
  isScreenSharing: boolean;
  callStatus: 'idle' | 'calling' | 'connected';
  callId: string;
  joinCallId: string;
  setJoinCallId: (id: string) => void;
  
  startCall: (targetUserIds?: string[], customCallId?: string) => Promise<void>; 
  joinCall: (overrideId?: string | null) => Promise<void>; 
  hangUp: () => void;
  toggleMic: () => void;
  toggleCam: () => void;
  toggleScreenShare: () => Promise<void>;
  
  isInCall: boolean;
  isMinimized: boolean;
  setIsMinimized: (val: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (val: boolean) => void;

  incomingCall: IncomingCall | null;
  setIncomingCall: (call: IncomingCall | null) => void;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) throw new Error('useVideoCall must be used within a VideoCallProvider');
  return context;
};

export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { activeProjectId } = useProject();
  const { addToast } = useToast();
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const [callId, setCallId] = useState('');
  const [joinCallId, setJoinCallId] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');

  const [isMinimized, setIsMinimized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  const isInCall = callStatus !== 'idle';
  
  // Mesh Network Refs
  const [initialMyId] = useState(() => `guest_${Math.random().toString(36).substring(2, 9)}`);
  const myIdRef = useRef<string>(initialMyId);
  const pcsRef = useRef<Record<string, RTCPeerConnection>>({});
  const unsubSignalsRef = useRef<(() => void) | null>(null);
  const unsubParticipantsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (currentUser?.uid) {
      myIdRef.current = currentUser.uid;
    }
  }, [currentUser]);

  const safeCompanyId = currentUser?.companyId || (currentUser?.uid ? currentUser.uid : '');

  // INTELLIGENTER LISTENER FÜR ZIELGERICHTETE ANRUFE
  useEffect(() => {
    if (!safeCompanyId || !currentUser?.uid) return;

    const channel = supabase
      .channel(`company-calls-${safeCompanyId}`)
      .on('broadcast', { event: 'incoming-call' }, ({ payload }) => {
        if (payload.callerId !== currentUser.uid) {
          const isTargeted = payload.targetUserIds && payload.targetUserIds.length > 0;
          const amITargeted = isTargeted && payload.targetUserIds.includes(currentUser.uid);
          if (!isTargeted || amITargeted) {
            setIncomingCall({
              id: payload.callId,
              projectId: payload.projectId,
              callerName: payload.callerName || 'Ein Teammitglied',
              targetUserIds: payload.targetUserIds || []
            });
          }
        }
      })
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [safeCompanyId, currentUser?.uid]);

  const setupMediaSources = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Media Error:", error);
      addToast("Kamera oder Mikrofon blockiert.", "error");
      return null;
    }
  };

  const toggleMic = () => { if (localStream) { localStream.getAudioTracks().forEach(t => t.enabled = !isMicOn); setIsMicOn(!isMicOn); } };
  const toggleCam = () => { if (localStream) { localStream.getVideoTracks().forEach(t => t.enabled = !isCamOn); setIsCamOn(!isCamOn); } };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const screenTrack = displayStream.getVideoTracks()[0];
        
        Object.values(pcsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        setScreenStream(displayStream);
        setIsScreenSharing(true);
        screenTrack.onended = () => stopScreenShare();
      } catch (err) { console.error("Screen share aborted", err); }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStream) { screenStream.getTracks().forEach(t => t.stop()); setScreenStream(null); }
    setIsScreenSharing(false);
    if (localStream) {
      const camTrack = localStream.getVideoTracks()[0];
      if (camTrack) {
        Object.values(pcsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(camTrack);
        });
      }
    }
  };

  const activeChannelRef = useRef<any>(null);

  const createPeerConnection = (peerId: string, currentCallId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(servers);
    pcsRef.current[peerId] = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && activeChannelRef.current) {
        activeChannelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            from: myIdRef.current,
            to: peerId,
            type: 'candidate',
            candidate: event.candidate.toJSON()
          }
        });
      }
    };

    return pc;
  };

  const joinMeshNetwork = async (currentCallId: string, stream: MediaStream) => {
    const myId = myIdRef.current;
    
    const channel = supabase.channel(`call_${currentCallId}`);
    activeChannelRef.current = channel;

    channel
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        if (payload.to !== myId) return;
        const peerId = payload.from;
        let pc = pcsRef.current[peerId];

        if (payload.type === 'offer') {
          if (!pc) pc = createPeerConnection(peerId, currentCallId, stream);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({
            type: 'broadcast',
            event: 'signal',
            payload: {
              from: myId,
              to: peerId,
              type: 'answer',
              answer: { sdp: answer.sdp, type: answer.type }
            }
          });
        } else if (payload.type === 'answer') {
          if (pc && pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          }
        } else if (payload.type === 'candidate') {
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(console.error);
        }
      })
      .on('broadcast', { event: 'join' }, async ({ payload }) => {
        const peerId = payload.peerId;
        if (peerId !== myId && !pcsRef.current[peerId]) {
          if (myId > peerId) {
            const pc = createPeerConnection(peerId, currentCallId, stream);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            channel.send({
              type: 'broadcast',
              event: 'signal',
              payload: {
                from: myId,
                to: peerId,
                type: 'offer',
                offer: { sdp: offer.sdp, type: offer.type }
              }
            });
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'join',
            payload: { peerId: myId }
          });
        }
      });
  };

  const startCall = async (targetUserIds: string[] = [], customCallId?: string) => {
    const stream = await setupMediaSources();
    if (!stream) return;

    const currentProjectId = activeProjectId || window.location.pathname.split('/')[2];
    const currentCallId = customCallId || `call-${Date.now()}`;

    setCallId(currentCallId);
    setCallStatus('connected');
    setIsMinimized(false);

    try {
      await supabase.from('video_calls').upsert({ 
        id: currentCallId,
        project_id: currentProjectId || 'global', 
        company_id: safeCompanyId, 
        caller_name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Teammitglied',
        caller_id: currentUser?.uid,
        created_at: new Date().toISOString() 
      });
    } catch (vcErr) {
      console.warn("video_calls upsert fallback handled:", vcErr);
    }

    await joinMeshNetwork(currentCallId, stream);
  };

  const joinCall = async (overrideId?: string | null) => {
    const targetId = overrideId || joinCallId;
    if (!targetId || !targetId.trim()) return;
    
    const stream = await setupMediaSources();
    if (!stream) return;

    setCallId(targetId);
    setCallStatus('connected');
    setIsMinimized(false);

    await joinMeshNetwork(targetId, stream);
  };

  const hangUp = () => {
    Object.values(pcsRef.current).forEach(pc => pc.close());
    pcsRef.current = {};

    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    Object.values(remoteStreams).forEach(stream => stream.getTracks().forEach(t => t.stop()));
    
    setLocalStream(null); 
    setRemoteStreams({}); 
    setScreenStream(null);
    setIsScreenSharing(false); 
    setCallStatus('idle'); 
    setCallId(''); 
    setJoinCallId(''); 
    setIsMinimized(false);

    if (activeChannelRef.current) {
      activeChannelRef.current.unsubscribe();
      activeChannelRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      hangUp();
    };
  }, []);

  return (
    <VideoCallContext.Provider value={{
      localStream, remoteStreams, screenStream, isMicOn, isCamOn, isScreenSharing,
      callStatus, callId, joinCallId, setJoinCallId, startCall, joinCall, hangUp, toggleMic, toggleCam, toggleScreenShare,
      isInCall, isMinimized, setIsMinimized, isChatOpen, setIsChatOpen, incomingCall, setIncomingCall
    }}>
      {children}
    </VideoCallContext.Provider>
  );
};
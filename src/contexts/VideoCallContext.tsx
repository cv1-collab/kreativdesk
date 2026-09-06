/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';

const servers: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10
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
  peerInfo: Record<string, { name: string; avatar?: string }>;
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
  hangUp: (endForAll?: boolean | unknown) => void;
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
  const [peerInfo, setPeerInfo] = useState<Record<string, { name: string; avatar?: string }>>({});
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
  const pcsRemoteStreamsRef = useRef<Record<string, MediaStream>>({});
  const unsubSignalsRef = useRef<(() => void) | null>(null);
  const unsubParticipantsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (currentUser?.uid) {
      myIdRef.current = currentUser.uid;
    }
  }, [currentUser]);

  const getMyDisplayName = () => {
    return (
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      localStorage.getItem('kreativdesk_guest_name') ||
      'Teilnehmer'
    );
  };

  const getMyAvatar = () => {
    const name = getMyDisplayName();
    return (name || 'T').substring(0, 2).toUpperCase();
  };

  const safeCompanyId = currentUser?.companyId || (currentUser?.uid ? currentUser.uid : '');

  // INTELLIGENTER LISTENER FÜR ZIELGERICHTETE ANRUFE
  useEffect(() => {
    if (!safeCompanyId || !currentUser?.uid || currentUser?.uid === 'demo-user-id') return;

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
    if (!navigator?.mediaDevices?.getUserMedia) {
      addToast("Kamera oder Mikrofon wird auf diesem Gerät nicht unterstützt.", "info");
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (error: any) {
      console.warn("Media access not allowed or unavailable:", error?.message || error);
      addToast("Kamera oder Mikrofon Zugriff nicht gestattet.", "info");
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
  const iceCandidateQueueRef = useRef<Record<string, RTCIceCandidateInit[]>>({});

  const processIceQueue = async (peerId: string, pc: RTCPeerConnection) => {
    const queue = iceCandidateQueueRef.current[peerId];
    if (queue && queue.length > 0) {
      for (const candidate of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("Queued ICE candidate error:", e);
        }
      }
      iceCandidateQueueRef.current[peerId] = [];
    }
  };

  const cleanUpPeer = (peerId: string) => {
    if (pcsRef.current[peerId]) {
      try {
        pcsRef.current[peerId].close();
      } catch (e) {}
      delete pcsRef.current[peerId];
    }
    delete iceCandidateQueueRef.current[peerId];
    delete pcsRemoteStreamsRef.current[peerId];
    setRemoteStreams(prev => {
      if (!prev[peerId]) return prev;
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    setPeerInfo(prev => {
      if (!prev[peerId]) return prev;
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    adjustMeshBandwidth();
  };

  const adjustMeshBandwidth = () => {
    const peerCount = Object.keys(pcsRef.current).length;
    // Dynamic bitrate targets per peer:
    // 1-2 peers (up to 3 total participants): 1200 kbps (HD 720p)
    // 3-4 peers (4-5 total participants): 450 kbps (SD 480p 30fps) -> 1.8 Mbps total upload
    // 5+ peers (6+ total participants): 300 kbps (360p 30fps) -> 1.5 Mbps total upload
    const targetBitrate = peerCount <= 2 ? 1200000 : peerCount <= 4 ? 450000 : 300000;

    Object.values(pcsRef.current).forEach(pc => {
      pc.getSenders().forEach(sender => {
        if (sender.track?.kind === 'video') {
          try {
            const params = sender.getParameters();
            if (!params.encodings || params.encodings.length === 0) {
              params.encodings = [{}];
            }
            params.encodings[0].maxBitrate = targetBitrate;
            sender.setParameters(params).catch(() => {});
          } catch (e) {}
        }
      });
    });
  };

  const createPeerConnection = (peerId: string, currentCallId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(servers);
    pcsRef.current[peerId] = pc;

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    setTimeout(adjustMeshBandwidth, 400);

    pc.ontrack = (event) => {
      let incomingStream: MediaStream;
      if (event.streams && event.streams[0]) {
        incomingStream = event.streams[0];
      } else {
        const existing = pcsRemoteStreamsRef.current[peerId];
        if (existing) {
          existing.addTrack(event.track);
          incomingStream = existing;
        } else {
          incomingStream = new MediaStream([event.track]);
        }
      }
      pcsRemoteStreamsRef.current[peerId] = incomingStream;
      setRemoteStreams(prev => ({ ...prev, [peerId]: incomingStream }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && activeChannelRef.current) {
        activeChannelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            from: myIdRef.current,
            fromName: getMyDisplayName(),
            fromAvatar: getMyAvatar(),
            to: peerId,
            type: 'candidate',
            candidate: event.candidate.toJSON()
          }
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        console.warn(`[WebRTC] ICE Connection failed for ${peerId}, attempting ICE restart...`);
        try {
          if (typeof (pc as any).restartIce === 'function') {
            (pc as any).restartIce();
          }
        } catch (e) {
          console.error("ICE restart error:", e);
        }
      } else if (pc.iceConnectionState === 'closed') {
        cleanUpPeer(peerId);
      } else if (pc.iceConnectionState === 'disconnected') {
        setTimeout(() => {
          if (pcsRef.current[peerId] && pcsRef.current[peerId].iceConnectionState === 'disconnected') {
            cleanUpPeer(peerId);
          }
        }, 4000);
      }
    };

    return pc;
  };

  const joinMeshNetwork = async (currentCallId: string, stream: MediaStream) => {
    const myId = myIdRef.current;
    const myName = getMyDisplayName();
    const myAvatar = getMyAvatar();
    
    const channel = supabase.channel(`call_${currentCallId}`, {
      config: { presence: { key: myId } }
    });
    activeChannelRef.current = channel;

    const initiateOfferToPeer = async (peerId: string) => {
      if (peerId !== myId && !pcsRef.current[peerId]) {
        try {
          const pc = createPeerConnection(peerId, currentCallId, stream);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: 'broadcast',
            event: 'signal',
            payload: {
              from: myId,
              fromName: myName,
              fromAvatar: myAvatar,
              to: peerId,
              type: 'offer',
              offer: { sdp: offer.sdp, type: offer.type }
            }
          });
        } catch (err) {
          console.error(`Error creating WebRTC offer for ${peerId}:`, err);
        }
      }
    };

    channel
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        if (payload.to !== myId) return;
        const peerId = payload.from;
        if (payload.fromName) {
          setPeerInfo(prev => ({ ...prev, [peerId]: { name: payload.fromName, avatar: payload.fromAvatar } }));
        }

        let pc = pcsRef.current[peerId];

        if (payload.type === 'offer') {
          if (!pc || pc.signalingState === 'closed') {
            pc = createPeerConnection(peerId, currentCallId, stream);
          }
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          await processIceQueue(peerId, pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({
            type: 'broadcast',
            event: 'signal',
            payload: {
              from: myId,
              fromName: myName,
              fromAvatar: myAvatar,
              to: peerId,
              type: 'answer',
              answer: { sdp: answer.sdp, type: answer.type }
            }
          });
        } else if (payload.type === 'answer') {
          if (pc && pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
            await processIceQueue(peerId, pc);
          }
        } else if (payload.type === 'candidate') {
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(console.error);
          } else {
            if (!iceCandidateQueueRef.current[peerId]) {
              iceCandidateQueueRef.current[peerId] = [];
            }
            iceCandidateQueueRef.current[peerId].push(payload.candidate);
          }
        }
      })
      .on('broadcast', { event: 'join' }, async ({ payload }) => {
        const peerId = payload.peerId;
        if (payload.name) {
          setPeerInfo(prev => ({ ...prev, [peerId]: { name: payload.name, avatar: payload.avatar } }));
        }
        if (peerId !== myId && !pcsRef.current[peerId] && myId < peerId) {
          await initiateOfferToPeer(peerId);
        }
      })
      .on('broadcast', { event: 'leave' }, ({ payload }) => {
        if (payload?.peerId) {
          cleanUpPeer(payload.peerId);
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        Object.entries(presenceState).forEach(([peerId, presences]: [string, any]) => {
          if (presences && presences[0]) {
            const p = presences[0];
            if (p.name) {
              setPeerInfo(prev => ({ ...prev, [peerId]: { name: p.name, avatar: p.avatar } }));
            }
          }
          if (peerId !== myId && !pcsRef.current[peerId]) {
            if (myId < peerId) {
              initiateOfferToPeer(peerId);
            }
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        if (Array.isArray(leftPresences)) {
          leftPresences.forEach((p: any) => {
            const peerId = p.peerId || p.key;
            if (peerId) cleanUpPeer(peerId);
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ peerId: myId, name: myName, avatar: myAvatar, joinedAt: Date.now() });
          channel.send({
            type: 'broadcast',
            event: 'join',
            payload: { peerId: myId, name: myName, avatar: myAvatar }
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
        host_id: currentUser?.uid || 'user',
        room_name: currentProjectId || 'global', 
        status: 'active',
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

  const hangUp = (endForAll?: boolean | unknown) => {
    const shouldEndForAll = endForAll === true;
    const myId = myIdRef.current;
    if (activeChannelRef.current) {
      try {
        activeChannelRef.current.send({
          type: 'broadcast',
          event: 'leave',
          payload: { peerId: myId }
        }).catch(() => {});
      } catch (e) {}
      try {
        activeChannelRef.current.untrack().catch(() => {});
        activeChannelRef.current.unsubscribe();
      } catch (e) {}
      activeChannelRef.current = null;
    }

    if (callId && shouldEndForAll) {
      try {
        Promise.resolve(supabase.from('video_calls').update({ status: 'ended' }).eq('id', callId)).catch(() => {});
      } catch (e) {}
    }

    Object.values(pcsRef.current).forEach(pc => {
      try { pc.close(); } catch (e) {}
    });
    pcsRef.current = {};
    pcsRemoteStreamsRef.current = {};
    iceCandidateQueueRef.current = {};

    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    Object.values(remoteStreams).forEach(stream => stream.getTracks().forEach(t => t.stop()));
    
    setLocalStream(null); 
    setRemoteStreams({}); 
    setPeerInfo({});
    setScreenStream(null);
    setIsScreenSharing(false); 
    setCallStatus('idle'); 
    setCallId(''); 
    setJoinCallId(''); 
    setIsMinimized(false);
  };

  useEffect(() => {
    return () => {
      hangUp(false);
    };
  }, []);

  return (
    <VideoCallContext.Provider value={{
      localStream, remoteStreams, peerInfo, screenStream, isMicOn, isCamOn, isScreenSharing,
      callStatus, callId, joinCallId, setJoinCallId, startCall, joinCall, hangUp, toggleMic, toggleCam, toggleScreenShare,
      isInCall, isMinimized, setIsMinimized, isChatOpen, setIsChatOpen, incomingCall, setIncomingCall
    }}>
      {children}
    </VideoCallContext.Provider>
  );
};
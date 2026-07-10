/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, onSnapshot, setDoc, getDoc, query, where, deleteDoc } from 'firebase/firestore';

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
  const myIdRef = useRef<string>(`guest_${Math.random().toString(36).substring(2, 9)}`);
  const pcsRef = useRef<Record<string, RTCPeerConnection>>({});
  const unsubSignalsRef = useRef<(() => void) | null>(null);
  const unsubParticipantsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (currentUser?.uid) {
      myIdRef.current = currentUser.uid;
    }
  }, [currentUser]);

  const safeCompanyId = currentUser?.companyId || (currentUser?.uid ? `comp_${currentUser.uid}` : '');

  // INTELLIGENTER LISTENER FÜR ZIELGERICHTETE ANRUFE
  useEffect(() => {
    if (!safeCompanyId || !currentUser?.uid) return;
    const mountTime = Date.now();
    const q = query(collection(db, 'videoCalls'), where('companyId', '==', safeCompanyId));

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (!data.createdAt) return;
          const callTime = new Date(data.createdAt).getTime();

          if (callTime > mountTime - 10000 && data.callerId !== currentUser.uid) {
            const isTargeted = data.targetUserIds && data.targetUserIds.length > 0;
            const amITargeted = isTargeted && data.targetUserIds.includes(currentUser.uid);

            if (!isTargeted || amITargeted) {
              setIncomingCall({
                id: change.doc.id,
                projectId: data.projectId,
                callerName: data.callerName || 'Ein Teammitglied',
                targetUserIds: data.targetUserIds || []
              });
            }
          }
        }
      });
    });
    return () => unsub();
  }, [safeCompanyId, currentUser?.uid]);

  const setupMediaSources = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Media Error:", error);
      alert("Kamera oder Mikrofon blockiert.");
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

  const createPeerConnection = (peerId: string, currentCallId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(servers);
    pcsRef.current[peerId] = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(collection(db, `videoCalls/${currentCallId}/signals`), {
          from: myIdRef.current,
          to: peerId,
          type: 'candidate',
          candidate: event.candidate.toJSON(),
          createdAt: new Date().toISOString()
        });
      }
    };

    return pc;
  };

  const joinMeshNetwork = async (currentCallId: string, stream: MediaStream) => {
    const myId = myIdRef.current;
    
    // Join participants list
    await setDoc(doc(db, `videoCalls/${currentCallId}/participants`, myId), {
      joinedAt: new Date().toISOString()
    });

    // Listen to signals directed at me
    const q = query(collection(db, `videoCalls/${currentCallId}/signals`), where('to', '==', myId));
    unsubSignalsRef.current = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          const peerId = data.from;
          let pc = pcsRef.current[peerId];

          if (data.type === 'offer') {
            if (!pc) pc = createPeerConnection(peerId, currentCallId, stream);
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await addDoc(collection(db, `videoCalls/${currentCallId}/signals`), {
              from: myId,
              to: peerId,
              type: 'answer',
              answer: { sdp: answer.sdp, type: answer.type },
              createdAt: new Date().toISOString()
            });
          } else if (data.type === 'answer') {
            if (pc && pc.signalingState !== 'stable') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
          } else if (data.type === 'candidate') {
            if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.error);
          }
        }
      }
    });

    // Listen for new participants
    unsubParticipantsRef.current = onSnapshot(collection(db, `videoCalls/${currentCallId}/participants`), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const peerId = change.doc.id;
          if (peerId !== myId && !pcsRef.current[peerId]) {
            // Only the peer with the lexicographically larger ID creates the offer to avoid collision
            if (myId > peerId) {
              const pc = createPeerConnection(peerId, currentCallId, stream);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              await addDoc(collection(db, `videoCalls/${currentCallId}/signals`), {
                from: myId,
                to: peerId,
                type: 'offer',
                offer: { sdp: offer.sdp, type: offer.type },
                createdAt: new Date().toISOString()
              });
            }
          }
        } else if (change.type === 'removed') {
          const peerId = change.doc.id;
          if (pcsRef.current[peerId]) {
            pcsRef.current[peerId].close();
            delete pcsRef.current[peerId];
            setRemoteStreams(prev => {
              const next = { ...prev };
              delete next[peerId];
              return next;
            });
          }
        }
      });
    });
  };

  const startCall = async (targetUserIds: string[] = [], customCallId?: string) => {
    const stream = await setupMediaSources();
    if (!stream) return;

    const currentProjectId = activeProjectId || window.location.pathname.split('/')[2];
    const callDocRef = customCallId ? doc(db, 'videoCalls', customCallId) : doc(collection(db, 'videoCalls'));
    const currentCallId = callDocRef.id;

    setCallId(currentCallId);
    setCallStatus('connected');
    setIsMinimized(false);
    
    // Create the room
    await setDoc(callDocRef, { 
      projectId: currentProjectId || 'global', 
      companyId: safeCompanyId, 
      callerName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Teammitglied',
      callerId: currentUser?.uid,
      targetUserIds, 
      createdAt: new Date().toISOString() 
    });

    await joinMeshNetwork(currentCallId, stream);
  };

  const joinCall = async (overrideId?: string | null) => {
    const targetId = overrideId || joinCallId;
    if (!targetId || !targetId.trim()) return;
    
    const callDoc = doc(db, 'videoCalls', targetId);
    const callSnap = await getDoc(callDoc);
    if (!callSnap.exists()) return alert("Meeting existiert nicht mehr.");

    const stream = await setupMediaSources();
    if (!stream) return;

    setCallId(targetId);
    setCallStatus('connected');
    setIsMinimized(false);

    await joinMeshNetwork(targetId, stream);
  };

  const hangUp = () => {
    // Clean up all peer connections
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

    // Remove self from participants list
    if (callId && myIdRef.current) {
      deleteDoc(doc(db, `videoCalls/${callId}/participants`, myIdRef.current)).catch(console.error);
    }

    if (unsubSignalsRef.current) { unsubSignalsRef.current(); unsubSignalsRef.current = null; }
    if (unsubParticipantsRef.current) { unsubParticipantsRef.current(); unsubParticipantsRef.current = null; }
  };

  useEffect(() => {
    return () => hangUp();
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
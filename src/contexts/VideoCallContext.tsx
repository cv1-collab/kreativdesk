import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, onSnapshot, setDoc, getDoc, query, where } from 'firebase/firestore';

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
  remoteStream: MediaStream | null;
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
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
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
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const safeCompanyId = currentUser?.companyId || (currentUser?.uid ? `comp_${currentUser.uid}` : '');

  // 🔥 INTELLIGENTER LISTENER FÜR ZIELGERICHTETE ANRUFE
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

            // Klingelt nur, wenn es ein Projekt-Rundruf ist (!isTargeted) oder der User explizit markiert wurde
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
        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        }
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
      if (pcRef.current && camTrack) {
        const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(camTrack);
      }
    }
  };

  const startCall = async (targetUserIds: string[] = [], customCallId?: string) => {
    const stream = await setupMediaSources();
    if (!stream) return;

    pcRef.current = new RTCPeerConnection(servers);
    stream.getTracks().forEach(track => pcRef.current?.addTrack(track, stream));

    pcRef.current.ontrack = (event) => {
      setRemoteStream(event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]));
    };

    // 🔥 Nutzt die Kalender-ID (falls übergeben) oder erstellt eine neue
    const callDocRef = customCallId ? doc(db, 'videoCalls', customCallId) : doc(collection(db, 'videoCalls'));
    const offerCandidates = collection(callDocRef, 'offerCandidates');
    const answerCandidates = collection(callDocRef, 'answerCandidates');

    setCallId(callDocRef.id);
    setCallStatus('calling');
    setIsMinimized(false);

    pcRef.current.onicecandidate = (e) => { if (e.candidate) addDoc(offerCandidates, e.candidate.toJSON()); };

    const offerDescription = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offerDescription);

    let currentProjectId = activeProjectId || window.location.pathname.split('/')[2];
    
    await setDoc(callDocRef, { 
      offer: { sdp: offerDescription.sdp, type: offerDescription.type }, 
      projectId: currentProjectId || 'global', 
      companyId: safeCompanyId, 
      callerName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Teammitglied',
      callerId: currentUser?.uid,
      targetUserIds, 
      createdAt: new Date().toISOString() 
    });

    onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data();
      if (!pcRef.current?.currentRemoteDescription && data?.answer) {
        pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(e => console.warn(e));
        setCallStatus('connected');
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') pcRef.current?.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(e => console.warn(e));
      });
    });
  };

  const joinCall = async (overrideId?: string | null) => {
    const targetId = overrideId || joinCallId;
    if (!targetId || !targetId.trim()) return;
    
    const callDoc = doc(db, 'videoCalls', targetId);
    const callSnap = await getDoc(callDoc);
    if (!callSnap.exists()) return alert("Meeting existiert nicht mehr.");

    const stream = await setupMediaSources();
    if (!stream) return;

    pcRef.current = new RTCPeerConnection(servers);
    stream.getTracks().forEach(track => pcRef.current?.addTrack(track, stream));

    pcRef.current.ontrack = (event) => {
      setRemoteStream(event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]));
    };

    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    pcRef.current.onicecandidate = (e) => { if (e.candidate) addDoc(answerCandidates, e.candidate.toJSON()); };

    await pcRef.current.setRemoteDescription(new RTCSessionDescription(callSnap.data().offer)).catch(e => console.warn(e));
    const answerDescription = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answerDescription);

    await updateDoc(callDoc, { answer: { sdp: answerDescription.sdp, type: answerDescription.type } });
    
    setCallId(targetId);
    setCallStatus('connected');
    setIsMinimized(false);

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') pcRef.current?.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(e => console.warn(e));
      });
    });
  };

  const hangUp = () => {
    if (pcRef.current) pcRef.current.close();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    if (remoteStream) remoteStream.getTracks().forEach(t => t.stop());
    setLocalStream(null); setRemoteStream(null); setScreenStream(null);
    setIsScreenSharing(false); setCallStatus('idle'); setCallId(''); setJoinCallId(''); setIsMinimized(false);
  };

  useEffect(() => {
    return () => hangUp();
  }, []);

  return (
    <VideoCallContext.Provider value={{
      localStream, remoteStream, screenStream, isMicOn, isCamOn, isScreenSharing,
      callStatus, callId, joinCallId, setJoinCallId, startCall, joinCall, hangUp, toggleMic, toggleCam, toggleScreenShare,
      isInCall, isMinimized, setIsMinimized, isChatOpen, setIsChatOpen, incomingCall, setIncomingCall
    }}>
      {children}
    </VideoCallContext.Provider>
  );
};
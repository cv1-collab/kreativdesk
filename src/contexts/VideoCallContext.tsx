import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { motion, useDragControls } from 'motion/react';
import { Minimize2, Maximize2, X, Video } from 'lucide-react';

interface VideoCallContextType {
  isInCall: boolean;
  setIsInCall: (value: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (value: boolean) => void;
  setPlaceholderElement: (el: HTMLDivElement | null) => void;
}

const VideoCallContext = createContext<VideoCallContextType>({
  isInCall: false,
  setIsInCall: () => {},
  isMinimized: false,
  setIsMinimized: () => {},
  isChatOpen: false,
  setIsChatOpen: () => {},
  setPlaceholderElement: () => {},
});

export const useVideoCall = () => useContext(VideoCallContext);

export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [placeholderElement, setPlaceholderElement] = useState<HTMLDivElement | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  
  // Die dynamische Position für das PIP Fenster (unten rechts ist der Standard)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<any>(null);

  useEffect(() => {
    if (isInCall && containerRef.current && !callRef.current) {
      callRef.current = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          backgroundColor: '#000000',
        },
        showLeaveButton: false, 
      });
      callRef.current.join({ url: 'https://kreativ-desk-hub.daily.co/kreativ-desk-hub' });
      callRef.current.on('left-meeting', () => setIsInCall(false));
    } else if (!isInCall && callRef.current) {
      callRef.current.destroy();
      callRef.current = null;
    }
  }, [isInCall]);

  useEffect(() => {
    if (!placeholderElement) return;

    const updateRect = () => {
      const r = placeholderElement.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    
    const observer = new ResizeObserver(updateRect);
    observer.observe(placeholderElement);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      observer.disconnect();
    };
  }, [placeholderElement]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDragPos({ x: window.innerWidth - 340, y: window.innerHeight - 240 });
    }
  }, []);

  return (
    <VideoCallContext.Provider value={{ isInCall, setIsInCall, isMinimized, setIsMinimized, isChatOpen, setIsChatOpen, setPlaceholderElement }}>
      {children}
      
      <motion.div 
        id="video-call-window"
        drag={isMinimized} // Fenster ist nur im PIP Modus verschiebbar!
        dragControls={dragControls}
        dragListener={false} 
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
          const el = document.getElementById('video-call-window');
          if (el) {
            const r = el.getBoundingClientRect();
            // Speichert die letzte abgelegte Position des PIP Fensters
            setDragPos({ x: r.left, y: r.top });
          }
        }}
        initial={false}
        animate={{
          x: isMinimized ? dragPos.x : rect.left,
          y: isMinimized ? dragPos.y : rect.top,
          width: isMinimized ? 320 : rect.width,
          height: isMinimized ? 224 : rect.height,
          opacity: (!isMinimized && rect.width === 0) ? 0 : 1
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`fixed top-0 left-0 z-[9999] flex flex-col overflow-hidden bg-black ${
          !isInCall ? 'hidden' : ''
        } ${isMinimized ? 'shadow-2xl rounded-xl border border-border/50' : 'rounded-none border-none'}`}
      >
        {/* DRAG HANDLE - Nur sichtbar im PIP Modus! */}
        {isMinimized && (
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="h-10 bg-surface border-b border-border/50 flex items-center justify-between px-4 cursor-move shrink-0 touch-none select-none"
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-text-primary uppercase tracking-widest flex items-center gap-1.5"><Video size={12}/> Live Meeting</span>
            </div>
            <div className="flex items-center gap-3">
              <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsMinimized(false)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer z-50">
                <Maximize2 size={16}/>
              </button>
              <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsInCall(false)} className="text-text-muted hover:text-red-500 transition-colors cursor-pointer z-50">
                <X size={18}/>
              </button>
            </div>
          </div>
        )}
        
        {/* VIDEO CONTAINER */}
        <div className={`flex-1 w-full relative ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}>
          <div ref={containerRef} className="absolute inset-0 bg-[#121212]" />
          {isDragging && <div className="absolute inset-0 z-50 bg-black/10" />}
        </div>
      </motion.div>
    </VideoCallContext.Provider>
  );
};
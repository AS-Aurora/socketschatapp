// src/hooks/useWebRTC.ts
import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { Socket } from 'socket.io-client';
import { CallSignal, CallState } from './types';

interface UseWebRTCProps {
  socket: Socket | null;
  userId: string | null;
}

const useWebRTC = ({ socket, userId }: UseWebRTCProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>({
    incomingCall: false,
    callAccepted: false,
    callRejected: false,
    caller: null,
    callType: null
  });
  
  const peerRef = useRef<Peer.Instance | null>(null);

  // Request user media (camera and microphone)
  const getUserMedia = async (type: 'video' | 'audio') => {
    try {
      const constraints: MediaStreamConstraints = {
        video: type === 'video',
        audio: true
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      return mediaStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  };

  // Initiate a call
  const callUser = async (targetUserId: string, type: 'video' | 'audio') => {
    const mediaStream = await getUserMedia(type);
    if (!mediaStream || !socket) return;

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: mediaStream
    });

    peerRef.current = peer;

    peer.on('signal', (signal) => {
      socket.emit('callUser', {
        signal: JSON.stringify(signal),
        from: userId,
        to: targetUserId,
        type
      });
    });

    socket.on('callAccepted', (signal: string) => {
      peer.signal(JSON.parse(signal));
      setCallState(prev => ({
        ...prev,
        callAccepted: true,
        callType: type
      }));
    });
  };

  // Answer an incoming call
  const answerCall = async () => {
    const mediaStream = await getUserMedia(callState.callType || 'video');
    if (!mediaStream || !socket) return;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: mediaStream
    });

    peerRef.current = peer;

    peer.on('signal', (signal) => {
      socket.emit('answerCall', {
        signal: JSON.stringify(signal),
        to: callState.caller
      });
    });

    socket.on('callAccepted', (signal: string) => {
      peer.signal(JSON.parse(signal));
      setCallState(prev => ({
        ...prev,
        callAccepted: true
      }));
    });
  };

  // Handle incoming calls
  useEffect(() => {
    if (!socket || !userId) return;

    const handleIncomingCall = (data: CallSignal) => {
      setCallState({
        incomingCall: true,
        callAccepted: false,
        callRejected: false,
        caller: data.from,
        callType: data.type
      });
    };

    socket.on('incomingCall', handleIncomingCall);

    return () => {
      socket.off('incomingCall');
    };
  }, [socket, userId]);

  // Clean up WebRTC connection
  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    setCallState({
      incomingCall: false,
      callAccepted: false,
      callRejected: false,
      caller: null,
      callType: null
    });
  };

  return {
    callUser,
    answerCall,
    endCall,
    stream,
    callState
  };
};

export default useWebRTC;
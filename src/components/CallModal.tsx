import React, { useRef, useEffect } from 'react';
import { X, Phone, Video, PhoneOff } from 'lucide-react';

interface CallModalProps {
  callState: {
    incomingCall: boolean;
    callAccepted: boolean;
    caller: string | null;
    callType: 'video' | 'audio' | null;
  };
  stream: MediaStream | null;
  answerCall: () => void;
  endCall: () => void;
}

const CallModal: React.FC<CallModalProps> = ({ 
  callState, 
  stream, 
  answerCall, 
  endCall 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!callState.incomingCall && !callState.callAccepted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        {callState.incomingCall && !callState.callAccepted && (
          <div className="text-center">
            <p>Incoming {callState.callType} Call from {callState.caller}</p>
            <div className="flex justify-center gap-4 mt-4">
              <button 
                onClick={answerCall}
                className="bg-green-500 p-2 rounded-full"
              >
                <Phone color="white" />
              </button>
              <button 
                onClick={endCall}
                className="bg-red-500 p-2 rounded-full"
              >
                <X color="white" />
              </button>
            </div>
          </div>
        )}

        {callState.callAccepted && (
          <div>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className="w-full max-w-md rounded-lg"
            />
            <div className="flex justify-center mt-4">
              <button 
                onClick={endCall}
                className="bg-red-500 p-2 rounded-full"
              >
                <PhoneOff color="white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;
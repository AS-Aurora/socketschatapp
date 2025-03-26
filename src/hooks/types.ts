// 1. Update your hooks/types.ts file:
export interface Message {
  _id: string;
  conversationID?: string;
  conversationId?: string;
  sender: string;
  receiver?: string;
  message: string;
  timestamp: string;
  readts?: string;
  status?: "sent" | "sending" | "error";
  read: boolean;
}

export interface CallSignal {
  signal: string
  from: string
  to: string
  type: 'video' | 'audio'
}

export interface CallState {
  incomingCall: boolean
  callAccepted: boolean
  callRejected: boolean
  caller: string | null
  callType: 'video' | 'audio' | null
}
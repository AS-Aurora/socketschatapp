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
  read: boolean; // Add the required 'read' property
}
"use client"

import React, { useEffect, useState, useRef, FormEvent, RefObject } from "react"
import useSocket from "../hooks/useSocket"
import useFetchUser from "../hooks/useFetchUser"
import useFetchReceiver from "../hooks/useFetchReceiver"
import useFetchConversation from "../hooks/useFetchConversation"
import useSendMessage from "../hooks/useSendMessage"
import useMessageHandling from "../hooks/useMessage"
import useWebRTC from '../hooks/useWebRTC'
import CallModal from '../components/CallModal'
import { Phone, Video } from "lucide-react"

const ChatArea = ({ chatId }: { chatId: string }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false)
  const [isReceiverOnline, setIsReceiverOnline] = useState(false)
  const [isReceiverTyping, setIsReceiverTyping] = useState(false)

  // Get socket connection
  const { socket, isConnected } = useSocket()

  // Fetch current user details
  const { userId, username } = useFetchUser()

  // Fetch receiver username
  const { receiverUsername } = useFetchReceiver({ chatId })

  // Fetch conversation messages
  const {
    conversationId,
    messages,
    setMessages,
    isLoading,
    hasMore,
    page,
    handleLoadMore,
  } = useFetchConversation({ chatId })

  
const { newMessage, setNewMessage, handleSendMessage, error } = useSendMessage({
  chatId,
  conversationId,
  receiverUsername,
  userId,
  username,
  socket,
  setMessages,
  messagesEndRef: messagesEndRef as RefObject<HTMLDivElement>,
  messagesContainerRef: messagesContainerRef as RefObject<HTMLDivElement>,
  setShowNewMessageIndicator: setShowNewMessageIndicator,
})

  useMessageHandling({
    socket,
    conversationId,
    messages, 
    setMessages,
    messagesEndRef: messagesEndRef as RefObject<HTMLDivElement>,
    messagesContainerRef: messagesContainerRef as RefObject<HTMLDivElement>,
    hasMore,
    isLoading,
    handleLoadMore,
    setShowNewMessageIndicator,
    setIsReceiverOnline,
    setIsReceiverTyping,
  })

  const {
    callUser,
    answerCall,
    endCall,
    stream,
    callState
  } = useWebRTC({ socket, userId });

  const handleStartVideoCall = () => {
    if (receiverUsername) {
      callUser(receiverUsername, 'video');
    }
  };

  const handleStartAudioCall = () => {
    if (receiverUsername) {
      callUser(receiverUsername, 'audio');
    }
  }

   const handleTyping = (e: FormEvent<HTMLInputElement>) => {
    const message = (e.target as HTMLInputElement).value.trim()
    setNewMessage(message)

    if(socket && receiverUsername) {
      socket.emit("typing", {
        targetUsername: receiverUsername,
        isTyping: message.length > 0,
      })
    }
   }

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return "Unknown time"

    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return "Invalid time"

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white p-4 rounded-lg">
      {/* Chat Header */}
      <div className="h-12 border-b border-gray-700 mb-4 flex items-center justify-between">
        <div>
          <span className="font-medium">{receiverUsername || "Loading..."}</span>
          <div className="text-xs text-gray-400">
            {isReceiverTyping ? "Typing..." : (isReceiverOnline ? "Online" : "Offline")}
          </div>
        </div>
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-3 px-2 py-2"
      >
        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="text-blue-400 text-sm hover:underline disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load earlier messages"}
            </button>
          </div>
        )}

        {messages.length === 0 && !isLoading ? (
          <p className="text-center text-gray-400 py-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg._id || `msg-${index}`}
              className={`flex ${
                msg.sender === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2.5 rounded-lg max-w-xs md:max-w-md break-words ${
                  msg.sender === userId
                    ? "bg-blue-600 text-white ml-auto rounded-tr-none" // Sent messages
                    : "bg-gray-700 text-white rounded-tl-none" // Received messages
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs opacity-70">
                    {msg.status === "error" && "Error"}
                    {msg.status === "sending" && "Sending..."}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && messages.length === 0 && (
          <div className="flex justify-center py-4">
            <p className="text-gray-400">Loading messages...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showNewMessageIndicator && (
      <button
        className="new-message-indicator"
        onClick={() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          setShowNewMessageIndicator(false)
        }}
      >
        ↓
      </button>
    )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!conversationId || isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newMessage.trim() || !conversationId || isLoading}
        >
          Send
        </button>
      </form>

      <div className="call-actions">
        <button onClick={handleStartVideoCall}>
          <Video /> Video Call
        </button>
        <button onClick={handleStartAudioCall}>
          <Phone /> Audio Call
        </button>
      </div>

      <CallModal 
        callState={callState}
        stream={stream}
        answerCall={answerCall}
        endCall={endCall}
      />
    </div>
  )
}

export default ChatArea
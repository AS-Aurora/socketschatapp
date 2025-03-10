import React from 'react'

interface ChatMessageProps {
    message: string
    sender: string
    isOwnMessage: boolean
    timestamp: Date
    }

const ChatMessage = ({sender, message, isOwnMessage = false, timestamp}: ChatMessageProps) => {
    const isSystemMessage = sender === "System"

  return (
    <div className={`flex ${isSystemMessage ? "justify-center" : isOwnMessage ? "justify-end" : "justify-start"} mb-3`}>
        <div className={`max-w-xs px-4 rounded-lg ${isSystemMessage ? "bg-gray-800 text-center text-xs": isOwnMessage ? "bg-blue-500 text-white": "bg-white text-black"}`}>
            {!isSystemMessage && <p className="text-xs text-gray-500">{sender}</p>}
            <p>{message}</p>
            <p className="text-xs text-gray-500">{timestamp.toLocaleTimeString()}</p> {/* TODO: Fix timestamp */}
        </div>
    </div>

  )
}

export default ChatMessage
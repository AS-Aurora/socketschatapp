import { useState, useCallback, Dispatch, SetStateAction, RefObject, useEffect } from "react"
import axios from "axios"
import { Socket } from "socket.io-client"
import { Message } from "../hooks/types"
import Messages from "../models/messageModel"

interface UseSendMessageProps {
  chatId: string
  conversationId: string | null
  receiverUsername: string | null
  userId: string | null
  username: string | null
  socket: Socket | null
  setMessages: Dispatch<SetStateAction<Message[]>>
  messagesEndRef: RefObject<HTMLDivElement>
  messagesContainerRef: RefObject<HTMLDivElement>
  setShowNewMessageIndicator: Dispatch<SetStateAction<boolean>>
}

const useSendMessage = ({
  chatId,
  conversationId,
  receiverUsername,
  userId,
  username,
  socket,
  setMessages,
  messagesEndRef,
  messagesContainerRef,
  setShowNewMessageIndicator,
}: UseSendMessageProps) => {
  const [newMessage, setNewMessage] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)

  // Auto-scroll when entering conversation
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
    }, 100)
  }, [conversationId, messagesEndRef])

  // Handle user scroll to detect if they are at the bottom
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 20

      if (isAtBottom) {
        setIsUserScrolledUp(false)
        setShowNewMessageIndicator(false)
      } else {
        setIsUserScrolledUp(true)
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [messagesContainerRef])

  const handleSendMessage = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!newMessage.trim() || !conversationId || !receiverUsername || !userId || !username) return

      const messageContent = newMessage.trim()
      setNewMessage("") // Clear input field immediately

      const messageData = {
        message: messageContent,
        conversationID: conversationId,
        receiverUsername: receiverUsername,
      }

      const temporaryMessage: Message = {
        _id: `temp-${Date.now()}`,
        message: messageContent,
        sender: userId,
        receiver: chatId,
        conversationID: conversationId,
        timestamp: new Date().toISOString(),
        read: false,
        status: "sending",
      }

      try {
        setMessages((prev) => prev.filter((msg) => msg._id !== temporaryMessage._id))

        if (socket) {
          socket.emit("sendDirectMessage", {
            message: messageContent,
            senderId: userId,
            senderUsername: username,
            receiverId: chatId,
            receiverUsername: receiverUsername,
            conversationID: conversationId,
          })
        }

        // Auto-scroll only if user is already at bottom
        if (!isUserScrolledUp) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 100)
        } else {
          setShowNewMessageIndicator(true)
        }
      } catch (error) {
        setMessages((prev) => prev.filter((msg) => msg._id !== temporaryMessage._id))
        setError("Failed to send message. Please try again.")
      }
    },
    [newMessage, conversationId, receiverUsername, userId, username, chatId, socket, setMessages, messagesEndRef, isUserScrolledUp, setShowNewMessageIndicator]
  )

  return { newMessage, setNewMessage, handleSendMessage, error }
}

export default useSendMessage

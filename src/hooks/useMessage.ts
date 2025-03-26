import { useEffect, RefObject, useState, Dispatch, SetStateAction } from "react"
import { Socket } from "socket.io-client"
import { Message } from "./types"

interface UseMessageHandlingProps {
  socket: Socket | null
  conversationId: string | null
  messages: Message[]
  setMessages: Dispatch<SetStateAction<Message[]>>
  messagesEndRef: RefObject<HTMLDivElement>
  messagesContainerRef: RefObject<HTMLDivElement>
  hasMore: boolean
  isLoading: boolean
  handleLoadMore: () => void
  setShowNewMessageIndicator: Dispatch<SetStateAction<boolean>>
  setIsReceiverTyping: Dispatch<SetStateAction<boolean>>
  setIsReceiverOnline: Dispatch<SetStateAction<boolean>>
}

const useMessageHandling = ({
  socket,
  conversationId,
  messages,
  setMessages,
  messagesEndRef,
  messagesContainerRef,
  hasMore,
  isLoading,
  handleLoadMore,
  setShowNewMessageIndicator,
  setIsReceiverTyping,
  setIsReceiverOnline,
}: UseMessageHandlingProps) => {
  // Track whether user is at the bottom
  const [isAtBottom, setIsAtBottom] = useState(true)
  
  // Scroll to the bottom when entering conversation
  useEffect(() => {
    if (conversationId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
        setTimeout(() => {
          const container = messagesContainerRef.current
          if(container) {
            container.scrollTop = container.scrollHeight
          }
          setIsAtBottom(true)
        }, 100)
      }, 300)
    }
  }, [conversationId, messagesEndRef, messagesContainerRef])

  // Scroll handler for infinite loading and tracking scroll position
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      // Consider "at bottom" if within 20px of bottom
      const isBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 20
      
      setIsAtBottom(isBottom)

      // Hide indicator when user scrolls to bottom
      if (isBottom) {
        setShowNewMessageIndicator(false)
      }

      // Load more messages when scrolled near the top
      if (container.scrollTop < 50 && hasMore && !isLoading) {
        handleLoadMore()
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [hasMore, isLoading, handleLoadMore, messagesContainerRef, setShowNewMessageIndicator])

  // Auto-scroll to bottom only for new messages in the current session
  useEffect(() => {
    if (messages.length > 0 && isAtBottom) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [messages.length, messagesEndRef, isAtBottom])

  // Handle receiver typing indicator
  useEffect(() => {
    if(!socket) return

    const handleUserStatusUpdate = (data: { username: string; isOnline: boolean }) => {
      setIsReceiverOnline(data.isOnline)
    }

    const handleTyping = (data: { username: string; isTyping: boolean }) => {
      setIsReceiverTyping(data.isTyping)
    }

    socket.on("userStatusUpdate", handleUserStatusUpdate)
    socket.on("typing", handleTyping)

    return () => {
      socket.off("userStatusUpdate", handleUserStatusUpdate)
      socket.off("typing", handleTyping)
    }
  }, [socket, setIsReceiverOnline, setIsReceiverTyping])

  // Handle new messages from WebSocket
  useEffect(() => {
    if (!socket || !conversationId) return

    const handleNewMessage = (newMsg: Message) => {
      const msgConversationId = newMsg.conversationID || newMsg.conversationId

      if (msgConversationId === conversationId) {
        setMessages((prevMessages) => {
          if (prevMessages.some((msg) => msg._id === newMsg._id)) {
            return prevMessages
          }

          const updatedMessages = [...prevMessages, newMsg]

          // Sort messages by timestamp
          return updatedMessages.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        })

        // Show indicator if not at bottom, otherwise scroll to bottom
        if (!isAtBottom) {
          setShowNewMessageIndicator(true)
        } else {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 100)
        }
      }
    }

    socket.off("message")
    socket.on("message", handleNewMessage)

    // Join conversation room
    socket.emit("joinConversation", { conversationId })

    return () => {
      if (socket) {
        socket.off("message")
        socket.emit("leaveConversation", { conversationId })
      }
    }
  }, [conversationId, socket, setMessages, messagesEndRef, isAtBottom, setShowNewMessageIndicator])

  return {
    isAtBottom,
  }
}

export default useMessageHandling
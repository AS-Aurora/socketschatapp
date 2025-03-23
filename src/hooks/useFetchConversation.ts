import axios from 'axios'
import React, { useEffect, useState } from 'react'
import useFetchReceiver from './useFetchReceiver'
import useFetchUser from './useFetchUser'
import { Message } from "./types"

interface MessagesResponse {
    messages: Message[]
}

const useFetchConversation = ({chatId}: {chatId: string}) => {
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [page, setPage] = useState<number>(1)

    const {receiverUsername} = useFetchReceiver({chatId})
    const {userId} = useFetchUser()

    const fetchMessages = async (
        conversationId: string,
        pageNumber: number,
        lastMsgTime?: string
      ) => {
        try {
          const messagesResponse = await axios.post<MessagesResponse>(
            `/api/dm/messages`,
            {
              conversationId: conversationId,
              page: pageNumber,
              limit: 20,
              lastMessageTime: lastMsgTime,
            }
          )
    
          // Check if the response has the correct structure
          if (
            messagesResponse.data &&
            Array.isArray(messagesResponse.data.messages)
          ) {
            const newMessages = messagesResponse.data.messages
    
            // Check if we have more messages to load
            setHasMore(newMessages.length === 20)
    
            setMessages((prevMessages) => {
              // Combine previous and new messages, ensuring no duplicates
              const combinedMessages = [...prevMessages]
    
              newMessages.forEach((newMsg) => {
                if (!combinedMessages.some((msg) => msg._id === newMsg._id)) {
                  combinedMessages.push(newMsg)
                }
              })
    
              // Sort messages by timestamp with "oldest first" order
              return combinedMessages.sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              )
            })
          } else if (Array.isArray(messagesResponse.data)) {
            // Handle case where API directly returns an array instead of {messages: [...]}
            const newMessages = messagesResponse.data as unknown as Message[]
    
            setHasMore(newMessages.length === 20)
    
            setMessages((prevMessages) => {
              const combinedMessages = [...prevMessages]
    
              newMessages.forEach((newMsg) => {
                if (!combinedMessages.some((msg) => msg._id === newMsg._id)) {
                  combinedMessages.push(newMsg)
                }
              })
    
              return combinedMessages.sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              )
            })
          } else {
            console.log("Failed to parse messages from server")
          }
        } catch (error) {
            console.error("Failed to load messages:", error)
        }
      }


    useEffect(() => {
        const initializeConversation = async () => {
          if (!receiverUsername || !userId) return
    
          setIsLoading(true)
          setMessages([]) // Clear messages when conversation changes
          setPage(1) // Reset pagination
    
          try {
            // Create or get existing conversation
            const conversationResponse = await axios.post("/api/dm/conversation", {
              receiverUsername,
            })
    
            const newConversationId = conversationResponse.data.conversationId
            setConversationId(newConversationId)
    
            // Fetch initial messages
            await fetchMessages(newConversationId, 1)
          } catch (error) {
            console.error("Error initializing conversation:", error)
          } finally {
            setIsLoading(false)
          }
        }
    
        initializeConversation()
      }, [receiverUsername, userId])

      // Function to load more messages (pagination)
    const handleLoadMore = () => {
        if (!hasMore || isLoading || !conversationId) return

        setIsLoading(true)
        const nextPage = page + 1
        const oldestMessage =
            messages.length > 0
                ? messages.reduce((oldest, current) =>
                    new Date(oldest.timestamp).getTime() <
                    new Date(current.timestamp).getTime()
                        ? oldest
                        : current
                )
                : null

        fetchMessages(conversationId, nextPage, oldestMessage?.timestamp).then(
            () => {
                setPage(nextPage)
                setIsLoading(false)
            }
        )
    }

    return {
        conversationId, 
        messages, 
        setMessages,
        isLoading, 
        hasMore, 
        page, 
        fetchMessages, 
        handleLoadMore
    }
}

export default useFetchConversation
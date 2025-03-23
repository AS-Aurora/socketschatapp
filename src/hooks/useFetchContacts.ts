import axios from "axios"
import { useEffect, useState, useCallback } from "react"
import useSocket from "./useSocket"

const useFetchContacts = () => {
  const [contacts, setContacts] = useState<
    { _id: string, username: string, profilePicture?: string, lastMessageTime?: string }[]
  >([])
  const [refresh, setRefresh] = useState(false)
  const { socket, isConnected } = useSocket()

  // Stable fetch function
  const fetchContacts = useCallback(async () => {
    try {
      const response = await axios.get("/api/dm/contacts")
      const sortedContacts = response.data.sort((a: any, b: any) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
        return timeB - timeA
      })

      setContacts([...sortedContacts]) // Ensure a re-render by creating a new array
      setRefresh((prev) => !prev)
    } catch (error) {
      console.error("Error fetching contacts:", error)
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    // Fetch contacts initially
    fetchContacts()

    // Listen for contact updates
    socket.on("updateContacts", fetchContacts)

    return () => {
      socket.off("updateContacts", fetchContacts)
    }
  }, [socket, fetchContacts]) // Ensure dependencies are properly included

  return { contacts, refresh }
}

export default useFetchContacts

import axios from 'axios'
import React, { useEffect, useState } from 'react'
interface User {
    _id: string
    username: string
  }

const useFetchReceiver = ({chatId}: {chatId: string}) => {
  const [receiverUsername, setReceiverUsername] = useState<string>("")

  useEffect(() => {
      const fetchReceiverUsername = async () => {
        if (!chatId) return
  
        try {
          const response = await axios.get<User>(`/api/users/${chatId}`)
          setReceiverUsername(response.data.username)
        } catch (error) {
            console.log("Failed to load contact information")
        }
      }
  
      fetchReceiverUsername()
    }, [chatId])

    return { receiverUsername }
}

export default useFetchReceiver
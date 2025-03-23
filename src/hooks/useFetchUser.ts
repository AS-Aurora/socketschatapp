  import axios from 'axios'
  import React, { useEffect, useState } from 'react'

  interface User {
      _id: string
      username: string,
      profilePicture?: string | null
    }

  const useFetchUser = () => {
      const [userId, setUserId] = useState<string | null>(null)
      const [username, setUsername] = useState<string | null>(null)
      const [profilePicture, setProfilePicture] = useState<string | null>(null)

      useEffect(() => {
          const fetchUser = async () => {
            try {
              const response = await axios.get<User>("/api/users/me")
              setUserId(response.data._id)
              setUsername(response.data.username)
              setProfilePicture(response.data.profilePicture ? response.data.profilePicture : null)
            } catch (error) {
              console.log("Failed to load your user profile")
            }
          }
      
          fetchUser()
        }, [])
      
        return { userId, username, profilePicture }

  }

  export default useFetchUser
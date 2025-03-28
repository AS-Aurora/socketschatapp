import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])

    useEffect(() => {
        if (typeof window !== "undefined" && !socket) {
            const token = localStorage.getItem("token") || ""
            
            console.group("Socket Initialization")
            console.log("Token:", token ? "Present" : "Missing")
            
            socket = io("http://localhost:5001/", {
              auth: { token },
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
            })
        
            socket.on("connect", () => {
              console.log("Connected to WebSocket! ID:", socket?.id)
              setIsConnected(true)
              console.log("Requesting initial online users...")
              socket?.emit("requestOnlineUsers")
            })
        
            socket.on("connect_error", (err) => {
              console.error("WebSocket Connection Error:", err)
              setIsConnected(false)
            })

            // Handler for initial online users
            socket.on("initialOnlineUsers", (users: string[]) => {
              console.log("Initial online users received:", users)
              setOnlineUsers(users)
            })

            // Listen for user status updates
            socket.on("userStatusUpdate", (data: { 
              username: string, 
              isOnline: boolean 
            }) => {
              console.log("User status update:", data)
              
              setOnlineUsers(prevUsers => {
                if (data.isOnline) {
                  // Add user if not already in the list
                  return prevUsers.includes(data.username) 
                    ? prevUsers 
                    : [...prevUsers, data.username]
                } else {
                  // Remove user from online list
                  return prevUsers.filter(user => user !== data.username)
                }
              })
            })

            console.groupEnd()
          }

          return () => {
            if(socket) {
                socket.off("connect")
                socket.off("disconnect")
                socket.off("connect_error")
                socket.off("userStatusUpdate")
                socket.off("initialOnlineUsers")
            }
          }
    }, [])

    return { socket, isConnected, onlineUsers }
}

export default useSocket
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined" && !socket) {
            socket = io("http://localhost:5001/", {
              auth: {
                token: localStorage.getItem("token") || "",
              },
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
            })
        
            socket.on("connect", () => {
              console.log("Connected to WebSocket! ID:", socket?.id)
                setIsConnected(true)
            })
        
            socket.on("connect_error", (err) => {
              console.error("WebSocket Connection Error:", err)
              setIsConnected(false)
            })
          }

          return () => {
            if(socket) {
                socket.off("connect")
                socket.off("disconnect")
                socket.off("connect_error")
            }
          }
    }, [])

    return {socket, isConnected}
  }

  export default useSocket
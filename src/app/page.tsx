"use client";

import { useEffect, useState, useRef } from "react";
import Chatform from "../components/Chatform";
import ChatMessage from "../components/ChatMessage";
import io, { Socket } from "socket.io-client";
import Logout from "../components/Logout";

export default function Home() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<
    { sender: string; message: string; id?: string; timestamp: Date }[]
  >([]);
  const [username, setUsername] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      setConnectionError("No authentication token found");
      return;
    }

    socketRef.current = io("http://localhost:5001", {
      auth: {
        token: token
      }
    })

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
      setConnectionError(null);
    })

    socketRef.current.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setConnectionError(`Connection error: ${err.message}`);
    })

    socketRef.current.on("message", (message) => {
      setMessages((prev) => [...prev, message])
    })

    socketRef.current.on("previousMessages", (previousMessages) => {
      setMessages(previousMessages)
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    };
  }, []);

  const handleSendMessage = (message: string) => {
    if (message.trim() !== "" && socketRef.current) {
      socketRef.current.emit("sendMessage", { message, username, room })
    }
  };

  const handleJoinRoom = () => {
    if (username.trim() !== "" && room.trim() !== "" && socketRef.current) {
      socketRef.current.emit("join-room", { username, room })
      setJoined(true);
      console.log("Joining room:", username, room);
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-room", { username, room });
      setJoined(false);
      setMessages([]);
      setRoom("");
    }
  };

  return (
    <div className="flex justify-center mt-5 mr-2 w-full">
      {connectionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded absolute top-0 right-0 m-4">
          {connectionError}
        </div>
      )}
      
      {!joined ? (
        <div className="flex w-full max-w-3xl mx-auto flex-col items-center">
          <nav>
            <Logout />
          </nav>
          <h1 className="mb-4 text-2xl font-bold">Join a room</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-64 px-4 py-2 mb-4 border-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-64 px-4 py-2 mb-4 border-2 rounded-lg"
          />
          <button
            onClick={handleJoinRoom}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg"
            disabled={!socketRef.current || !!connectionError}
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold">Room: {room}</h1>
          <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border border-gray-300 rounded-md">
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id || index}
                sender={msg.sender}
                message={msg.message}
                isOwnMessage={msg.sender === username}
                timestamp={new Date(msg.timestamp)}
              />
            ))}
          </div>
          <Chatform onSendMessage={handleSendMessage} />

          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 mt-2 text-white bg-blue-500 rounded-lg"
          >
            Leave the room
          </button>
        </div>
      )}
    </div>
  );
}
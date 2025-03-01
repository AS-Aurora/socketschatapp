"use client";

import { useEffect, useState } from "react";
import Chatform from "../components/Chatform"; 
import ChatMessage from "../components/ChatMessage";
import io from "socket.io-client";
import Logout from "../components/Logout";

const socket = io("http://localhost:5000");

export default function Home() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      socket.off("message")
    }
  }, [])

  const handleSendMessage = (message: string) => {
    if(message.trim() !== "") {
      socket.emit("sendMessage", { message, username, room})
    }
  };

  const handleJoinRoom = () => {
    if(username.trim() !== "" && room.trim() !== "") {
      socket.emit("join-room", { username, room });
      setJoined(true);
      console.log(username, room);
    }
  }

  const handleLeaveRoom = () => {
    socket.emit("leave-room", { username, room });
    setJoined(false);
    setMessages([]);
    setRoom("");
  };
  return (
    <div className="flex justify-center mt-5 mr-2 w-full">
      {!joined ? (

        
        <div className=" flex w-full max-w-3xl mx-auto flex-col items-center">

          <nav><Logout /></nav>
          <h1 className="mb-4 text-2xl font-bold">Join a room</h1>
          <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-64 px-4 py-2 mb-4 border-2 rounded-lg" />
          <input type="text" placeholder="Enter room name" value={room} onChange={(e) => setRoom(e.target.value)} className="w-64 px-4 py-2 mb-4 border-2 rounded-lg"/>
          <button onClick={handleJoinRoom} className="px-4 py-2 text-white bg-blue-500 rounded-lg">Join Room</button>
        </div>
) : (
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold">Room: {room}</h1>
          <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border border-gray-300 rounded-md">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                sender={msg.sender}
                message={msg.message}
                isOwnMessage={msg.sender == username}
              />
            ))}
          </div>
          <Chatform onSendMessage={handleSendMessage} />

          <button onClick={handleLeaveRoom} className="px-4 py-2 text-white bg-blue-500 rounded-lg">Leave the room</button>
        </div>
        
      )}
    </div>
  );
}

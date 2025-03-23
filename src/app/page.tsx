"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";

const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      <Sidebar onSelect={(id) => setSelectedChat(id)} />

      <div className="flex-1">
        {selectedChat ? (
          <ChatArea chatId={selectedChat} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
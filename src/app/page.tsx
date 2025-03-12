"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
// import Chat from "../components/Chat";

const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      {/* Sidebar (Contacts) */}
      <Sidebar onSelect={setSelectedChat} />

      {/* Chat Panel */}
      <div className="flex-1">
        {selectedChat ? (
          // <Chat conversationId={selectedChat} />
          <div></div>
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

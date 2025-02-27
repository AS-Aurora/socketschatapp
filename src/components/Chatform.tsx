"use client";

import React, { useState } from "react";

const Chatform = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => void;
}) => {
  const [message, setMessage] = useState("");

  const handlesubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== "") {
      onSendMessage(message);
      setMessage("");
    }
  };
  return (
    <form onSubmit={handlesubmit} className="flex gap-2 mt-4">
      <input
        type="text"
        placeholder="Type your message here..."
        className="flex-1 px-4 border-2 py-2 focus: outline-none"
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-blue-500 text-white"
      >
        Send
      </button>
    </form>
  );
};

export default Chatform;

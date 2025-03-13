"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import AddContacts from "./AddContacts";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Sidebar = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [contacts, setContacts] = useState<{ _id: string; username: string; profilePicture?: string }[]>(
    [],
  );
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<{ _id: string; username: string; profilePicture: string }>({
    _id: "",
    username: "",
    profilePicture: "",
  })
  const router = useRouter()

  useEffect(() => {
    const fetchContacts = async () => {
      const response = await axios.get("/api/dm/contacts");
      setContacts(response.data);
    };

    fetchContacts();
  }, [])

  useEffect(() => {
    const fetchUser = async() => {
      const response = await axios.get("/api/users/me")
      setUser(response.data)
    }

    fetchUser()
  }, [])

  
  const handleProfileRedirect = () => {
    if (user) {
      router.push(`/profile/${user._id}`)
    }
  }
  return (
    <div className="w-64 bg-gray-900 text-white p-4">
      <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
         onClick={handleProfileRedirect}>
      <img
        src={user.profilePicture || "/default-avatar.png"} 
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover"
      />
      <span className="text-black dark:text-white font-medium">{user.username || "Profile"}</span>
    </div>
      <h2 className="text-lg font-bold mb-4">Contacts</h2>
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          + Add Contact
        </button>

        {isModalOpen && (
          <AddContacts
            onClose={() => setIsModalOpen(false)}
            onContactAdded={() => console.log("Contact Added!")}
          />
        )}
      </div>
      {contacts.length >= 1 ? (
  contacts.map((contact) => (
    <div
      key={contact.username}
      onClick={() => onSelect(contact.username)}
      className="p-2 cursor-pointer hover:bg-gray-700 rounded flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        {contact.profilePicture ? (
          <Link href={`/profile/${contact?._id}`}>
            <img 
              src={contact.profilePicture} 
              alt={`${contact.username}'s profile`}
              className="w-full h-full object-cover"
            />
          </Link>
        ) : (
          <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white">
            {contact.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span>{contact.username}</span>
    </div>
  ))
) : (
  <p className="text-gray-400">No contacts available</p>
)}
    </div>
  );
};


export default Sidebar;

"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useFetchContacts from "../hooks/useFetchContacts"
import useFetchUser from "../hooks/useFetchUser"


const Sidebar = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [search, setSearch] = useState<string>("")
  const [user, setUser] = useState<{
    _id: string,
    username: string,
    profilePicture: string,
  }>({
    _id: "",
    username: "",
    profilePicture: "",
  })
  const router = useRouter()

  const { contacts } = useFetchContacts()

  const { userId, username, profilePicture } = useFetchUser()

  const handleProfileRedirect = () => {
    if (userId) {
      router.push(`/profile/${userId}`);
    }
  }

  return (
    <div className="w-64 bg-gray-900 text-white p-4">
      <div
        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        onClick={handleProfileRedirect}
      >
        <img
          src={profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="text-black dark:text-white font-medium">
          {username || "Profile"}
        </span>
      </div>

      <h2 className="text-lg font-bold mb-4">Contacts</h2>
      {contacts.length > 0 ? (
        contacts
          .map((contact) => (
            <div
              key={contact._id}
              onClick={() => onSelect(contact._id)}
              className="p-2 cursor-pointer hover:bg-gray-700 rounded flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {contact.profilePicture ? (
                  <Link href={`/profile/${contact._id}`}>
                    <img
                      src={contact.profilePicture}
                      alt="https://static.vecteezy.com/system/resources/thumbnails/024/983/914/small/simple-user-default-icon-free-png.png"
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
  )
}

export default Sidebar
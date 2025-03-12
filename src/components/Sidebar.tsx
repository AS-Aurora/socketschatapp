  "use client" 

  import axios from 'axios'
  import React, { useEffect, useState } from 'react'

  const Sidebar = ({onSelect}: {onSelect: (id: string) => void}) => {
      const [contacts, setContacts] = useState<{id: string; username: string}[]>([])
      const [search, setSearch] = useState<string>("")

      useEffect(() => {
          const fetchContacts = async() => {
              const response = await axios.get('/api/dm/contacts')
              setContacts(response.data)
          }

          fetchContacts()
      }, [])
    return (
      <div className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-lg font-bold mb-4">Contacts</h2>
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelect(contact.id)}
              className="p-2 cursor-pointer hover:bg-gray-700 rounded"
            >
              {contact.username}
            </div>
          ))
        ) : (
          <p className="text-gray-400">No contacts available</p>
        )}
      </div>
    )
  }

  export default Sidebar
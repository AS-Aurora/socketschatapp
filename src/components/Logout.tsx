import axios from 'axios'
import { useRouter } from 'next/navigation'
import React from 'react'

const Logout = () => {
    const router = useRouter()

    const handlelogout = async() => {
        
        try {
            await axios.get('/api/users/user-logout')
            router.push('/user-signin')
            
        } catch (error: any) {
            console.error("Error logging out:", error.message)
            
        }
    }
  return (
    <div className="mt-8">
      <button
        onClick={handlelogout}
        className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  )
}

export default Logout
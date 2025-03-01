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
    <div className='flex flex-col items-end justify-start min-w-screen mb-20'>
        <button onClick={handlelogout} className='px-4 py-2 rounded-lg bg-blue-500 text-white'>Logout</button>
    </div>
  )
}

export default Logout
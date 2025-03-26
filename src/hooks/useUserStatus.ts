import { useState, useEffect } from 'react'
import useSocket from './useSocket'

export const useUserStatus = (partnerUsername: string) => {
  const [partnerStatus, setPartnerStatus] = useState('offline')
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    // Update own status
    const updateOwnStatus = (status: string) => {
      if (socket) {
        if (socket) {
          socket.emit('updateStatus', status)
        }
      }
    }

    // Listen for partner status changes
    socket.on('partnerStatusChanged', ({ username, status }) => {
      if (username === partnerUsername) {
        setPartnerStatus(status)
      }
    })

    // Initial status check
    socket.emit('checkUserStatus', partnerUsername, (status: { status: string }) => {
      setPartnerStatus(status.status)
    })

    // Cleanup
    return () => {
      socket.off('partnerStatusChanged')
    }
  }, [socket, partnerUsername])

  return {
    updateStatus: (status: string) => {
      socket?.emit('updateStatus', status)
    },
    partnerStatus
  }
}
import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseWebSocketOptions {
  url?: string
  token?: string
  autoConnect?: boolean
}

export function useWebSocket({
  url,
  token,
  autoConnect = true
}: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!autoConnect || socketRef.current) return

    try {
      const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
      const socket = io(wsUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: token ? { token } : undefined,
        transports: ['websocket']
      })

      socket.on('connect', () => {
        setIsConnected(true)
        setError(null)
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socket.on('error', (err) => {
        setError(err?.message || 'WebSocket error')
      })

      socket.on('authenticated', () => {
        console.log('WebSocket authenticated')
      })

      socketRef.current = socket

      return () => {
        socket.disconnect()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    }
  }, [url, token, autoConnect])

  const emit = useCallback((event: string, data?: any) => {
    if (!socketRef.current) {
      console.warn('WebSocket not connected')
      return
    }
    socketRef.current.emit(event, data)
  }, [])

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (!socketRef.current) {
      console.warn('WebSocket not connected')
      return
    }
    socketRef.current.on(event, handler)

    return () => {
      socketRef.current?.off(event, handler)
    }
  }, [])

  const once = useCallback((event: string, handler: (data: any) => void) => {
    if (!socketRef.current) {
      console.warn('WebSocket not connected')
      return
    }
    socketRef.current.once(event, handler)
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    once,
    disconnect
  }
}

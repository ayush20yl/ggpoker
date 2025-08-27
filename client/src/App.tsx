import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import GameRoom from './components/GameRoom'
import './App.css'

function App() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<any>(null)
  const [playerSeat, setPlayerSeat] = useState<number>(-1)

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
    const newSocket = io(serverUrl)
    setSocket(newSocket)

    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)
    
    const handleJoinSuccess = (data: any) => {
      console.log('Successfully joined room:', data)
      setJoining(false)
      setCurrentRoom(data.room)
      setPlayerSeat(data.playerSeat)
    }
    
    const handleJoinError = (data: any) => {
      console.error('Failed to join room:', data.error)
      setJoining(false)
      alert(`Failed to join room: ${data.error}`)
    }
    
    const handlePlayerJoined = (data: any) => {
      console.log('Player joined:', data)
      if (currentRoom) {
        setCurrentRoom(data.room)
      }
    }
    
    const handlePlayerLeft = (data: any) => {
      console.log('Player left:', data)
      if (currentRoom) {
        setCurrentRoom(data.room)
      }
    }

    newSocket.on('connect', handleConnect)
    newSocket.on('disconnect', handleDisconnect)
    newSocket.on('connection-status', (data) => {
      console.log('Connection status:', data)
    })
    newSocket.on('join-room-success', handleJoinSuccess)
    newSocket.on('join-room-error', handleJoinError)
    newSocket.on('player-joined', handlePlayerJoined)
    newSocket.on('player-left', handlePlayerLeft)

    return () => {
      newSocket.close()
    }
  }, [])

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim() || !roomCode.trim()) return
    
    setJoining(true)
    socket?.emit('join-room', {
      roomCode: roomCode.toUpperCase(),
      playerName: playerName.trim()
    })
  }

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return
    
    setJoining(true)
    
    try {
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Auto-join the created room
        socket?.emit('join-room', {
          roomCode: data.roomCode,
          playerName: playerName.trim()
        })
      } else {
        console.error('Failed to create room:', data.error)
        setJoining(false)
      }
    } catch (error) {
      console.error('Error creating room:', error)
      setJoining(false)
    }
  }

  const handleLeaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave-room')
      setCurrentRoom(null)
      setPlayerSeat(-1)
      setRoomCode('')
    }
  }

  // If in a room, show the game room
  if (currentRoom && socket) {
    return (
      <GameRoom
        socket={socket}
        room={currentRoom}
        playerSeat={playerSeat}
        onLeaveRoom={handleLeaveRoom}
      />
    )
  }

  // Otherwise show the join screen
  return (
    <div className="app">
      <header className="app-header">
        <h1>GG Poker</h1>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </header>
      
      <main className="join-screen">
        <div className="join-form">
          <h2>Join a Game</h2>
          
          <div className="form-group">
            <label htmlFor="playerName">Your Name</label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>
          
          <form onSubmit={handleJoinRoom}>
            <div className="form-group">
              <label htmlFor="roomCode">Room Code</label>
              <input
                id="roomCode"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={!playerName.trim() || !roomCode.trim() || joining || !connected}
              className="btn btn-primary"
            >
              {joining ? 'Joining...' : 'Join Room'}
            </button>
          </form>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          <button 
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || joining || !connected}
            className="btn btn-secondary"
          >
            {joining ? 'Creating...' : 'Create New Room'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default App

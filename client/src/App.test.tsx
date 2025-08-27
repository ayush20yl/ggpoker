import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock socket.io-client
const mockSocket = {
  on: vi.fn((event, callback) => {
    if (event === 'connect') {
      // Simulate immediate connection
      setTimeout(() => callback(), 0)
    }
  }),
  close: vi.fn(),
  emit: vi.fn()
}

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket)
}))

describe('App', () => {
  it('renders join form with name and room code inputs', () => {
    render(<App />)
    
    expect(screen.getByText('GG Poker')).toBeInTheDocument()
    expect(screen.getByText('Join a Game')).toBeInTheDocument()
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Room Code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /join room/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create new room/i })).toBeInTheDocument()
  })

  it('disables join button when name or room code is empty', () => {
    render(<App />)
    
    const joinButton = screen.getByRole('button', { name: /join room/i })
    expect(joinButton).toBeDisabled()
  })

  it('enables join button when both name and room code are provided', async () => {
    render(<App />)
    
    const nameInput = screen.getByLabelText('Your Name')
    const roomCodeInput = screen.getByLabelText('Room Code')
    const joinButton = screen.getByRole('button', { name: /join room/i })
    
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } })
    fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } })
    
    // Wait for socket connection to be established
    await new Promise(resolve => setTimeout(resolve, 10))
    
    expect(joinButton).not.toBeDisabled()
  })

  it('converts room code to uppercase', () => {
    render(<App />)
    
    const roomCodeInput = screen.getByLabelText('Room Code') as HTMLInputElement
    
    fireEvent.change(roomCodeInput, { target: { value: 'abc123' } })
    
    expect(roomCodeInput.value).toBe('ABC123')
  })
})
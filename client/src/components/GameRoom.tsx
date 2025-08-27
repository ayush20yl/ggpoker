import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import './GameRoom.css';

interface Card {
  suit: string;
  rank: string;
}

interface PokerPlayer {
  id: string;
  name: string;
  seat: number;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBet: number;
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  lastAction?: string;
}

interface Pot {
  amount: number;
  eligiblePlayers: string[];
  isMainPot: boolean;
}

interface GameState {
  id: string;
  phase: string;
  players: PokerPlayer[];
  communityCards: Card[];
  pots: Pot[];
  currentBet: number;
  minRaise: number;
  dealerPosition: number;
  currentPlayerIndex: number;
  smallBlind: number;
  bigBlind: number;
  handNumber: number;
}

interface Player {
  id: string;
  name: string;
  seat: number;
}

interface Room {
  code: string;
  players: Player[];
  maxPlayers: number;
}

interface ChatMessage {
  id: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

interface GameRoomProps {
  socket: Socket;
  room: Room;
  playerSeat: number;
  playerName: string;
  onLeaveRoom: () => void;
}

export default function GameRoom({ socket, room, playerSeat, playerName, onLeaveRoom }: GameRoomProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState<Room>(room);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [validActions, setValidActions] = useState<string[]>([]);
  const [raiseAmount, setRaiseAmount] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const handleChatMessage = (data: { playerName: string; message: string; timestamp: string }) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        playerName: data.playerName,
        message: data.message,
        timestamp: new Date(data.timestamp)
      };
      setChatMessages(prev => [...prev, newMessage]);
    };

    const handlePlayerJoined = (data: { player: Player; room: Room }) => {
      setCurrentRoom(data.room);
      const joinMessage: ChatMessage = {
        id: Date.now().toString(),
        playerName: 'System',
        message: `${data.player.name} joined the game`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, joinMessage]);
    };

    const handlePlayerLeft = (data: { playerName: string; room: Room }) => {
      setCurrentRoom(data.room);
      const leaveMessage: ChatMessage = {
        id: Date.now().toString(),
        playerName: 'System',
        message: `${data.playerName} left the game`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, leaveMessage]);
    };

    const handleGameState = (data: { gameState: GameState; validActions: string[] }) => {
      setGameState(data.gameState);
      setValidActions(data.validActions);
      setGameStarted(true);
    };

    const handleGameStarted = (data: { gameState: GameState; validActions: string[] }) => {
      setGameState(data.gameState);
      setValidActions(data.validActions);
      setGameStarted(true);
      const startMessage: ChatMessage = {
        id: Date.now().toString(),
        playerName: 'System',
        message: 'Game started! Good luck!',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, startMessage]);
    };

    socket.on('chat-message', handleChatMessage);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('gameState', handleGameState);
    socket.on('game-started', handleGameStarted);

    return () => {
      socket.off('chat-message', handleChatMessage);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('gameState', handleGameState);
      socket.off('game-started', handleGameStarted);
    };
  }, [socket]);

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    socket.emit('chat-message', {
      message: chatInput.trim()
    });
    
    setChatInput('');
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  };

  const startGame = () => {
    socket.emit('start-game');
  };

  const performAction = (action: string, amount?: number) => {
    socket.emit('game-action', { action, amount });
  };

  const handleRaise = () => {
    if (raiseAmount > 0) {
      performAction('raise', raiseAmount);
      setRaiseAmount(0);
    }
  };

  const formatCard = (card: Card) => {
    const suitSymbols: { [key: string]: string } = {
      'hearts': '♥️',
      'diamonds': '♦️',
      'clubs': '♣️',
      'spades': '♠️'
    };
    return `${card.rank}${suitSymbols[card.suit] || card.suit}`;
  };

  const getPhaseDisplay = (phase: string) => {
    const phaseNames: { [key: string]: string } = {
      'waiting': 'Waiting for players',
      'pre_flop': 'Pre-Flop',
      'flop': 'Flop',
      'turn': 'Turn',
      'river': 'River',
      'showdown': 'Showdown',
      'finished': 'Hand Complete'
    };
    return phaseNames[phase] || phase;
  };

  const renderSeat = (seatNumber: number) => {
    const roomPlayer = currentRoom.players.find(p => p.seat === seatNumber);
    const gamePlayer = gameState?.players.find(p => p.seat === seatNumber);
    const isCurrentPlayer = roomPlayer?.seat === playerSeat;
    const isActivePlayer = gameState && gameState.players[gameState.currentPlayerIndex]?.seat === seatNumber;
    const isDealer = gameState?.dealerPosition === seatNumber;
    
    return (
      <div 
        key={seatNumber} 
        className={`seat ${
          roomPlayer ? 'occupied' : 'empty'
        } ${
          isCurrentPlayer ? 'current-player' : ''
        } ${
          isActivePlayer ? 'active-player' : ''
        } ${
          gamePlayer?.isFolded ? 'folded' : ''
        } ${
          gamePlayer?.isAllIn ? 'all-in' : ''
        }`}
      >
        {roomPlayer ? (
          <div className="player-info">
            <div className="player-header">
              <div className="player-name">{roomPlayer.name}</div>
              {isDealer && <div className="dealer-button">D</div>}
            </div>
            <div className="player-chips">${gamePlayer?.chips || 1000}</div>
            {gamePlayer && gamePlayer.currentBet > 0 && (
              <div className="current-bet">${gamePlayer.currentBet}</div>
            )}
            {gamePlayer?.lastAction && (
              <div className="last-action">{gamePlayer.lastAction.toUpperCase()}</div>
            )}
            {gamePlayer && gamePlayer.holeCards.length > 0 && isCurrentPlayer && (
              <div className="hole-cards">
                {gamePlayer.holeCards.map((card, idx) => (
                  <div key={idx} className="card">{formatCard(card)}</div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-seat">Empty Seat</div>
        )}
      </div>
    );
  };

  return (
    <div className="game-room">
      <div className="room-header">
        <h1>Room: {currentRoom.code}</h1>
        <div className="room-info">
          <span>Players: {currentRoom.players.length}/{currentRoom.maxPlayers}</span>
          <button onClick={onLeaveRoom} className="leave-button">Leave Room</button>
        </div>
      </div>

      <div className="game-area">
        <div className="poker-table">
          <div className="table-center">
            {gameState && (
              <div className="game-status">
                <div className="phase-info">{getPhaseDisplay(gameState.phase)}</div>
                <div className="hand-number">Hand #{gameState.handNumber}</div>
              </div>
            )}
            
            <div className="community-cards">
              {gameState && gameState.communityCards.length > 0 ? (
                gameState.communityCards.map((card, idx) => (
                  <div key={idx} className="card community-card">{formatCard(card)}</div>
                ))
              ) : (
                Array.from({ length: 5 }, (_, idx) => (
                  <div key={idx} className="card-placeholder">?</div>
                ))
              )}
            </div>
            
            <div className="pot-info">
              {gameState && gameState.pots.length > 0 ? (
                gameState.pots.map((pot, idx) => (
                  <div key={idx} className="pot-amount">
                    {pot.isMainPot ? 'Main Pot' : `Side Pot ${idx}`}: ${pot.amount}
                  </div>
                ))
              ) : (
                <div className="pot-amount">Pot: $0</div>
              )}
            </div>
          </div>
          
          <div className="seats-container">
            {Array.from({ length: 6 }, (_, i) => renderSeat(i))}
          </div>
        </div>

        <div className="sidebar">
          {!gameStarted && currentRoom.players.length >= 2 && (
            <div className="game-controls">
              <button onClick={startGame} className="start-game-btn">
                Start Game
              </button>
            </div>
          )}
          
          {gameStarted && gameState && (
            <div className="action-controls">
              <div className="current-bet-info">
                <div>Current Bet: ${gameState.currentBet}</div>
                <div>Min Raise: ${gameState.minRaise}</div>
              </div>
              
              {validActions.length > 0 && (
                <div className="action-buttons">
                  {validActions.includes('fold') && (
                    <button 
                      onClick={() => performAction('fold')} 
                      className="action-btn fold-btn"
                    >
                      Fold
                    </button>
                  )}
                  {validActions.includes('check') && (
                    <button 
                      onClick={() => performAction('check')} 
                      className="action-btn check-btn"
                    >
                      Check
                    </button>
                  )}
                  {validActions.includes('call') && (
                    <button 
                      onClick={() => performAction('call')} 
                      className="action-btn call-btn"
                    >
                      Call ${gameState.currentBet - (gameState.players.find(p => p.seat === playerSeat)?.currentBet || 0)}
                    </button>
                  )}
                  {validActions.includes('raise') && (
                    <div className="raise-controls">
                      <input
                        type="number"
                        value={raiseAmount}
                        onChange={(e) => setRaiseAmount(Number(e.target.value))}
                        placeholder="Raise amount"
                        min={gameState.minRaise}
                        className="raise-input"
                      />
                      <button 
                        onClick={handleRaise} 
                        className="action-btn raise-btn"
                        disabled={raiseAmount < gameState.minRaise}
                      >
                        Raise
                      </button>
                    </div>
                  )}
                  {validActions.includes('all_in') && (
                    <button 
                      onClick={() => performAction('all_in')} 
                      className="action-btn all-in-btn"
                    >
                      All In
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="chat-container">
            <div className="chat-header">
              <h3>Chat</h3>
            </div>
            <div className="chat-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-message ${msg.playerName === 'System' ? 'system-message' : ''}`}>
                  <span className="message-author">{msg.playerName}:</span>
                  <span className="message-text">{msg.message}</span>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Type a message..."
                className="chat-input"
                maxLength={200}
              />
              <button onClick={sendChatMessage} className="send-button">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
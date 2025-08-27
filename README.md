# GGPoker 🃏

A minimal Texas Hold'em poker web application built for playing with friends. Features real-time multiplayer gameplay, chat functionality, and a clean poker table interface.

## Features

- **Real-time Multiplayer**: Up to 6 players per room using Socket.IO
- **Complete Poker Engine**: Full Texas Hold'em implementation with proper hand evaluation
- **Room Management**: Create and join private poker rooms
- **Chat System**: In-game chat for player communication
- **Responsive UI**: Clean, modern interface with green felt poker table theme
- **Game Features**:
  - Automatic blind posting (small/big blinds)
  - All betting actions: fold, check, call, raise, all-in
  - Side pots for all-in scenarios
  - Community cards (flop, turn, river)
  - Hand evaluation and winner determination
  - Turn-based gameplay with visual indicators

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Socket.IO Client** for real-time communication
- **Vitest** for unit testing
- **Playwright** for end-to-end testing

### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket communication
- **TypeScript** for type safety
- **Crypto-secure** card shuffling using Node.js randomBytes
- **Vitest** for unit testing

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ggpoker
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start both the client (http://localhost:5173) and server (http://localhost:3001) concurrently.

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

   The application will be available at http://localhost:3001

## Available Scripts

### Development
- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client development server
- `npm run dev:server` - Start only the server development server

### Building
- `npm run build` - Build both client and server for production
- `npm run build:client` - Build only the client
- `npm run build:server` - Build only the server

### Testing
- `npm test` - Run all tests (client + server)
- `npm run test:client` - Run client unit tests
- `npm run test:server` - Run server unit tests
- `npm run test:e2e` - Run end-to-end tests

### Code Quality
- `npm run lint` - Lint both client and server code
- `npm run lint:client` - Lint only client code
- `npm run lint:server` - Lint only server code

### Utilities
- `npm run install:all` - Install dependencies for root, client, and server

## How to Play

1. **Create or Join a Room**
   - Enter a room name to create a new room or join an existing one
   - Rooms support up to 6 players

2. **Start the Game**
   - Once at least 2 players have joined, any player can start the game
   - The game will automatically assign blinds and deal cards

3. **Gameplay**
   - Players take turns in clockwise order
   - Available actions: Fold, Check, Call, Raise, All-in
   - The game progresses through: Pre-flop → Flop → Turn → River
   - Winners are determined automatically based on hand strength

4. **Game Features**
   - **Blinds**: Small and big blinds rotate each hand
   - **Side Pots**: Automatically created when players go all-in
   - **Hand Evaluation**: Supports all poker hands from high card to royal flush
   - **Visual Indicators**: Active player highlighting, folded players, all-in status

## Project Structure

```
ggpoker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx        # Main app component
│   │   └── ...
│   ├── e2e/               # Playwright tests
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── poker/         # Poker game engine
│   │   ├── index.ts       # Express server
│   │   └── rooms.ts       # Room management
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### REST API
- `GET /health` - Health check endpoint
- `POST /api/rooms` - Create a new poker room

### Socket Events

#### Client → Server
- `join-room` - Join a poker room
- `leave-room` - Leave the current room
- `chat-message` - Send a chat message
- `start-game` - Start the poker game
- `player-action` - Perform a game action (fold, call, raise, etc.)

#### Server → Client
- `connect` / `disconnect` - Connection status
- `join-success` / `join-error` - Room join results
- `player-joined` / `player-left` - Player updates
- `chat-message` - Broadcast chat messages
- `game-started` - Game initialization
- `gameState` - Real-time game state updates

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:client    # React component tests
npm run test:server    # Poker engine tests
npm run test:e2e       # End-to-end tests
```

### Code Quality

```bash
# Lint code
npm run lint

# The project uses ESLint with TypeScript support
```

### Hot Reload

Both client and server support hot reload during development:
- Client: Vite HMR for instant React updates
- Server: Automatic restart on file changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT License - feel free to use this project for your own poker games!

## 🌐 Online Deployment (FREE)

Deploy your poker game online for free using Vercel + Railway:

### **Step 1: Prepare Your Code**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial poker game"
   git branch -M main
   git remote add origin https://github.com/yourusername/ggpoker.git
   git push -u origin main
   ```

### **Step 2: Deploy Backend (Railway - FREE)**

1. **Sign up at [Railway.app](https://railway.app)**
2. **Connect GitHub** and select your repository
3. **Deploy from GitHub** - Railway will auto-detect Node.js
4. **Set Environment Variables** in Railway dashboard:
   ```
   NODE_ENV=production
   CLIENT_URL=https://your-app-name.vercel.app
   ```
5. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

### **Step 3: Deploy Frontend (Vercel - FREE)**

1. **Sign up at [Vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Set Build Settings**:
   - Framework Preset: `Vite`
   - Root Directory: `client`
4. **Set Environment Variables**:
   ```
   VITE_SERVER_URL=https://your-app.railway.app
   ```
5. **Deploy** - Vercel will build and deploy automatically

### **Step 4: Update Railway Environment**

1. **Go back to Railway dashboard**
2. **Update CLIENT_URL** with your Vercel URL:
   ```
   CLIENT_URL=https://your-app-name.vercel.app
   ```
3. **Redeploy** the Railway service

### **🎉 Your Game is Live!**

Share your Vercel URL with friends - they can join from anywhere!

### **Alternative: Quick Test with ngrok**

For immediate testing without deployment:

```bash
# Install ngrok globally
npm install -g ngrok

# In one terminal, start your app
npm run dev

# In another terminal, expose it
ngrok http 5173
```

Share the ngrok URL with friends for instant access!

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 3001 or 5173 are in use, modify the port settings in the respective package.json files

2. **Installation issues**: Make sure you're using Node.js >= 18.0.0 and npm >= 8.0.0

3. **Build failures**: Run `npm run install:all` to ensure all dependencies are properly installed

4. **Socket connection issues**: Check that both client and server are running and accessible

5. **CORS errors in production**: Ensure CLIENT_URL environment variable is set correctly in Railway

6. **Environment variables not working**: Make sure to restart/redeploy after setting environment variables

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure you're using supported Node.js/npm versions
4. Check that required ports are available
5. Verify environment variables are set correctly in deployment platforms

Enjoy your poker games! 🎰
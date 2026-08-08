# VibeChat 💬

A real-time one-on-one chat application built with the MERN stack and Socket.IO, featuring live messaging, online presence, unread message counts, and image sharing.

## Features

- **Real-time messaging** — instant message delivery using Socket.IO, no polling or refreshing required
- **Online status indicators** — see which users are currently online in real time
- **Unread message counts** — per-user unread badges in the sidebar, synced live across the app
- **Read receipts** — "Delivered" / "Seen" status on your latest sent message
- **Image sharing in chat** — upload and send images via Cloudinary, with a Pinterest-style masonry gallery of all images shared in a conversation
- **Profile management** — edit name, bio, and profile picture
- **User search** — quickly find and start a conversation with any user

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Socket.IO Client
- React Router

**Backend**
- Node.js + Express
- MongoDB (Mongoose)
- Socket.IO
- Cloudinary for image uploads

## Project Structure

```
VibeChat/
├── client/                 # React frontend
│   └── src/
│       ├── contexts/       # UserContext, SocketContext, MessageContext, ProfilesContext
│       └── components/     # SideBar, ChatContainer, ProfilePage, SignUpPage, etc.
└── server/                  # Express backend
    ├── controller/          # userController, messageController
    ├── routes/               # userRoute, messageRoute
    ├── middleware/           # image upload to cloudinary (chat-app folder)
    └── server.js             # Express app + Socket.IO setup
```

## Getting Started

### Prerequisites
- Node.js
- MongoDB (local or Atlas)
- A Cloudinary account (for image uploads)

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/raheemmiya/VibeChat--Chat-App-.git
   cd VibeChat--Chat-App-
   ```

2. Install dependencies for both client and server
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. Set up environment variables

   Create a `.env` file inside `server/` (see `.env.example`):
   ```
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Run the app
   ```bash
   # from /server
   npm run dev

   # from /client, in a separate terminal
   npm run dev
   ```

5. Open `http://localhost:5173` in your browser

## How It Works

- On login, the server issues a JWT stored in an httpOnly cookie — the client never handles the raw token directly.
- live Socket.IO connection, enabling the server to route messages, seen-receipts, and online-status updates to the correct browser session in real time.
- Unread counts are computed from the full set of messages addressed to the logged-in user (not just the currently open conversation), and update live as new messages arrive or are marked seen — no page refresh needed.

## Author

Built by [raheemmiya](https://github.com/raheemmiya)

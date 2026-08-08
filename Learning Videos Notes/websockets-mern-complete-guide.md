# WebSockets Mastery: From Zero to a Production MERN Chat App

This guide takes you from "what even is a WebSocket" to shipping a real-time chat app with rooms, typing indicators, online presence, JWT auth, and MongoDB persistence — using the MERN stack (MongoDB, Express, React, Node).

---

## PART 1 — THEORY: What a WebSocket Actually Is

### 1.1 The problem WebSockets solve

Regular HTTP is **request-response** and **stateless**:

- The client (browser) sends a request.
- The server sends back a response.
- The connection is then done. If the server has new data 5 seconds later, it has **no way to push it to you**. You have to ask again.

For a chat app, this is a problem. If your friend sends you a message, you don't want to ask the server "any new messages? any new messages? any new messages?" every second. You want the server to be able to say "hey, here's a message" the instant it happens.

Before WebSockets existed, people worked around this with hacks:

| Technique | How it works | Problem |
|---|---|---|
| **Polling** | Client asks server every N seconds: "anything new?" | Wasteful — most requests return "no", high latency, server load |
| **Long polling** | Client asks server; server *holds* the request open until it has data, then responds; client immediately asks again | Better, but still HTTP overhead per cycle, headers on every round trip |
| **Server-Sent Events (SSE)** | Server can push data to client over a single long-lived HTTP connection | One-directional only (server → client). Client still can't push data back over the same channel |
| **WebSockets** | A single TCP connection stays open; **both sides can send data to each other at any time** | This is the real solution |

### 1.2 What a WebSocket is, precisely

A WebSocket is a **persistent, full-duplex (two-way), single TCP connection** between client and server. Once it's open:

- The server can send data to the client without being asked.
- The client can send data to the server without waiting for a response.
- Both can do this **at the same time**, independently.
- No HTTP headers are re-sent on every message (unlike polling), so overhead per message is tiny.

Full-duplex is the key word — think of it like a phone call, not like passing notes back and forth (that's HTTP). Once the call connects, either person can talk whenever they want.

### 1.3 The WebSocket Handshake (how the connection is born)

A WebSocket connection actually **starts as a normal HTTP request**. The client says "I'd like to upgrade this HTTP connection into a WebSocket connection," and if the server agrees, the underlying TCP connection is repurposed.

Here's what that looks like conceptually:

**Client → Server (HTTP request with special headers):**
```
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

**Server → Client (HTTP 101 response):**
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

- `Upgrade: websocket` — "I want to switch protocols."
- `Sec-WebSocket-Key` — a random value the client generates.
- The server computes a hash of that key (with a fixed magic string defined in the spec) and returns it as `Sec-WebSocket-Accept`, proving it's a real WebSocket-aware server, not some HTTP server that doesn't understand the request.
- `101 Switching Protocols` — the HTTP status code that means "OK, we're not doing HTTP anymore on this connection — we're doing WebSocket now."

After this handshake, the connection is no longer HTTP. It's raw TCP carrying WebSocket **frames** (small packets of data with a lightweight header). You never have to write this handshake code yourself — libraries handle it — but understanding it demystifies "why does my WebSocket URL start with `ws://` and why does it need an HTTP server to attach to?"

### 1.4 `ws://` and `wss://`

- `ws://` — WebSocket over plain TCP (like `http://`)
- `wss://` — WebSocket over TLS/SSL, i.e., encrypted (like `https://`)

**Always use `wss://` in production.** Browsers increasingly block insecure `ws://` connections from HTTPS pages (mixed content), and you don't want chat messages sniffable on the network anyway.

### 1.5 WebSocket Frames and Message Types

Data flows as **frames**. You don't usually deal with raw frames yourself, but conceptually a frame can carry:

- **Text data** (usually JSON strings in real apps)
- **Binary data** (Blobs / ArrayBuffers — useful for images, audio, files)
- **Control frames**: `ping`, `pong` (keep-alive / heartbeat — used to detect dead connections), and `close` (graceful shutdown with a status code and optional reason)

### 1.6 The Connection Lifecycle

Every WebSocket connection — client or server side — goes through these events:

1. **Connecting** — handshake in progress
2. **Open** — handshake succeeded, you can now send/receive
3. **Message** — data arrived
4. **Error** — something went wrong (connection will typically close after this)
5. **Close** — connection ended, either gracefully (with a code) or abruptly (network drop)

You will structure almost all WebSocket code — client and server — around these five events.

### 1.7 Close Codes (important for debugging)

When a connection closes, it carries a numeric code:

| Code | Meaning |
|---|---|
| 1000 | Normal closure |
| 1001 | Endpoint going away (e.g., browser tab closed) |
| 1006 | Abnormal closure (no close frame received — network died, server crashed) |
| 1008 | Policy violation (e.g., failed auth) |
| 1011 | Server error |

`1006` is the one you'll see constantly during development — it just means "the connection dropped without a clean goodbye" (server restarted, wifi dropped, etc.). This is why **reconnection logic** is not optional in real apps — we'll build it.

### 1.8 Raw WebSockets vs. Socket.io — which should you use?

You have two real choices in the Node ecosystem:

**Option A: `ws` (raw WebSocket library)**
- A thin, fast, spec-compliant implementation of the WebSocket protocol.
- You build everything yourself: rooms, reconnection, fallback, acknowledgments, broadcasting logic.
- Good for: learning fundamentals, minimal apps, or when you want full control / lowest overhead.

**Option B: Socket.io**
- A higher-level library built *on top of* WebSockets (with automatic fallback to HTTP long-polling if WebSocket isn't available — rare today, but still there for hostile networks/proxies).
- Gives you out of the box: automatic reconnection, rooms/namespaces, broadcasting helpers, acknowledgment callbacks (like a request/response pattern over the socket), middleware (great for auth), and a matching client library.
- Requires the **Socket.io client on the frontend too** — it's not vanilla WebSocket compatible; it has its own protocol on top of WebSocket frames.
- Good for: real production apps, especially chat apps, where you don't want to reinvent reconnection and rooms.

**For a MERN chat app, Socket.io is the standard, pragmatic choice**, and that's what real-world chat apps (Discord clones, Slack clones, etc.) built with MERN typically use. So this guide teaches you **both**:
- Part 2: raw `ws` — so you deeply understand the fundamentals with zero abstraction.
- Part 3 onward: Socket.io — to build the actual production chat app.

Understanding raw `ws` first means Socket.io will never feel like "magic" to you — you'll know exactly what it's doing underneath.

---

## PART 2 — Raw WebSockets: Bare Metal First

### 2.1 The absolute simplest server (Node.js, `ws` library)

Install it:
```bash
npm install ws
```

```js
// server.js
const { WebSocketServer } = require('ws');

// Creates a WebSocket server listening on port 8080
const wss = new WebSocketServer({ port: 8080 });

// 'connection' fires every time a NEW client connects.
// 'socket' here represents ONE specific client's connection.
wss.on('connection', (socket) => {
  console.log('A client connected');

  // Fires whenever THIS client sends a message
  socket.on('message', (data) => {
    // data arrives as a Buffer by default — convert to string
    console.log('Received:', data.toString());

    // Send a message back to just this client
    socket.send(`Server received: ${data.toString()}`);
  });

  // Fires when this client disconnects
  socket.on('close', () => {
    console.log('A client disconnected');
  });

  // Fires on connection-level errors
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

console.log('WebSocket server running on ws://localhost:8080');
```

**Line-by-line theory:**
- `wss` (WebSocket Server) is the server itself — it can have many connected clients.
- `socket` (inside the `connection` callback) represents **one single client's connection**. Every connected browser tab gets its own `socket` object on the server.
- `wss.clients` is a `Set` containing every currently-connected `socket` — this is how you'll broadcast to everyone later.

### 2.2 The absolute simplest client (plain browser JavaScript)

```html
<!DOCTYPE html>
<html>
<body>
  <script>
    // Opens a connection immediately (async — doesn't block)
    const socket = new WebSocket('ws://localhost:8080');

    // Fires once the handshake succeeds
    socket.addEventListener('open', () => {
      console.log('Connected to server');
      socket.send('Hello server!');
    });

    // Fires every time the server sends data
    socket.addEventListener('message', (event) => {
      console.log('From server:', event.data);
    });

    // Fires on error
    socket.addEventListener('error', (err) => {
      console.error('WebSocket error:', err);
    });

    // Fires when connection closes (code tells you why — see table above)
    socket.addEventListener('close', (event) => {
      console.log('Disconnected. Code:', event.code, 'Reason:', event.reason);
    });
  </script>
</body>
</html>
```

The **native `WebSocket` object is built into every browser** — no library needed for this part. `new WebSocket(url)` immediately starts the handshake in the background; you don't `await` it, you listen for the `open` event.

### 2.3 Broadcasting to everyone (the core of chat apps)

A chat app's core mechanic is: one client sends a message → the server sends it to *all* (or some) other clients. Here's the raw way:

```js
const { WebSocketServer, WebSocket } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    const message = data.toString();

    // Loop over every connected client
    wss.clients.forEach((client) => {
      // client.readyState tells you the connection's current state.
      // WebSocket.OPEN means it's actually ready to receive data
      // (it might be CONNECTING, CLOSING, or CLOSED otherwise)
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message); // send to everyone EXCEPT the sender
      }
    });
  });
});
```

**`readyState` values** (exist on every socket, client or server side):
| Value | Constant | Meaning |
|---|---|---|
| 0 | `CONNECTING` | Handshake in progress |
| 1 | `OPEN` | Ready to send/receive |
| 2 | `CLOSING` | Close handshake started |
| 3 | `CLOSED` | Fully closed |

Always check `readyState === WebSocket.OPEN` before calling `.send()` — sending on a closed/closing socket throws an error.

### 2.4 JSON messages (you'll always do this in real apps)

Raw WebSockets only send strings or binary — no built-in concept of "message types." So real apps agree on a JSON envelope convention:

```js
// Sending a structured message
socket.send(JSON.stringify({
  type: 'chat_message',
  payload: { text: 'Hey!', sender: 'Alice', timestamp: Date.now() }
}));
```

```js
// Receiving and routing by type
socket.on('message', (data) => {
  const msg = JSON.parse(data.toString());

  switch (msg.type) {
    case 'chat_message':
      handleChatMessage(msg.payload);
      break;
    case 'typing':
      handleTyping(msg.payload);
      break;
    case 'user_joined':
      handleUserJoined(msg.payload);
      break;
    default:
      console.warn('Unknown message type:', msg.type);
  }
});
```

This `{ type, payload }` pattern is the foundation of every real-time protocol you'll ever build — including what Socket.io does internally with "events."

### 2.5 Reconnection logic (raw WebSockets don't do this for you)

This is the single biggest reason people reach for Socket.io. With raw `ws`, if the connection drops, **nothing reconnects automatically** — you must write it:

```js
function connectWithRetry(url, { onMessage } = {}) {
  let socket;
  let retryDelay = 1000; // start at 1 second
  const maxDelay = 30000; // cap at 30 seconds

  function connect() {
    socket = new WebSocket(url);

    socket.addEventListener('open', () => {
      console.log('Connected');
      retryDelay = 1000; // reset backoff once we succeed
    });

    socket.addEventListener('message', (e) => onMessage?.(e.data));

    socket.addEventListener('close', () => {
      console.log(`Disconnected, retrying in ${retryDelay}ms`);
      setTimeout(connect, retryDelay);
      // Exponential backoff: 1s, 2s, 4s, 8s... up to maxDelay
      retryDelay = Math.min(retryDelay * 2, maxDelay);
    });

    socket.addEventListener('error', () => socket.close());
  }

  connect();
  return {
    send: (data) => socket.readyState === WebSocket.OPEN && socket.send(data),
  };
}
```

**Why exponential backoff?** If the server is down, you don't want 10,000 clients hammering it with a reconnect attempt every second the moment it comes back up (a "thundering herd"). Backing off spreads out retry attempts.

This is exactly the kind of thing Socket.io gives you for free — which is why we now move to it for the real chat app.

---

## PART 3 — Socket.io Fundamentals

### 3.1 What Socket.io adds on top of raw WebSockets

- **Automatic reconnection** with backoff, built in.
- **Rooms** — group sockets together (e.g., one room per chat conversation) so you can broadcast to a subset of users instead of everyone.
- **Namespaces** — separate communication channels over the same underlying connection (e.g., `/chat` vs `/notifications`).
- **Event-based API** — instead of manually parsing `{ type, payload }` JSON, you call `.emit('event_name', data)` and `.on('event_name', callback)` — Socket.io handles the serialization.
- **Acknowledgments** — the sender can get a callback confirming the receiver processed the message (like a mini request/response over the socket).
- **Middleware** — run logic (like auth) before a connection is accepted, or before specific events are processed.
- **Fallback transport** — if WebSocket is blocked by a corporate proxy/firewall, it can fall back to long-polling automatically.

The tradeoff: **the client must also use the `socket.io-client` library** — you cannot connect to a Socket.io server with a plain `new WebSocket()`, because Socket.io wraps the WebSocket protocol with its own framing/handshake on top.

### 3.2 Install

```bash
# Backend
npm install socket.io express

# Frontend (in your React app)
npm install socket.io-client
```

### 3.3 Minimal Socket.io server

```js
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app); // Socket.io attaches to a raw HTTP server, not directly to Express

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // your React dev server URL (Vite default)
    methods: ['GET', 'POST'],
  },
});

// 'connection' fires per client, just like raw ws
io.on('connection', (socket) => {
  console.log('User connected:', socket.id); // Socket.io auto-assigns a unique ID per connection

  // Listen for a custom event named 'chat_message'
  socket.on('chat_message', (data) => {
    console.log('Message:', data);

    // Broadcast to ALL connected clients, including sender
    io.emit('chat_message', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, reason);
  });
});

httpServer.listen(4000, () => console.log('Server running on port 4000'));
```

**Why attach to `http.createServer(app)` instead of just using Express directly?** Socket.io needs a raw Node HTTP server to intercept the initial handshake request (`Upgrade: websocket`) before Express's routing even sees it. Express itself is just middleware that runs *on* an HTTP server — so we create the HTTP server explicitly, hand it to both Express (for normal REST routes) and Socket.io (for the WebSocket upgrade), and they coexist on the same port.

### 3.4 `socket.emit` vs `io.emit` vs `socket.broadcast.emit` — this trips everyone up

This is the single most confusing part of Socket.io for beginners. Here's the exact breakdown:

| Call | Sends to |
|---|---|
| `socket.emit('event', data)` | Only **this one client** (the specific connection this callback fired for) |
| `io.emit('event', data)` | **Every** connected client, including the sender |
| `socket.broadcast.emit('event', data)` | **Every** connected client **except** the sender |
| `io.to(roomName).emit('event', data)` | Every client in a specific **room** |
| `socket.to(roomName).emit('event', data)` | Every client in a room **except** the sender |

For a chat app, you'll use `socket.to(roomName).emit(...)` constantly — e.g., "tell everyone else in this conversation that a message arrived, but the sender already rendered it optimistically on their own screen, so don't send it back to them."

### 3.5 Rooms — the mechanism for private chats & group chats

A **room** is just a string label a socket can join. Multiple sockets in the same room can be targeted together.

```js
io.on('connection', (socket) => {
  // Join a room (e.g., a specific conversation ID)
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);

    // Let others in that room know someone joined
    socket.to(roomId).emit('user_joined', { socketId: socket.id });
  });

  socket.on('send_message', ({ roomId, message }) => {
    // Only people in this specific room get the message
    socket.to(roomId).emit('receive_message', message);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
  });
});
```

A socket can be in multiple rooms simultaneously (e.g., a user in 5 different group chats has their socket joined to 5 room IDs at once). Socket.io also auto-creates a room per socket named after `socket.id` — that's how private "to one person" messaging is technically implemented under the hood.

### 3.6 Acknowledgments (getting a "yes I got it" reply)

Sometimes you want to know the server actually processed something — like a delivery receipt.

```js
// Client
socket.emit('send_message', { text: 'hello' }, (response) => {
  // this callback fires when the SERVER acknowledges it
  console.log('Server confirmed:', response.status);
});
```

```js
// Server
socket.on('send_message', (data, callback) => {
  saveMessageToDatabase(data);
  callback({ status: 'delivered', id: data.id }); // calling this triggers the client's callback
});
```

This is how you'd implement chat "read receipts" or "message delivered" checkmarks.

### 3.7 Middleware (this is where auth happens)

Socket.io lets you intercept connections before they're accepted:

```js
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth.token; // client sends this during connection
  if (!token) return next(new Error('Authentication error: no token'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId; // attach user info to the socket for later use
    next(); // allow the connection
  } catch (err) {
    next(new Error('Authentication error: invalid token'));
  }
});
```

We'll wire the client side of this into the React app in Part 5.

---

## PART 4 — React Integration: Hooks, Refs, and Why They Matter Here

This is the part most MERN devs get wrong, so let's be precise about **why** each hook is used the way it is.

### 4.1 The core problem: sockets and React's render cycle don't naturally get along

A WebSocket/Socket.io connection is a **stateful, long-lived, imperative object** — it's created once and lives independently of your component's render cycle. React components, on the other hand, **re-render constantly** (on every state change). If you're not careful, you'll accidentally create a *new* socket connection on every render, which is a serious bug (memory leaks, duplicate event listeners, duplicate messages).

This is exactly the kind of problem `useRef` and `useEffect` exist to solve.

### 4.2 Why `useRef` (not `useState`) for the socket instance

```jsx
const socketRef = useRef(null);
```

- **`useRef` persists a value across re-renders WITHOUT causing a re-render when it changes.** That's exactly what we want for the socket object — we need to *keep a reference to it*, but changing/creating it should never itself trigger a re-render (the connection's state, like "connected" or "list of messages," is what should trigger re-renders — the socket *object* itself is just plumbing).
- If you used `useState` for the socket instead, every time you did `setSocket(newSocket)` it would cause a re-render, and worse, beginners often end up recreating the socket in a way that spirals into infinite reconnect loops.
- **Rule of thumb:** if a value needs to survive re-renders but *changing it should not cause a re-render*, use `useRef`. If a value change *should* cause a re-render (like "new message arrived, update the UI"), use `useState`.

### 4.3 Why `useEffect` for connecting/disconnecting

```jsx
useEffect(() => {
  const socket = io('http://localhost:4000');
  socketRef.current = socket;

  return () => {
    socket.disconnect(); // cleanup function — runs when component unmounts
  };
}, []); // empty dependency array = run once, on mount only
```

- `useEffect` is React's designated place for **side effects** — anything that reaches outside of React's own rendering (network requests, subscriptions, timers, and yes, WebSocket connections).
- The **empty dependency array `[]`** means "run this effect exactly once, when the component first mounts" — perfect for "open the connection once."
- The **cleanup function** (the function you `return` from inside `useEffect`) runs automatically when the component unmounts (or before the effect re-runs, if dependencies changed). This is **critical** for sockets: if you don't disconnect in the cleanup, navigating away from the chat page (in a single-page app) leaves a zombie connection open, still listening for events and potentially still holding stale closures over old state — a classic memory leak and source of "why am I getting duplicate messages" bugs.

### 4.4 Why `useState` for messages, online users, typing status

```jsx
const [messages, setMessages] = useState([]);
const [onlineUsers, setOnlineUsers] = useState([]);
const [isTyping, setIsTyping] = useState(false);
```

Anything that should cause the UI to visually update belongs in `useState`. When a new message arrives over the socket, you call `setMessages(prev => [...prev, newMessage])` — this triggers React to re-render the message list.

**Important gotcha:** always use the **functional update form** (`setMessages(prev => [...prev, newMessage])`) rather than `setMessages([...messages, newMessage])` inside a socket event listener. Here's why:

The event listener you register inside `useEffect` (with `[]` deps) is set up **once**, and it closes over whatever `messages` was *at that exact moment* — this is called a **stale closure**. If you reference `messages` directly inside the listener weeks — well, renders — later, you'll be reading an outdated, stale value, and messages will appear to "go missing" as later ones overwrite earlier ones. The functional update form `(prev => ...)` sidesteps this entirely because React always hands you the *true current* state at the time the update actually runs, regardless of what the closure captured.

This is one of the most common real bugs in socket + React code, so we'll be careful about it throughout.

### 4.5 A custom hook: `useSocket` — the reusable foundation

Rather than repeating connection logic in every component, wrap it in a custom hook:

```jsx
// hooks/useSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export function useSocket(token) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Don't connect until we actually have an auth token
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token }, // read by the server's io.use() middleware, see Part 3.7
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', (err) => {
      console.error('Connection failed:', err.message);
    });

    // Cleanup: runs on unmount OR if `token` changes (triggering a re-run)
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]); // re-run this effect if the token changes (e.g., user logs in)

  return { socket: socketRef.current, isConnected };
}
```

Notice the dependency array is now `[token]`, not `[]` — deliberately. If a user logs in *after* the component already mounted (token was initially `null`, then becomes a real JWT), we want the effect to re-run and establish the connection at that point. React will also correctly run the cleanup function on the *old* effect (which does nothing, since `token` was falsy and we returned early) before running the new one.

---

## PART 5 — Building the Full MERN Chat App

Now we assemble everything into an actual working app: Express + Socket.io + MongoDB backend, React frontend.

### 5.1 Project structure

```
chat-app/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── middleware/
│   │   └── socketAuth.js
│   ├── sockets/
│   │   └── chatHandlers.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── conversations.js
│   ├── server.js
│   └── .env
└── client/
    ├── src/
    │   ├── hooks/
    │   │   └── useSocket.js
    │   ├── context/
    │   │   └── SocketContext.jsx
    │   ├── components/
    │   │   ├── ChatWindow.jsx
    │   │   ├── MessageList.jsx
    │   │   ├── MessageInput.jsx
    │   │   └── OnlineUsers.jsx
    │   └── App.jsx
```

### 5.2 MongoDB Models (Mongoose)

```js
// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true, // we'll query "all messages for this conversation" constantly — index it
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }); // adds createdAt / updatedAt automatically

module.exports = mongoose.model('Message', messageSchema);
```

```js
// models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
```

**Why store messages in MongoDB at all, if Socket.io already delivers them live?** Because the socket only delivers to people *currently connected*. If a user opens the app tomorrow, there's no "replay" of yesterday's socket events — you need persisted history to load into the chat window on page load, via a normal REST `GET /api/conversations/:id/messages` endpoint.

### 5.3 Socket authentication middleware

```js
// middleware/socketAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return next(new Error('User not found'));

    socket.user = user; // attach the full user doc to this connection for later use
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
}

module.exports = socketAuth;
```

### 5.4 Main server file, wiring it all together

```js
// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const socketAuth = require('./middleware/socketAuth');
const registerChatHandlers = require('./sockets/chatHandlers');
const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversations');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});

io.use(socketAuth); // every connection must pass auth first

// Track which userId maps to which socket.id(s) — a user could have multiple tabs open
const onlineUsers = new Map(); // userId -> Set of socket.id

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();

  // Track this user as online
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  // Tell everyone this user is now online (only announce on their FIRST connection)
  if (onlineUsers.get(userId).size === 1) {
    io.emit('user_online', { userId });
  }

  registerChatHandlers(io, socket, onlineUsers);

  socket.on('disconnect', () => {
    const sockets = onlineUsers.get(userId);
    sockets?.delete(socket.id);
    if (sockets && sockets.size === 0) {
      onlineUsers.delete(userId);
      io.emit('user_offline', { userId }); // only announce offline once ALL their tabs close
    }
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(process.env.PORT || 4000, () =>
      console.log(`Server running on port ${process.env.PORT || 4000}`)
    );
  })
  .catch((err) => console.error('MongoDB connection error:', err));
```

**Why track sockets as a `Set` per user, not just one socket per user?** A real user might have the chat app open in two browser tabs, or on their phone and laptop simultaneously. If you naively say "user X disconnected → mark them offline," and they actually just closed *one* of two tabs, you'd incorrectly show them as offline while they're still active elsewhere. Tracking a `Set` of socket IDs per user solves this correctly.

### 5.5 Chat event handlers (separated into its own module for cleanliness)

```js
// sockets/chatHandlers.js
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

module.exports = function registerChatHandlers(io, socket, onlineUsers) {

  // Join a room per conversation the user is part of, right when they connect
  socket.on('join_conversations', async (conversationIds) => {
    conversationIds.forEach((id) => socket.join(id));
  });

  socket.on('send_message', async ({ conversationId, text }, callback) => {
    try {
      const message = await Message.create({
        conversationId,
        sender: socket.user._id,
        text,
      });

      await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });

      const populatedMessage = await message.populate('sender', 'username avatar');

      // Send to everyone else in the conversation room
      socket.to(conversationId).emit('receive_message', populatedMessage);

      // Acknowledge back to the sender (e.g., to replace an "optimistic" pending message with the confirmed one)
      callback?.({ status: 'ok', message: populatedMessage });
    } catch (err) {
      callback?.({ status: 'error', error: err.message });
    }
  });

  // Typing indicator — deliberately NOT saved to DB, this is ephemeral/transient state
  socket.on('typing_start', ({ conversationId }) => {
    socket.to(conversationId).emit('user_typing', {
      userId: socket.user._id,
      username: socket.user.username,
    });
  });

  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(conversationId).emit('user_stopped_typing', { userId: socket.user._id });
  });

  // Read receipts
  socket.on('mark_read', async ({ conversationId, messageIds }) => {
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: socket.user._id } } // $addToSet avoids duplicate entries
    );
    socket.to(conversationId).emit('messages_read', {
      userId: socket.user._id,
      messageIds,
    });
  });
};
```

### 5.6 React: Socket Context (so the connection is app-wide, not re-created per component)

```jsx
// context/SocketContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children, token }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SERVER_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('user_online', ({ userId }) => {
      // functional update: never stale, always builds off the true latest Set
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    });

    socket.on('user_offline', ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, onlineUserIds }}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook for consuming the context cleanly in any component
export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within a SocketProvider');
  return ctx;
}
```

**Why Context instead of just a custom hook called directly in every component?** If `useSocket()` created a *new* connection every time it was called, and you called it in three different components, you'd get three separate socket connections for one user — wasteful and buggy (three sets of duplicate event handlers firing). Context lets you create **one** socket connection at the top of your app (e.g., wrapping `<App />`) and share that single instance everywhere via `useContext`.

### 5.7 React: The Chat Window Component (the big one — states, refs, effects together)

```jsx
// components/ChatWindow.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import axios from 'axios';

export default function ChatWindow({ conversationId, currentUser }) {
  const { socket } = useSocketContext();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);     // for auto-scrolling
  const typingTimeoutRef = useRef(null);   // for debouncing the "stop typing" event

  // 1. Load message HISTORY via normal REST call when the conversation changes
  useEffect(() => {
    setIsLoading(true);
    axios.get(`/api/conversations/${conversationId}/messages`)
      .then((res) => setMessages(res.data))
      .finally(() => setIsLoading(false));
  }, [conversationId]); // re-run whenever the user switches conversations

  // 2. Join the socket room for this conversation + listen for live events
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_conversations', [conversationId]);

    function handleReceiveMessage(message) {
      if (message.conversationId !== conversationId) return; // ignore messages for OTHER open conversations
      setMessages((prev) => [...prev, message]); // functional update — avoids stale closure bug
    }

    function handleUserTyping({ userId }) {
      setTypingUsers((prev) => new Set(prev).add(userId));
    }

    function handleUserStoppedTyping({ userId }) {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    // CRITICAL cleanup: remove THESE SPECIFIC listeners when conversationId changes or component unmounts.
    // Without this, switching conversations 5 times leaves 5 stacked listeners all firing at once,
    // causing messages to appear duplicated 5x on screen.
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, conversationId]);

  // 3. Auto-scroll to the newest message whenever `messages` changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send a message (with optimistic UI update)
  const handleSend = useCallback(() => {
    if (!inputText.trim() || !socket) return;

    const optimisticMessage = {
      _id: `temp-${Date.now()}`, // temporary client-side ID
      conversationId,
      text: inputText,
      sender: { _id: currentUser._id, username: currentUser.username },
      createdAt: new Date().toISOString(),
      pending: true, // flag so the UI can show a "sending..." indicator
    };

    // Show it immediately, don't wait for server round trip
    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');

    socket.emit('send_message', { conversationId, text: inputText }, (response) => {
      if (response.status === 'ok') {
        // Replace the optimistic placeholder with the real, server-confirmed message
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMessage._id ? response.message : m))
        );
      } else {
        // Mark as failed so the UI can show a retry button
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMessage._id ? { ...m, failed: true } : m))
        );
      }
    });

    socket.emit('typing_stop', { conversationId });
  }, [inputText, socket, conversationId, currentUser]);

  // 5. Typing indicator with debounce, using useRef to hold the timeout ID across renders
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    socket.emit('typing_start', { conversationId });

    // Clear any previous pending "stop typing" timer
    clearTimeout(typingTimeoutRef.current);

    // Set a new one — if the user doesn't type again within 2s, tell others they stopped
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId });
    }, 2000);
  };

  if (isLoading) return <div>Loading messages...</div>;

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg._id} className={msg.pending ? 'message pending' : 'message'}>
            <strong>{msg.sender.username}: </strong>{msg.text}
            {msg.failed && <span className="error"> (failed to send)</span>}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* invisible anchor element we scroll into view */}
      </div>

      {typingUsers.size > 0 && <div className="typing-indicator">Someone is typing…</div>}

      <div className="input-bar">
        <input
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
```

**Why `typingTimeoutRef` is a `useRef` and not a regular variable:** A plain `let timeoutId` declared inside the component function would be **reset to `undefined` on every re-render** because the entire function body re-runs on each render. `useRef` is the React-sanctioned way to hold a mutable value (like a timer ID) that must **survive across renders** without itself causing a re-render when updated — exactly the same reasoning as the socket instance in Section 4.2.

**Why `messagesEndRef` is a `useRef`:** This is React's standard pattern for getting a **direct handle to a real DOM node** (`<div ref={messagesEndRef} />`). Once React renders that div, `messagesEndRef.current` points to the actual DOM element, and you can call native DOM methods on it (`.scrollIntoView()`) — something you cannot do purely through React state/props, because scrolling is an imperative DOM action, not a declarative rendering concern.

**Why `socket.off(...)` in the cleanup matters so much:** This is the #1 source of "duplicate messages" bugs in React + Socket.io apps. Every time this `useEffect` re-runs (which happens whenever `conversationId` changes), it registers *new* `handleReceiveMessage` etc. listener functions. If you don't explicitly remove the *old* ones in the cleanup function, they keep listening forever — so after switching between 3 conversations, a single incoming socket event would trigger 3 stacked handlers, each pushing the message into state, and you'd see the message rendered 3 times.

### 5.8 React: Sending the token during connection (client-side auth)

```jsx
// App.jsx
import { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // After login succeeds elsewhere in your app, store the token and this
  // state update will cause SocketProvider's useEffect ([token] dependency) to re-run and connect.
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
  }, [token]);

  return (
    <SocketProvider token={token}>
      {/* rest of your app, e.g. <ChatWindow /> */}
    </SocketProvider>
  );
}
```

---

## PART 6 — Advanced Topics

### 6.1 Scaling beyond one server: the Redis adapter

By default, `io.emit()` and rooms only work within **a single Node process's memory**. If you deploy multiple server instances behind a load balancer (for horizontal scaling), a user connected to Server A won't receive a broadcast triggered on Server B — because room membership and the `onlineUsers` map only exist in each process's own memory.

The fix is the **Redis adapter**, which uses Redis Pub/Sub so all your server instances can broadcast to each other's connected clients:

```bash
npm install @socket.io/redis-adapter redis
```

```js
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
```

Once this is wired in, `io.to(roomId).emit(...)` transparently reaches users connected to *any* server instance, not just the one that received the event.

### 6.2 Sticky sessions

When load-balancing WebSocket/Socket.io traffic across multiple servers, you generally need **sticky sessions** (a.k.a. session affinity) at the load balancer level — meaning a given client's requests always route to the *same* backend server for the lifetime of that connection. This matters especially if Socket.io falls back to HTTP long-polling (which involves multiple discrete HTTP requests that all need to hit the same server instance to be stitched into one logical connection). Nginx, AWS ALB, and most load balancers support this via cookie-based or IP-hash based affinity — this is infrastructure/config, not application code, but it's essential to know when you deploy.

### 6.3 Heartbeats and detecting dead connections

TCP doesn't always tell you immediately when a connection has silently died (e.g., a laptop's wifi drops without a clean disconnect). Both `ws` and Socket.io implement **heartbeats** (ping/pong) to detect this:

- Socket.io does this automatically (`pingInterval` / `pingTimeout` options) — if a client doesn't respond to a ping within `pingTimeout`, it's considered disconnected and cleaned up server-side.
- With raw `ws`, you'd implement it manually:

```js
wss.on('connection', (socket) => {
  socket.isAlive = true;
  socket.on('pong', () => { socket.isAlive = true; });
});

// Every 30s, ping everyone; terminate anyone who didn't pong since the last check
setInterval(() => {
  wss.clients.forEach((socket) => {
    if (!socket.isAlive) return socket.terminate();
    socket.isAlive = false;
    socket.ping();
  });
}, 30000);
```

### 6.4 Rate limiting to prevent abuse

Nothing stops a malicious or buggy client from calling `socket.emit('send_message', ...)` in a tight loop. Guard against it server-side:

```js
const rateLimits = new Map(); // socket.id -> { count, resetAt }

socket.on('send_message', (data, callback) => {
  const now = Date.now();
  const limit = rateLimits.get(socket.id) || { count: 0, resetAt: now + 10000 };

  if (now > limit.resetAt) {
    limit.count = 0;
    limit.resetAt = now + 10000; // reset every 10s
  }

  limit.count++;
  rateLimits.set(socket.id, limit);

  if (limit.count > 20) { // max 20 messages per 10s
    return callback?.({ status: 'error', error: 'Rate limit exceeded' });
  }

  // ...proceed with sending
});
```

### 6.5 Message ordering and idempotency

Network conditions can occasionally cause client-side re-emits (e.g., a reconnect that resends a message the client isn't sure went through). Give every client-generated message a unique client-side ID (a UUID) and have the server treat repeated IDs as no-ops (using a unique index in MongoDB, or a short-lived in-memory dedupe cache) so retries never create duplicate messages.

### 6.6 Security checklist

- **Always validate and sanitize `text` server-side** before storing/broadcasting — never trust client input (XSS risk if you render raw HTML from message text on the frontend; escape it or use a library like DOMPurify if you ever support rich text).
- **Authenticate on connection** (Section 5.3) — don't rely on a user ID sent as part of the message payload; trust `socket.user` derived from the verified JWT instead. Otherwise, anyone can `emit` claiming to be any user.
- **Verify room membership** before letting a socket join a room or send to it — e.g., check the user is actually a participant in `conversationId` before calling `socket.join(conversationId)`, or anyone could listen in on any conversation just by guessing/knowing its ID.
- **Use `wss://` (TLS) in production**, always.
- **CORS**: lock `origin` in the Socket.io CORS config down to your actual frontend domain — don't leave it as `*` in production.

### 6.7 Testing WebSocket code

- **Manual**: browser DevTools → Network tab → filter by "WS" → click the connection → see live frames going back and forth. Invaluable for debugging.
- **Automated (raw ws)**: use the `ws` library itself as a test client in Jest/Mocha, opening a real connection to a test server instance and asserting on received messages.
- **Automated (Socket.io)**: `socket.io-client` works the same way in test environments — spin up your server on a random port, connect a test client, emit, and assert on what comes back.

---

## PART 7 — Quick Reference Cheat Sheet

**Raw WebSocket (browser, native):**
```js
const socket = new WebSocket('wss://example.com');
socket.addEventListener('open', ...);
socket.addEventListener('message', (e) => e.data);
socket.addEventListener('close', (e) => e.code, e.reason);
socket.send(data);
socket.close();
```

**Raw WebSocket (Node, `ws`):**
```js
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (socket) => { socket.on('message', ...); });
wss.clients.forEach((c) => c.readyState === WebSocket.OPEN && c.send(data));
```

**Socket.io (server):**
```js
io.on('connection', (socket) => { ... });
socket.emit('event', data);                 // to this client only
io.emit('event', data);                      // to everyone
socket.broadcast.emit('event', data);        // to everyone except sender
socket.join(room); socket.leave(room);
io.to(room).emit('event', data);              // to a room
socket.to(room).emit('event', data);          // to a room, except sender
socket.on('event', (data, callback) => { callback({...}); }); // ack
io.use((socket, next) => { ... next(); });     // middleware
```

**Socket.io (client):**
```js
const socket = io(url, { auth: { token } });
socket.on('connect', ...);
socket.on('event_name', (data) => { ... });
socket.emit('event_name', data, (ack) => { ... });
socket.off('event_name', handlerRef); // remove a specific listener — do this in cleanup!
socket.disconnect();
```

**React hook rules for sockets:**
- `useRef` → the socket instance itself, timers/timeout IDs, DOM node references. Doesn't trigger re-renders.
- `useState` → anything the UI should visually reflect (messages, typing status, online users, connection status).
- `useEffect` with `[]` deps → connect once on mount, disconnect in cleanup.
- `useEffect` with `[dependency]` deps → re-subscribe to room/events when that dependency (e.g. `conversationId`) changes; **always clean up old listeners with `socket.off()`**.
- Use the **functional update form** of `setState` (`setX(prev => ...)`) inside any socket event handler, to avoid stale closures.

---

## What to Build Next, to Solidify This

1. Get Part 2 (raw `ws`) running locally — a simple two-tab echo chat, no database.
2. Rebuild it with Socket.io, add rooms.
3. Add MongoDB persistence + REST endpoint to load history.
4. Add JWT auth middleware.
5. Add typing indicators and online presence.
6. Add read receipts with acknowledgments.
7. Deploy it and add the Redis adapter once you scale past one server instance.

Work through these in order and you'll go from "stuck on WebSockets" to genuinely understanding every layer of a production real-time chat system — not just copy-pasting Socket.io tutorials.

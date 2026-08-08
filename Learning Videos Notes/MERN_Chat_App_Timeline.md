# MERN Stack Chat App with Socket.io — Full Timeline

**Video:** How To Make MERN Stack Chat App With Socket.io | Build Real-Time Full Stack Chat Application  
**Channel:** GreatStack  
**Duration:** ~6 hours  

---

## 🎬 Introduction & Demo

| Time | Topic |
|------|-------|
| 00:00 | Introduction — project overview (MERN + Socket.io) |
| 00:46 | Project demo — login, signup, chat UI walkthrough |
| 02:47 | Real-time messaging demo (two browser windows) |
| 03:55 | Image sending demo |
| 04:16 | Edit profile demo |
| 05:26 | Getting started |

---

## ⚛️ Frontend Setup (React + Vite)

| Time | Topic |
|------|-------|
| 05:34 | Creating project folder (`chat-app`) |
| 05:47 | Opening VS Code |
| 06:07 | Creating React project with Vite (`npm create vite@latest`) |
| 06:43 | Naming the project `client` |
| 07:22 | Installing dependencies (`npm install`) |
| 07:46 | Installing React Router DOM |
| 08:24 | Running the project (`npm run dev`) |
| 09:03 | Clearing default Vite boilerplate (app.css, app.jsx) |
| 10:34 | Updating page title to "Quick Chat — GreatStack" |
| 11:00 | Installing Tailwind CSS (via Vite plugin) |
| 12:58 | Importing Tailwind in `index.css` |
| 13:48 | Adding Google Fonts (Outfit font) |
| 15:24 | Hiding scrollbar via CSS |
| 15:57 | Adding assets folder (icons, images, assets.js) |
| 17:05 | Updating favicon (`favicon.svg`) |

---

## 📁 Folder Structure & Routing

| Time | Topic |
|------|-------|
| 17:55 | Creating folder structure: `components/`, `lib/`, `pages/` |
| 19:05 | Creating `HomePage.jsx` |
| 19:54 | Creating `LoginPage.jsx` |
| 20:23 | Creating `ProfilePage.jsx` |
| 22:03 | Setting up React Router in `main.jsx` (BrowserRouter) |
| 23:08 | Configuring routes in `App.jsx` (`/`, `/login`, `/profile`) |
| 25:18 | Testing routes in browser |
| 26:00 | Adding background image to App component |

---

## 🎨 Frontend UI — Homepage Layout

| Time | Topic |
|------|-------|
| 28:28 | Planning 3-column layout (Sidebar, ChatContainer, RightSidebar) |
| 29:47 | Reviewing Figma design |
| 30:22 | Creating component files: `Sidebar.jsx`, `ChatContainer.jsx`, `RightSidebar.jsx` |
| 31:35 | Mounting all 3 components in `HomePage.jsx` |
| 32:44 | Building Sidebar — grid layout and styling |

---

## 🧩 Sidebar Component

| Time | Topic |
|------|-------|
| 32:44 | Sidebar layout and Tailwind classes |
| 38:00~ | Adding logo, search bar, user profile image |
| 44:45 | Displaying users list with online/offline status and unread message count |
| 46:01 | Mapping over `userDummyData` from assets |
| 50:28 | Highlighting selected user with background color |
| 51:52 | `onClick` to set selected user state |
| 52:31 | Testing user selection in browser |
| 53:29 | Passing props (selectedUser, setSelectedUser) from HomePage |

---

## 💬 Chat Container Component

| Time | Topic |
|------|-------|
| 54:58 | Building ChatContainer — Figma design reference |
| 55:04 | Chat header — user image, name, green dot, info icon |
| 60:02 | Conditional rendering (show chat or placeholder icon) |
| 62:47 | Chat area — mapping over `messagesDummyData` |
| 65:00 | Styling sent vs received messages |
| 68:17 | Displaying message timestamp |
| 69:05 | Auto-scroll to latest message (`useRef` + `useEffect`) |
| 71:48 | `formatMessageTime` utility function in `lib/utils.js` |
| 74:33 | Bottom input area — text input, image upload, send button |

---

## 🖼️ Right Sidebar Component

| Time | Topic |
|------|-------|
| ~109:00 | Building RightSidebar — user profile image, name, bio, media |
| ~115:00 | Displaying media images sent in chat |

---

## 🔐 Login Page

| Time | Topic |
|------|-------|
| ~85:00 | Building Login Page UI (Sign In / Sign Up toggle) |
| ~90:00 | Form fields — name, email, password, bio |
| ~100:00 | Styling form with Tailwind and background image |
| 128:02 | Frontend UI fully complete |

---

## 👤 Profile Page

| Time | Topic |
|------|-------|
| ~119:00 | Building Profile Page — upload image, name, bio form |
| 122:36 | Image upload preview with circular style |
| 123:04 | Name input field with `onChange` handler |
| 124:32 | Bio textarea |
| 125:33 | Save button |
| 126:35 | `handleSubmit` function — redirect to homepage on save |
| 127:56 | Testing profile page |

---

## 🖥️ Backend Setup (Node.js + Express)

| Time | Topic |
|------|-------|
| 128:49 | Creating `server/` folder |
| 129:16 | Initializing Node project (`npm init -y`) |
| 130:08 | Overview of `package.json` |
| 131:00 | Installing packages: `bcryptjs`, `cloudinary`, `cors`, `dotenv`, `express`, `jsonwebtoken`, `mongoose`, `socket.io` |
| 133:05 | Setting `"type": "module"` in package.json |
| 133:30 | Creating basic Express server in `server.js` |
| 134:12 | Creating Express app and HTTP server |
| 135:02 | Adding middleware (express.json with 4MB limit, cors) |
| 136:04 | Creating `/api/status` test endpoint |
| 136:58 | Defining port from environment variable |
| 138:04 | Starting server and testing in browser |
| 138:27 | Installing `nodemon` |
| 139:06 | Adding `npm run server` script |
| 139:31 | Starting server with nodemon — confirmed running on port 5000 |

---

## 🗄️ MongoDB Atlas Setup

| Time | Topic |
|------|-------|
| 140:21 | Searching for MongoDB Atlas |
| 141:03 | Creating a free cluster (Google Cloud) |
| 141:26 | Creating database user and password |
| 142:01 | Getting MongoDB connection string |
| 143:07 | Creating `.env` file — `MONGODB_URI`, `PORT` |
| 143:49 | Setting up Network Access (IP whitelist) |

---

## 🗃️ Models

| Time | Topic |
|------|-------|
| ~150:00 | Creating `models/` folder |
| ~151:00 | Creating **User model** — name, email, password, profilePic, bio |
| 190:17 | Creating **Message model** — senderId, receiverId, text, image, seen, timestamps |

---

## 🔑 Auth — Controllers, Routes & Middleware

| Time | Topic |
|------|-------|
| ~155:00 | Creating `controllers/` folder |
| ~156:00 | Creating **auth controller** — signup, login, logout, updateProfile, checkAuth |
| ~162:00 | Hashing passwords with `bcryptjs` |
| ~164:00 | Generating JWT tokens |
| ~166:00 | Uploading profile images to **Cloudinary** |
| ~170:00 | Creating `middleware/auth.js` — `protectRoute` middleware |
| ~175:00 | Creating `routes/userRoutes.js` — signup, login, logout, updateProfile, checkAuth |
| 187:46 | Adding PUT `/update-profile` and GET `/check` routes |
| 189:06 | Registering user router in `server.js` (`/api/auth`) |

---

## 💬 Message — Controllers & Routes

| Time | Topic |
|------|-------|
| 194:01 | Creating `messageController.js` |
| 194:13 | `getUsersForSidebar` — get all users except logged-in user + unseen message count |
| 201:32 | `getMessages` — get all messages between two users + mark as seen |
| 206:15 | `markMessageAsSeen` — mark individual message as seen |
| 208:22 | Creating `routes/messageRoutes.js` |
| 209:03 | GET `/user` — get users for sidebar (protected) |
| 209:37 | GET `/:id` — get messages for selected user (protected) |
| 210:05 | PUT `/mark/:id` — mark message as seen (protected) |
| ~212:00 | `sendMessage` controller — save text/image message to DB + Cloudinary |
| ~215:00 | Registering message router in `server.js` (`/api/messages`) |

---

## 🌐 Frontend–Backend Integration

| Time | Topic |
|------|-------|
| ~220:00 | Installing Axios on frontend |
| ~225:00 | Setting up Axios base URL from `.env` (`VITE_BACKEND_URL`) |
| ~230:00 | Creating `context/AuthContext.jsx` (AuthProvider) |
| ~235:00 | `checkAuth` on app load — set authenticated user state |
| ~240:00 | `signup` and `login` functions with Axios calls |
| ~248:00 | `logout` function |
| ~252:00 | `updateProfile` function — base64 image + Cloudinary upload |
| 255:13 | Passing login, logout, updateProfile via context value |
| 256:08 | Adding route protection in `App.jsx` — redirect if not authenticated |
| 260:35 | Connecting signup/login form to context |
| 263:39 | Testing account creation ✅ |
| 264:06 | Connecting profile update to context |
| 271:53 | Testing profile update ✅ |
| 274:19 | Adding logout to Sidebar component |
| 275:14 | Testing logout ✅ |

---

## 💬 Chat Context & Real-Time Features

| Time | Topic |
|------|-------|
| 276:17 | Creating `context/ChatContext.jsx` (ChatProvider) |
| 277:05 | States: `users`, `selectedUser`, `messages`, `unseenMessages`, `onlineUsers` |
| ~280:00 | `getUsersForSidebar` — fetch users list with unseen counts |
| ~285:00 | `getMessages` — fetch messages for selected user |
| ~290:00 | `sendMessage` — send text or image message |
| ~295:00 | Wrapping app with `ChatProvider` in `main.jsx` |
| ~300:00 | Connecting Sidebar to ChatContext — display real users list |
| ~310:00 | Connecting ChatContainer to ChatContext — display real messages |
| 321:36 | `handleSendImage` — upload image and send message |
| 323:10 | Displaying selected user's name and profile picture |
| 324:04 | Showing online status green dot in chat header |
| 325:05 | `useEffect` to call `getMessages` when selected user changes |
| 329:26 | Testing chat functionality ✅ |
| 333:10 | Fixing unseen message count reset on user selection |
| 334:47 | Testing image sending ✅ |
| 335:27 | Verifying messages saved in MongoDB ✅ |

---

## 🔌 Socket.io — Real-Time Setup

| Time | Topic |
|------|-------|
| ~216:00 | Setting up Socket.io server in `server.js` |
| ~218:00 | Tracking online users with a Map |
| ~220:00 | Emitting `getOnlineUsers` event to all clients |
| ~278:00 | Connecting Socket.io client in `ChatContext` |
| ~282:00 | Listening for incoming messages via socket events |
| ~285:00 | Updating messages state in real time |
| ~288:00 | Updating unseen message count in real time |
| ~290:00 | Disconnecting socket on logout |
| 336:13 | Confirming real-time message delivery via socket.io ✅ |

---

## 📋 Right Sidebar — Final Integration

| Time | Topic |
|------|-------|
| 336:24 | Building RightSidebar with ChatContext data |
| 338:06 | Getting selectedUser and messages from ChatContext |
| 338:48 | Getting logout and onlineUsers from AuthContext |
| 339:13 | Extracting image URLs from messages for media gallery |
| 341:27 | Displaying selected user's profile — image, name, online dot, bio |
| 343:10 | Displaying media images from chat |
| 343:32 | Wiring logout button |
| 343:44 | Testing right sidebar ✅ |
| 344:32 | Fixing online status green dot in ChatContainer |
| 345:18 | Full stack chat application complete ✅ |

---

## 🚀 Deployment (GitHub + Vercel)

| Time | Topic |
|------|-------|
| 345:24 | Overview — deploy to Vercel for free |
| 345:31 | Creating `.gitignore` (node_modules) |
| 346:06 | Creating `vercel.json` for server (Express backend config) |
| 347:23 | Creating `vercel.json` for client (React frontend config) |
| 347:49 | Pushing to GitHub — initializing repo, first commit, publish branch |
| 348:47 | Opening Vercel dashboard |
| 349:01 | Importing GitHub repo to Vercel |
| 349:21 | Deploying backend — selecting `server/` root directory |
| 349:47 | Adding environment variables (MONGODB_URI, JWT_SECRET, CLOUDINARY keys) |
| 350:20 | Deploying backend — confirmed deploying |
| 350:51 | Fixing backend server.js for Vercel — wrapping `server.listen` in `if (process.env.NODE_ENV !== 'production')` |
| 352:14 | Exporting server for Vercel (`export default server`) |
| 352:40 | Moving `bg-image.svg` to `public/` folder for deployment |
| 353:48 | Pushing updated code to GitHub |
| 354:30 | Adding `NODE_ENV=production` environment variable on Vercel |
| 354:55 | Redeploying backend |
| 355:33 | Confirming backend live — `/api/status` returns "server is live" ✅ |
| 355:46 | Deploying frontend — selecting `client/` directory |
| 356:15 | Adding `VITE_BACKEND_URL` environment variable (deployed backend URL) |
| 357:05 | Deploying frontend |
| 357:22 | Frontend deployed — live URL confirmed ✅ |
| 357:40 | Testing live app — creating account, chatting, real-time messages |
| 359:30 | 🎉 Project complete! |

---

*Timeline generated from full video transcript.*

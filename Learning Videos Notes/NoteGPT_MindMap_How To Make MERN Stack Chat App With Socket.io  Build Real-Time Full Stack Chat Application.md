# Full Stack Real-Time Chat Application Tutorial

## 🚀 Project Overview

Build a full stack chat app using MongoDB, Express, React, and NodeJS (MERN stack).

Real-time messaging enabled with socket.io for instant message delivery without page reload.

Features include user signup/login, online/offline status updates, image uploading, and profile editing.

Application demo includes login/signup screens, user list sidebar, chat container, and profile sidebar.

Deployment planned on Vercel with free hosting for both frontend and backend.

## ⚙️ Frontend Setup and Structure

### Project Initialization

React project created using npm create vite@latest with JavaScript and React template.

Dependencies installed: react-router-dom for routing, tailwindcss for styling, react-hot-toast for notifications, axios for API calls, and socket.io-client for real-time communication.

Tailwind CSS installed and configured, Google Fonts (Outfit) integrated.

### Folder Structure and Components

src/components contains reusable UI components: Sidebar, ChatContainer, RightSidebar.

src/pages includes main pages: Homepage, LoginPage, ProfilePage.

src/lib contains utility functions, including date/time formatting and cloudinary config.

Assets (images/icons) organized in src/assets.

Routing configured with React Router for Homepage, Login, and Profile pages.

### UI and State Management

Homepage layout has three columns: user list (sidebar), chat container, and profile sidebar.

Sidebar features user search, online/offline status, and unread message count.

Chat container displays messages, supports sending text and images, and auto-scrolls on new messages.

Profile sidebar shows user details, uploaded media, and logout button.

React Context API used for global state management: separate contexts for authentication (OContext) and chat (ChatContext).

## 🛠️ Backend Setup and APIs

### Server Initialization

NodeJS backend created with Express.

Packages installed: bcryptjs (password hashing), cloudinary (image uploads), cors, dotenv, jsonwebtoken (JWT auth), mongoose (MongoDB ODM), socket.io.

MongoDB Atlas used as the cloud database; connected via Mongoose.

Environment variables for sensitive data (DB URI, JWT secret, Cloudinary credentials).

### Models and Controllers

User model: stores email, full name, hashed password, profile pic URL, bio.

Message model: stores sender ID, receiver ID, message text, image URL, seen status, timestamps.

User controller includes signup, login, profile update, and authentication verification.

Message controller manages fetching users, fetching messages, sending messages, marking messages as seen.

### Routes and Middleware

User routes: /api/user/signup, /api/user/login, /api/user/check, /api/user/updateProfile.

Message routes: /api/messages/users, /api/messages/:id, /api/messages/mark/:id, /api/messages/send/:id.

Authentication middleware protects routes by verifying JWT tokens.

Cloudinary configured for image uploads.

### Socket.io Integration

Socket.io server initialized on backend to manage real-time bidirectional communication.

Online users tracked using a map of user IDs to socket IDs.

On connection, user ID and socket ID stored; on disconnect, removed.

New messages emitted instantly to receiver’s socket if online.

## 🔗 Frontend-Backend Integration

Axios configured with backend base URL from environment variables.

Auth context manages token storage, login/signup logic, token-based API authentication, socket connection management.

Chat context manages messages, users, selected user, unseen message counts, and socket event subscriptions.

Components consume contexts to render UI and perform actions (send messages, update profile, logout).

Realtime message sending and receiving implemented via socket.io client events.

## ✅ Key Features Demonstrated

User authentication with signup, login, logout.

Profile editing with image upload and bio.

Real-time chat with text and images.

Online/offline user presence indication.

Unseen message count badges.

Responsive UI with Tailwind CSS and React Router navigation.

Deployment on Vercel with GitHub integration for live demo.

## 📦 Deployment

Backend and frontend deployed separately on Vercel with environment variables configured.

GitHub repository created with .gitignore and Vercel config files for both client and server.

Live demo accessible via Vercel URLs showing fully functional chat application.


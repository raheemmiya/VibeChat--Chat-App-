import express from "express";
import http from "http";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import { Server } from "socket.io";
import messageRouter from "./routes/messageRoute.js";
import {
  createMessage,
  markMessageSeen,
} from "./controller/messageController.js";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const socketIdMap = [];

io.on("connection", (socket) => {
  socket.on("register-socket", (userId) => {
    socketIdMap[userId] = socket.id;
    io.emit("online-users", Object.keys(socketIdMap));
  });

  socket.on("message-from-client", async (data) => {
    const senderId = data.senderId;
    const message = data.message;
    const recieverId = data.recieverId;
    const timestamp = data.timestamp;
    const response = await createMessage(data);

    const recieverSocketId = socketIdMap[recieverId];

    console.log(socketIdMap);

    if (recieverSocketId) {
      io.to(recieverSocketId).emit("recieve-message", response);
    }

    console.log(message);

    socket.emit("recieve-message", response);
  });
  socket.on("mark-seen", async (users) => {
    const senderId = users.senderId;
    const recieverId = users.recieverId;

    const response = await markMessageSeen(senderId, recieverId); //db update

    const senderSocketId = socketIdMap[senderId];
    const recieverSocketId = socketIdMap[recieverId]; // NEW

    io.to(senderSocketId).emit("marked-seen", recieverId); // tells sender: "they've seen it" (Seen label)
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("marked-seen", recieverId); // NEW: tells reader: "your own unread count should clear"
    }
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(socketIdMap).find(
      (key) => socketIdMap[key] === socket.id,
    );

    if (userId) {
      delete socketIdMap[userId];
    }
    io.emit("online-users", Object.keys(socketIdMap));
  });
});

const PORT = process.env.PORT;

// middlewares
connectDB();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/status", (req, res) =>
  res.send("<h1>The server is running now <h1/>"),
);
app.use("/api", userRouter);
app.use("/api", messageRouter);

httpServer.listen(PORT, () =>
  console.log("The server is running in PORT: " + PORT),
);

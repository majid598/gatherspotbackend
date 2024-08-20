import { v2 as cloudinary } from 'cloudinary';
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuid } from 'uuid';
import { CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE, NEW_MESSAGE_ALERT, ONLINE_USERS, START_TYPING, STOP_TYPING } from './constants/events.js';
import { getAllChatMembers, getSockets } from './constants/helper.js';
import { errorMiddleware } from "./Middlewares/error.js";
import { connectDb } from "./Utils/db.js";

dotenv.config({
  path: "./.env",
});


import { corsOptions } from "./constants/config.js";
import { socketAuthenticator } from "./Middlewares/auth.js";
import { Message } from "./Models/Message.js";
import chatRoute from "./Routes/chat.js";
import postRoute from "./Routes/post.js";
import userRoute from "./Routes/user.js";
import { User } from './Models/user.js';
export const userSocketIDs = new Map();
const onlineUsers = new Set();
connectDb(process.env.MONGO_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/post", postRoute);


app.get("/", (req, res) => {
  res.send("Server Is Working Perfectly");
});

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on("connection", async (socket) => {
  const user = socket.user;
  // Update the online users list
  userSocketIDs.set(user._id.toString(), socket.id);
  onlineUsers.add(user._id.toString());
  // Notify all users that this user is now online
  const allMembers = await getAllChatMembers(user)
  const membersSocket = getSockets(allMembers);
  io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));

  // Notify all chat members that this user is now onlin

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.fullName,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      throw new Error(error);
    }
  });

  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on("disconnect", async () => {
    await User.findByIdAndUpdate(user._id, { lastSeen: Date.now() })
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    io.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
});


app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is runnig at port number ${PORT}`);
});

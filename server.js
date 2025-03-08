import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Messages from "./src/models/messageModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Conversation from "./src/models/conversationModel.js";
import User from "./src/models/userModel.js";

dotenv.config();

const connectionString = process.env.MONGODB_URI

mongoose.set('strictQuery', false);

mongoose.connect(connectionString)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    console.error("Please check if your MongoDB server is running and the connection string is correct.");
  });

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const userSocketMap = {};

io.use((socket, next) => {
  console.log("Authenticating socket connection...");
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.log("No token provided");
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Authentication successful for user:", decoded.email);
    socket.decoded = decoded;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("New authenticated connection", socket.id);
  console.log("User data:", socket.decoded);

  socket.on("setUserOnline", async () => {
    try {
      const userId = socket.decoded.id;
      const user = await User.findById(userId);

      if (user) {
        userSocketMap[user.username] = socket.id;

        user.isOnline = true;
        user.lastActive = new Date();
        await user.save();

        console.log(`${user.username} is online`);
      }
    } catch (error) {
      console.log("Error setting user online:", error.message);
    }
  });

  socket.on("join-room", async ({ username, room }) => {
    socket.join(room);
    console.log(`${username} joined room ${room}`);

    io.to(room).emit("message", {
      sender: "System",
      message: `${username} joined the room`,
      timestamp: new Date(),
    });
  });

  socket.on("sendMessage", async ({ message, username, room }) => {
    try {
      console.log(
        `Saving message from ${username} in room ${room}: "${message.substring(
          0,
          30
        )}${message.length > 30 ? "..." : ""}"`
      );

      const newMessage = new Messages({
        message,
        room,
        sender: username,
        timestamp: new Date(),
      });

      await newMessage.save();
      console.log("Message saved successfully with ID:", newMessage._id);

      io.to(room).emit("message", {
        sender: username,
        message,
        id: newMessage._id,
        timestamp: newMessage.timestamp,
      });
    } catch (error) {
      console.error("Error saving message:", error.message);
      socket.emit("messageError", { error: "Failed to save message" });
    }
  });

  socket.on("startconversation", async ({ targetUsername }) => {
    const currentUser = socket.decoded.username;

    try {
      let conversation = await Conversation.findOne({
        members: { $all: [currentUser, targetUsername] },
      });

      if (!conversation) {
        conversation = new Conversation({
          members: [currentUser, targetUsername],
        });

        await conversation.save();
      }

      const conversationId = conversation._id.toString();
      socket.join(conversationId);

      const previousMessages = await Messages.find({
        conversationID: conversationId,
      }).sort({ timestamp: 1 });

      socket.emit("previousMessages", previousMessages);

      socket.emit("conversationStarted", {
        conversationId,
        with: targetUsername,
      });
    } catch (error) {
      console.error("Error starting conversation:", error.message);
      socket.emit("conversationError", { error: error.message });
    }
  });

  socket.on("sendDirectMessage", async ({ message, targetUsername, conversationId }) => {
    const currentUser = socket.decoded.username;

    try {
      const newMessage = new Messages({
        sender: currentUser,
        receiver: targetUsername,
        message,
        room: "",
        conversationID: conversationId,
        timestamp: new Date(),
      });

      await newMessage.save();

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: newMessage._id,
        lastMessageTimestamp: new Date(),
      });

      io.to(conversationId).emit("message", {
        sender: currentUser,
        message,
        id: newMessage._id,
        timestamp: newMessage.timestamp,
      });

      const recipientSocketId = userSocketMap[targetUsername];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newMessageNotification", {
          conversationId,
          from: currentUser,
        });
      }
    } catch (error) {
      console.log("Error sending direct message:", error.message);
      socket.emit("messageError", { error: error.message });
    }
  });

  socket.on("disconnect", async () => {
    try {
      const username = socket.decoded.username;
      delete userSocketMap[username];

      await User.findOneAndUpdate(
        { username },
        {
          isOnline: false,
          lastActive: new Date(),
        }
      );

      console.log(`${username} disconnected`);
    } catch (error) {
      console.log("Error handling disconnect:", error.message);
    }
  });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
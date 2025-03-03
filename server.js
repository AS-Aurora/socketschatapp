import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Messages from "./src/models/messageModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

  socket.on("join-room", async ({ username, room }) => {
    console.log("Joining room", room, username);
    socket.join(room);

    io.to(room).emit("message", {
      sender: "System",
      message: `${username} has joined the room`,
      timestamp: new Date()
    });

    try {
      const previousMessages = await Messages.find({ room })
        .sort({ timestamp: 1 });

      if (previousMessages.length > 0) {
        console.log(`Sending ${previousMessages.length} previous messages to ${username}`);
        socket.emit("previousMessages", previousMessages);
      }
    } catch (error) {
      console.log("Error fetching previous messages:", error.message);
    }
  });

  socket.on("sendMessage", async ({ message, username, room }) => {
    try {
      console.log(`Saving message from ${username} in room ${room}: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`);
      
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

  socket.on("leave-room", ({ username, room }) => {
    socket.leave(room);
    io.to(room).emit("message", {
      sender: "System",
      message: `${username} has left the room`,
      timestamp: new Date()
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
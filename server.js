import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Messages from "./src/models/messageModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Conversation from "./src/models/conversationModel.js";
import User from "./src/models/userModel.js";

dotenv.config();

const connectionString = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

mongoose
  .connect(connectionString)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.error(
      "Please check if your MongoDB server is running and the connection string is correct."
    );
  });

const httpServer = createServer();
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const userSocketMap = {}

// Track which users are in which conversation rooms
const conversationRooms = {}

io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
  
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
  
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

      const user = await User.findOne({ email: decoded.email }).select("username");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Store user info inside socket object
      socket.user = { ...decoded, username: user.username }
  
      if (!decoded.username) {
        console.log("Token is missing 'username' field:", decoded);
        return next(new Error("Authentication error: Username missing in token"));
      }
  
      // Store user info inside socket object  
      next()
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  })

io.on("connection", async (socket) => {
  console.log("🔗 WebSocket connected:", socket.id, `(User: ${socket.user.email})`);

  const username = socket.user.username
  userSocketMap[username] = socket.id

  await User.findOneAndUpdate(
      { username },
      { isOnline: true, lastActive: new Date() }
  );

  socket.broadcast.emit("userStatusUpdate", { username, isOnline: true });

  // Join conversation room
  socket.on("joinConversation", async (data) => {
      try {
          const conversationId = data.conversationId;
          
          // Join the socket to the conversation room
          socket.join(conversationId);
          
          // Track which users are in this conversation room
          if (!conversationRooms[conversationId]) {
              conversationRooms[conversationId] = new Set();
          }
          conversationRooms[conversationId].add(username);
          
      } catch (error) {
          console.error("Error joining conversation:", error.message);
      }
  });

  // Leave conversation room - NEW HANDLER
  socket.on("leaveConversation", async (data) => {
      try {
          const conversationId = data.conversationId;
          console.log(`👋 User ${username} leaving conversation room:`, conversationId);
          
          // Remove socket from the conversation room
          socket.leave(conversationId);
          
          // Update tracking
          if (conversationRooms[conversationId]) {
              conversationRooms[conversationId].delete(username);
              if (conversationRooms[conversationId].size === 0) {
                  delete conversationRooms[conversationId];
              }
          }
      } catch (error) {
          console.error("Error leaving conversation:", error.message);
      }
  });

  // Start a conversation
//   socket.on("startconversation", async ({ targetUsername }) => {
//       try {
//           let conversation = await Conversation.findOne({
//               members: { $all: [username, targetUsername] }
//           });

//           if (!conversation) {
//               conversation = new Conversation({
//                   members: [username, targetUsername],
//               });
//               await conversation.save();
//           }

//           socket.emit("conversationStarted", {
//               conversationId: conversation._id,
//               with: targetUsername,
//           });
//       } catch (error) {
//           socket.emit("conversationError", { error: error.message });
//       }
//   });

  // Load previous messages
  socket.on("loadMessages", async ({ conversationId, page = 1, limit = 20 }) => {
      try {
          const messages = await Messages.find({ conversationID: conversationId })
              .sort({ timestamp: -1 })
              .skip((page - 1) * limit)
              .limit(limit)
              .lean();

          socket.emit("previousMessages", { conversationId, messages });
      } catch (error) {
          socket.emit("messageError", { error: error.message });
      }
  });

  // Send a direct message
  socket.on("sendDirectMessage", async (data) => {
      try {

          const messageData = {
              sender: data.senderId || data.senderUsername,
              receiver: data.receiverId || data.receiverUsername,
              message: data.message,
              timestamp: new Date(),
              conversationID: data.conversationID,
              read: false
          };

          // Save message to MongoDB
          const savedMessage = new Messages(messageData);
          await savedMessage.save();

          // Normalize the response to match the client's expected format
          const normalizedMessage = {
              _id: savedMessage._id,
              message: savedMessage.message,
              sender: savedMessage.sender,
              receiver: savedMessage.receiver,
              conversationID: savedMessage.conversationID,
              timestamp: savedMessage.timestamp,
              read: savedMessage.read
          };

          // Emit to all clients in the conversation room (including sender)
          io.to(data.conversationID).emit("message", normalizedMessage);
          
          // If receiver is not in room, send it directly to their socket
          const receiverUsername = data.receiverId || data.receiverUsername;
          const receiverSocketId = userSocketMap[receiverUsername];
          
          if (receiverSocketId && (!conversationRooms[data.conversationID] || 
              !conversationRooms[data.conversationID].has(receiverUsername))) {
              io.to(receiverSocketId).emit("message", normalizedMessage);
          }
      } catch (error) {
          socket.emit("messageError", { error: error.message });
      }
  });

  // Handle typing status
  socket.on("typing", async ({ targetUsername, isTyping }) => {
      if (userSocketMap[targetUsername]) {
          io.to(userSocketMap[targetUsername]).emit("typing", { username, isTyping });
      }
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
      try {
          console.log("WebSocket disconnected:", socket.id, `(User: ${username})`);
          delete userSocketMap[username];

          // Remove user from all conversation rooms
          for (const [roomId, users] of Object.entries(conversationRooms)) {
              if (users.has(username)) {
                  users.delete(username);
                  if (users.size === 0) {
                      delete conversationRooms[roomId];
                  }
              }
          }

          await User.findOneAndUpdate(
              { username },
              { isOnline: false, lastActive: new Date() }
          );

          socket.broadcast.emit("userStatusUpdate", { username, isOnline: false });
      } catch (error) {
          console.log("Error handling disconnect:", error.message);
      }
  });
});

const PORT = process.env.PORT || 5002;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New connection", socket.id);

  socket.on("join-room", ({ username, room }) => {
    console.log("Joining room", room, username);
    socket.join(room);

    io.to(room).emit("message", {
      sender: "System",
      message: `${username} has joined the room`,
    });
  });

  socket.on("sendMessage", ({ message, username, room }) => {
    io.to(room).emit("message", { sender: username, message });
  });

  socket.on("leave-room", ({username, room}) => {
    socket.leave(room);
    io.to(room).emit("message", {
      sender: "System", 
      message: `${username} has left the room`
    })
  })
});



httpServer.listen(5000, () => {
  console.log("Server listening on port 5000");
});
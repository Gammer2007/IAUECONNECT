const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket){
    socket.on("newuser",function(username){
        socket.broadcast.emit("update",username + " joined the conversation");
    });
    socket.on("exituser",function(username){
        socket.broadcast.emit("update",username+ " left the conversation")
    });
    socket.on("chat",function(message){
        socket.broadcast.emit("chat",message)
    });
    socket.on('read-message', (messageId) => {
      // Update message status in database
      // ...
      io.emit('read-message', messageId);
    });
    socket.on('delete-message', (messageId) => {
      // Validate message ID
      if (!messageId) {
        alert('Invalid message ID');
        return;
      }
      // Broadcast delete event to all connected clients
      io.emit('delete-message', messageId);
    });
  
});
// Add this line to handle GET requests to the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

server.listen(5000, () => {
  console.log("Server started on port 5000");
});

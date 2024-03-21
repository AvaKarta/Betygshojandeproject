const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 1000, pingTimeout: 2000 });

const publicPath = path.join(__dirname, "/../public/");
const port = process.env.PORT || 3000;
app.use(express.static(publicPath));

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/public/html/index.html");
// });

let backendPlayers = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  backendPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${360 * Math.random()}, 100%, 50%)`,
  };

  io.emit("updatePlayers", backendPlayers);

  console.log(backendPlayers);

  socket.on("disconnect", (reason) => {
    console.log(`user disconnected, Reason: ${reason}`);
    delete backendPlayers[socket.id];
    io.emit("updatePlayers", backendPlayers);
  });

  const speed = 10;

  socket.on("keydown", (keycode) => {
    switch (keycode) {
      case "KeyW":
        backendPlayers[socket.id].y -= speed;

        break;
      case "KeyA":
        backendPlayers[socket.id].x -= speed;

        break;
      case "KeyS":
        backendPlayers[socket.id].y += speed;

        break;
      case "KeyD":
        backendPlayers[socket.id].x += speed;

        break;

      default:
        break;
    }
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

setInterval(() => {
  io.emit("updatePlayers", backendPlayers);
}, 15);

// L
server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});

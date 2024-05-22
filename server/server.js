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
let backendProjectiles = {};
let projectileId = 0;

const speed = 5;
const projectileSpeed = 20;
const gravity = 0.3;
const radius = 10;
const projectileRadius = 5;

io.on("connection", (socket) => {
  console.log("a user connected");

  io.emit("updatePlayers", backendPlayers);

  // console.log(backendPlayers);

  socket.on("initCanvas", ({ width, height, devicePixelRatio }) => {});

  socket.on("shoot", ({ x, y, angle }) => {
    projectileId++;

    const velocity = {
      x: Math.cos(angle) * projectileSpeed,
      y: Math.sin(angle) * projectileSpeed,
    };

    backendProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id,
    };

    // console.log(backendProjectiles);
  });

  socket.on("initGame", ({ username, width, height }) => {
    backendPlayers[socket.id] = {
      x: 1440 / 2,
      y: 965,
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      username,
    };

    //init canvas
    backendPlayers[socket.id].canvas = {
      width,
      height,
    };

    backendPlayers[socket.id].radius = radius;
  });

  socket.on("disconnect", (reason) => {
    console.log(`user disconnected, Reason: ${reason}`);
    delete backendPlayers[socket.id];
    io.emit("updatePlayers", backendPlayers);
  });

  socket.on("keydown", ({ keycode, sequenceNumber }) => {
    const backendPlayer = backendPlayers[socket.id];

    backendPlayers[socket.id].sequenceNumber = sequenceNumber;
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

    const playerSides = {
      left: backendPlayer.x - backendPlayer.radius * 2,
      right: backendPlayer.x + backendPlayer.radius * 2,
      top: backendPlayer.y - backendPlayer.radius * 2,
      bottom: backendPlayer.y + backendPlayer.radius * 2,
    };

    console.log(playerSides.bottom, playerSides.left);

    if (playerSides.left < 0) {
      backendPlayers[socket.id].x = backendPlayer.radius * 2;
    }
    if (playerSides.right > 1440) {
      backendPlayers[socket.id].x = 1440 - backendPlayer.radius * 2;
    }

    if (playerSides.bottom > 985) {
      backendPlayers[socket.id].y = 985 - backendPlayer.radius * 2;
    }

    // if (playerSides.bottom > 550 && playerSides.left < 385) {
    //   console.log("crash");
    //   backendPlayers[socket.id].y -= 5;
    //   backendPlayers[socket.id].x += 5;
    // }
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

setInterval(() => {
  for (const id in backendProjectiles) {
    backendProjectiles[id].x += backendProjectiles[id].velocity.x;
    backendProjectiles[id].velocity.y += gravity;
    backendProjectiles[id].y += backendProjectiles[id].velocity.y;

    if (
      backendProjectiles[id].x - projectileRadius >=
        backendPlayers[backendProjectiles[id].playerId]?.canvas?.width ||
      backendProjectiles[id].x + projectileRadius <= 0 ||
      backendProjectiles[id].y - projectileRadius >=
        backendPlayers[backendProjectiles[id].playerId]?.canvas?.height ||
      backendProjectiles[id].y + projectileRadius <= 0
    ) {
      delete backendProjectiles[id];
      continue;
    }

    for (const playerId in backendPlayers) {
      const backendPlayer = backendPlayers[playerId];

      const distance = Math.hypot(
        backendProjectiles[id].x - backendPlayer.x,
        backendProjectiles[id].y - backendPlayer.y
      );

      if (
        distance < projectileRadius + backendPlayer.radius &&
        backendProjectiles[id].playerId != playerId
      ) {
        delete backendProjectiles[id];
        delete backendPlayers[playerId];
        break;
      }
    }
  }

  io.emit("updateProjectiles", backendProjectiles);
  io.emit("updatePlayers", backendPlayers);
}, 15);

// L
server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});

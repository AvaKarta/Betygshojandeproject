const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 1000, pingTimeout: 2000 });
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const bodyParser = require("body-parser");

const cookies = require("cookie-parser");

app.use(cookies());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const publicPath = path.join(__dirname, "/../public/");
const gamepath = path.resolve(__dirname + "/../public/html/spel.html");
const port = process.env.PORT || 3000;

app.get("/html/spel.html", async (req, res) => {
  let authHeader = req.cookies.token;
  console.log(authHeader);
  if (authHeader === undefined) {
    res.status(401);
  }
  let token = authHeader;

  let decoded;
  try {
    decoded = jwt.verify(token, "MartinIsTheBest");
  } catch (err) {
    console.log(err);
    res.status(401).send("Invalid auth token");
    return;
  }

  if (decoded.authorization) {
    res.sendFile(gamepath);
  } else {
    res.status(403);
  }
  res.status(403);
});

app.use(express.static(publicPath));

// app.get("/", (req, res) => {
// res.sendFile(__dirname + "/public/html/index.html");
// });

app.post("/loggain", async (req, res) => {
  console.log(req.body);
  if (req.body && req.body.username && req.body.password) {
    try {
      let connection = await getDBConnnection();
      let sql = "SELECT * FROM spelarkonto WHERE username = ?";
      let [results] = await connection.execute(sql, [req.body.username]);

      const hashedPasswordFromDB = results[0].password;

      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        hashedPasswordFromDB
      );

      if (isPasswordValid) {
        let payload = {
          sub: results[0].id,
          authorization: true,
          username: req.body.username,
        };
        let token = jwt.sign(payload, "MartinIsTheBest", {
          expiresIn: "1900s",
        });

        // res.json(token);
        res
          .cookie("token", token, { httpOnly: false, secure: true })
          .status(200)
          .send({ token });

        return;
      } else {
        res.status(400).json({ error: "Invalid credentials" });
        return;
      }
    } catch (err) {
      res.status(500).send("Something went wrong");
      return;
    }
  } else {
    res.sendStatus(422);
    return;
  }
});

async function getDBConnnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "betygshojande",
  });
}

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

  socket.on("initGame", ({ token, width, height }) => {
    console.log("|");
    console.log(token);
    let decoded;
    try {
      decoded = jwt.verify(token, "MartinIsTheBest");
    } catch (err) {
      console.log(err);
      return;
    }

    backendPlayers[socket.id] = {
      x: 1440 / 2,
      y: 965,
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      username: decoded.username,
    };

    //init canvas
    backendPlayers[socket.id].canvas = {
      width,
      height,
    };

    backendPlayers[socket.id].radius = radius;
  });

  socket.on("skapaKonto", async ({ username, password }) => {
    if (username.length <= 20 && password.length <= 50) {
      // console.log("Det funkar!!");
      try {
        let connection = await getDBConnnection();
        let sql =
          "INSERT INTO `spelarkonto`( `username`, `password`,`color`) VALUES (?,?,?)";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const color = "Blue";

        let [results] = await connection.execute(sql, [
          username,
          hashedPassword,
          color,
        ]);

        // console.log(results);
        let succses = true;
        io.emit("succses", succses);
        console.log("YES!!!");
      } catch (err) {
        if (err.errno === 1062) {
          let errortype = 2;
          io.emit("userError", errortype);
        }
      }
    } else {
      let errortype = 1;
      io.emit("userError", errortype);
    }
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

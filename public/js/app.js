let socket = io();

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// form.addEventListener("submit", function (e) {
//   e.preventDefault();
//   if (input.value) {
//     socket.emit("chat message", input.value);
//     input.value = "";
//   }
// });

// socket.on("chat message", function (msg) {
//   var item = document.createElement("li");
//   item.textContent = msg;
//   messages.appendChild(item);
//   window.scrollTo(0, document.body.scrollHeight);
// });

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const speed = 10;

const playerInputs = [];

let sequenceNumber = 0;

setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: -speed });
    frontendPlayers[socket.id].y -= speed;
    socket.emit("keydown", { keycode: "KeyW", sequenceNumber });
  }
  if (keys.a.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: -speed, dy: 0 });
    frontendPlayers[socket.id].x -= speed;
    socket.emit("keydown", { keycode: "KeyA", sequenceNumber });
  }
  if (keys.s.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: speed });
    frontendPlayers[socket.id].y += speed;
    socket.emit("keydown", { keycode: "KeyS", sequenceNumber });
  }
  if (keys.d.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: speed, dy: 0 });
    frontendPlayers[socket.id].x += speed;
    socket.emit("keydown", { keycode: "KeyD", sequenceNumber });
  }
}, 15);

window.addEventListener("keydown", (event) => {
  if (!frontendPlayers[socket.id]) return;

  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      keys.w.pressed = true;

      break;
    case "KeyA":
      keys.a.pressed = true;

      break;
    case "KeyS":
      keys.s.pressed = true;

      break;
    case "KeyD":
      keys.d.pressed = true;

      break;

    default:
      break;
  }
});

window.addEventListener("keyup", (event) => {
  if (!frontendPlayers[socket.id]) return;

  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      keys.w.pressed = false;
      break;
    case "ArrowLeft":
    case "KeyA":
      keys.a.pressed = false;
      break;
    case "KeyS":
      keys.s.pressed = false;

      break;
    case "KeyD":
      keys.d.pressed = false;

      break;

    default:
      break;
  }
});

const devicePixelRatio = window.devicePixelRatio * 1.5 || 2;

canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

// socket.on("player", function (player) {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   console.log(player);
//   ctx.beginPath();
//   ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);
//   ctx.fillStyle = player.color;
//   ctx.fill();
// });

const x = canvas.width / 2;
const y = canvas.height / 2;

const frontendPlayers = {};
const frontendProjectiles = {};

addEventListener("click", (event) => {
  const playerPosition = {
    x: frontendPlayers[socket.id].x,
    y: frontendPlayers[socket.id].y,
  };

  const angle = Math.atan2(
    event.clientY * devicePixelRatio - playerPosition.y,
    event.clientX * devicePixelRatio - playerPosition.x
  );
  //   const velocity = {
  //     x: Math.cos(angle) * projectileSpeed,
  //     y: Math.sin(angle) * projectileSpeed,
  //   };

  socket.emit("shoot", { x: playerPosition.x, y: playerPosition.y, angle });

  //   frontendProjectiles.push(
  //     new Projectile({
  //       x: playerPosition.x,
  //       y: playerPosition.y,
  //       radius: 5,
  //       color: "black",
  //       velocity,
  //     })
  //   );

  console.log(frontendProjectiles);
});

socket.on("connect", () => {
  socket.emit("initCanvas", {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
  });
});

socket.on("updateProjectiles", (backendProjectiles) => {
  for (const id in backendProjectiles) {
    const backendProjectile = backendProjectiles[id];

    if (!frontendProjectiles[id]) {
      frontendProjectiles[id] = new Projectile({
        x: backendProjectile.x,
        y: backendProjectile.y,
        radius: 10,
        color: frontendPlayers[backendProjectile.playerId]?.color,
        velocity: backendProjectile.velocity,
      });
    } else {
      frontendProjectiles[id].x += backendProjectiles[id].velocity.x;
      frontendProjectiles[id].y += backendProjectiles[id].velocity.y;
    }
  }

  for (const id in frontendProjectiles) {
    if (!backendProjectiles[id]) {
      delete frontendProjectiles[id];
    }
  }
});

socket.on("updatePlayers", (backendPlayers) => {
  for (const id in backendPlayers) {
    const backendPlayer = backendPlayers[id];

    if (!frontendPlayers[id]) {
      frontendPlayers[id] = new Player({
        x: backendPlayer.x,
        y: backendPlayer.y,
        radius: 20,
        color: backendPlayer.color,
      });
    } else {
      frontendPlayers[id].x = backendPlayer.x;
      frontendPlayers[id].y = backendPlayer.y;

      if (id === socket.id) {
        frontendPlayers[id].x = backendPlayer.x;
        frontendPlayers[id].y = backendPlayer.y;

        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backendPlayer.sequenceNumber === input.sequenceNumber;
        });

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1);

        playerInputs.forEach((input) => {
          frontendPlayers[id].x += input.dx;
          frontendPlayers[id].y += input.dy;
        });
      } else {
        frontendPlayers[id].x = backendPlayer.x;
        frontendPlayers[id].y = backendPlayer.y;
      }
    }
  }

  for (const id in frontendPlayers) {
    if (!backendPlayers[id]) {
      delete frontendPlayers[id];
    }
  }
});

function animate() {
  requestAnimationFrame(animate);
  {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in frontendPlayers) {
      const frontendPlayer = frontendPlayers[id];
      frontendPlayer.draw();
    }

    for (const id in frontendProjectiles) {
      const frontendProjectile = frontendProjectiles[id];
      frontendProjectile.draw();
    }

    // for (let i = frontendProjectiles.length - 1; i >= 0; i--) {
    //   const frontendProjectile = frontendProjectiles[i];
    //   frontendProjectile.update();
    // }

    // ctx.beginPath();
    // ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    // ctx.fillStyle = player.color;
    // ctx.fill();
  }
}

animate();

function resize() {
  canvas.style.width = screen.width;
  canvas.style.height = screen.height;

  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}

window.addEventListener("resize", resize);

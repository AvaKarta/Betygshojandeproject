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

let number1 = Math.floor(Math.random() * 230);

let number2 = Math.floor(Math.random() * 230);

let number3 = Math.floor(Math.random() * 230);

color = `rgb(${number1} ${number2} ${number3})`;

let left = false;
let right = false;
let up = false;
let down = false;

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

setInterval(() => {
  if (keys.w.pressed) {
    frontendPlayers[socket.id].y -= speed;
    socket.emit("keydown", "KeyW");
  }
  if (keys.a.pressed) {
    frontendPlayers[socket.id].x -= speed;
    socket.emit("keydown", "KeyA");
  }
  if (keys.s.pressed) {
    frontendPlayers[socket.id].y += speed;
    socket.emit("keydown", "KeyS");
  }
  if (keys.d.pressed) {
    frontendPlayers[socket.id].x += speed;
    socket.emit("keydown", "KeyD");
  }
}, 15);

window.addEventListener("keydown", (event) => {
  if (!frontendPlayers[socket.id]) return;

  switch (event.code) {
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
    case "KeyW":
      keys.w.pressed = false;

      break;
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

const devicePixelRatio = window.devicePixelRatio * 2 || 2;

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
}

window.addEventListener("resize", resize);

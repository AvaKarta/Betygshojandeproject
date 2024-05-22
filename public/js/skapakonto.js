let socket = io();

let form = document.querySelector("#skapakonto");
let error = document.querySelector("#error");
let error2 = document.querySelector("#error2");
let succsesDiv = document.querySelector("#succses");
// console.log(succses);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let username = document.querySelector("#username").value;
  let password = document.querySelector("#password").value;
  error.style.display = "none";
  error2.style.display = "none";

  socket.emit("skapaKonto", {
    username: username,
    password: password,
  });
});

socket.on("userError", (errortype) => {
  if (errortype === 1) {
    error.style.display = "block";
  } else if (errortype === 2) {
    error2.style.display = "block";
  }
});

socket.on("succses", (succses) => {
  console.log(succsesDiv);
  if (succses) {
    succsesDiv.style.display = "block";
  }
});

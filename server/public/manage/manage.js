const socket = io.connect();
const selects = document.getElementsByTagName("select");

let password;

socket.on("connect", function () {
  console.log("connected");
});

socket.on("loginSucceed", function () {
  document.getElementById("welcome").style.display = 'none';
  document.getElementById("setting-list").style.display = 'block';
})

socket.on("status", function (players) {
  console.log(players)
  players.forEach((player, index) => {
    if (player === 'Yoda B') {
      selects[index].value = 's';
    } else if (player === 'Bboki') {
      selects[index].value = 'm';
    } else if (player === 'Muscle Man') {
      selects[index].value = 'g';
    } else {
      selects[index].value = 'public';
    }
  })
});

function login() {
  password = document.getElementById('password').value;

  socket.emit("manage", password);
}

function switchPosition(index) {
  const nextPlayer = selects[index].value;

  socket.emit("switchPosition", password, index, nextPlayer);
}
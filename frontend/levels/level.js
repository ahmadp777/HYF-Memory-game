
// -----Retrieve from LocalStorage 

const playerName = localStorage.getItem("player");

const playerNameElement = document.getElementById("player-name");
playerNameElement.textContent = playerName ? playerName + "!" : "Player!";


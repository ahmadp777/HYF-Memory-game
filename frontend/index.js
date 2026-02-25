
const startButton = document.getElementById("startBtn");

const getPlayerName = () => {
    const playerName = document.getElementById("playerName").value;

    // Store in localStorage
    localStorage.setItem("player", playerName);
}
startButton.addEventListener("click", getPlayerName);



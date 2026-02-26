const playerName = new URLSearchParams(window.location.search).get("playerName");

const playerNameElement = document.getElementById("player-name");
if (playerNameElement) {
    playerNameElement.textContent = playerName ? playerName + "!" : "Player!";
}

const encodedName = encodeURIComponent(playerName || "");

const leaderboardLink = document.getElementById("leaderboard-page");
leaderboardLink.href = `../leaderBoard/leaderBoard.html?playerName=${encodedName}`;

const links = document.querySelectorAll(".level a");
links.forEach((link) => {
    const level = link.getAttribute("href").split("level=")[1];
    link.href = `../game/game.html?level=${level}&playerName=${encodedName}`;
});
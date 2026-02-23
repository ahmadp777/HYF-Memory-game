const playerName = new URLSearchParams(window.location.search).get(
  "playerName"
);
// 🟡 [important] - Remove console.log statements before production/merge
console.log("PLAYER NAME: ", playerName);

const playerNameElement = document.getElementById("player-name");
playerNameElement.textContent = playerName ? playerName + "!" : "Player!";

const links = document.querySelectorAll(".level a");
const leaderboardLink = document.getElementById("leaderboard-page");

// 🟡 [important] - playerName is not URL-encoded here. If the name contains special
// characters (e.g., spaces, &, =), the URL will break. Use encodeURIComponent().
leaderboardLink.href = `../leaderBoard/leaderBoard.html?playerName=${playerName}`;

links.forEach((link) => {
  const level = link.getAttribute("href").split("level=")[1];
  console.log("Setting link for level: ", level);
  link.href = `../game/game.html?level=${level}&playerName=${playerName}`;
});

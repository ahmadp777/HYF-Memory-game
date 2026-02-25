const params = new URLSearchParams(window.location.search);

const playerName = localStorage.getItem("player");
const moves     = params.get("moves");
const score     = params.get("score");
const time      = params.get("time");
const level     = params.get("level");

// Populate stats
document.getElementById("player-name").textContent  = playerName ? playerName + "!" : "Player!";
document.getElementById("stat-moves").textContent   = moves  ?? "—";
document.getElementById("stat-score").textContent   = score !== null ? score + " XP" : "—";
document.getElementById("stat-time").textContent    = time   !== null ? time + "s"   : "—";

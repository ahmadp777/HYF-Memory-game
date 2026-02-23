const playerName = new URLSearchParams(window.location.search).get("playerName");
console.log("PLAYER NAME: ", playerName);

const link = document.getElementById("level-page");
link.href = `../levels/levels.html?playerName=${playerName}`;


// ---- Leaderboard ----

// 🔴 [blocking] - Hardcoded "http://localhost:3000" - same issue as in game.js.
// Use relative URLs or a shared config constant.
async function fetchLeaderboard(difficulty) {
  try {
    const url = difficulty
      ? `http://localhost:3000/leaderboard?difficulty=${difficulty}`
      : `http://localhost:3000/leaderboard`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return null;
  }
}

const MEDALS = ["🥇", "🥈", "🥉"];

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

async function renderLeaderboard(difficulty) {
  const container = document.querySelector(".leaderboard");

  // Loading state
  container.innerHTML = `<div class="lb-loading">Loading...</div>`;

  const data = await fetchLeaderboard(difficulty);

  if (data === null) {
    container.innerHTML = `<div class="lb-error">⚠️ Could not load scores. Please check your connection.</div>`;
    return;
  }

  if (data.length === 0) {
    container.innerHTML = `<div class="lb-empty">No scores yet for this difficulty. Be the first!</div>`;
    return;
  }

  container.innerHTML = data.map((entry, index) => {
    const rank = index < 3 ? MEDALS[index] : index + 1;
    const initial = getInitial(entry.username);
    const topClass = index < 3 ? `top-${index + 1}` : "";

    return `
      <div class="player ${topClass}">
        <div class="player-info">
          <span class="rank">${rank}</span>
          <div class="avatar">${initial}</div>
          <span class="username">${entry.username}</span>
        </div>
        <div class="xp">${entry.score} XP</div>
      </div>
    `;
  }).join("");
}

// ---- Level tab switching ----

const levelCards = document.querySelectorAll(".level-card");

levelCards.forEach(card => {
  card.addEventListener("click", () => {
    levelCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    const difficulty = ["easy", "medium", "hard"].find(d => card.classList.contains(d));
    if (difficulty) renderLeaderboard(difficulty);
  });
});

// Initial render with the default active tab (Easy)
const activeCard = document.querySelector(".level-card.active");
const initialDifficulty = ["easy", "medium", "hard"].find(d => activeCard?.classList.contains(d)) || "easy";
renderLeaderboard(initialDifficulty);
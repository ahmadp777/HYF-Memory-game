// 🎉 Excellent pattern: grouping all DOM references in a single object
// keeps things organized and easy to maintain
// ---- DOM refs ----
const UI = {
    moves: document.getElementById("moves"),
    score: document.getElementById("score"),
    time: document.getElementById("time"),
    board: document.querySelector(".game-board"),
    spinner: document.getElementById("board-spinner"),
};

// ---- URL params ----
const searchParams = new URLSearchParams(window.location.search);
const DIFFICULTY = searchParams.get("level");
const PLAYER_NAME = searchParams.get("playerName");

// ---- Level config ----
const LEVEL_CONFIG = {
    easy: { rows: 3, cols: 4 },
    medium: { rows: 4, cols: 4 },
    hard: { rows: 4, cols: 5 },
};

// 🎉 Clean state management pattern. Centralizing game state in one object
// makes it easy to track and reset. Well done!
// ---- Game state ----
const state = {
    firstCard: null,
    secondCard: null,
    locked: false,
    gameOver: false,
    moves: 0,
    score: 0,
    matchedPairs: 0,
    totalPairs: 0,
};

// ---- Timer state ----
const clock = {
    seconds: 0,
    interval: null,
    started: false,
};

function startClock() {
    clock.interval = setInterval(() => {
        clock.seconds++;
        UI.time.textContent = clock.seconds;
    }, 1000);
    clock.started = true;
}

function stopClock() {
    clearInterval(clock.interval);
}

function resetClock() {
    stopClock();
    clock.seconds = 0;
    clock.started = false;
    UI.time.textContent = 0;
}

function showSpinner() {
    if (UI.spinner) UI.spinner.style.display = "flex";
    if (UI.board)   UI.board.style.visibility = "hidden";
}

function hideSpinner() {
    if (UI.spinner) UI.spinner.style.display = "none";
    if (UI.board)   UI.board.style.visibility = "visible";
}

// 🔴 [blocking] - Hardcoded "http://localhost:3000" will break in production/deployment.
// This applies to ALL fetch calls in this file and leaderBoard.js.
async function fetchCards(difficulty) {
    const response = await fetch("http://localhost:3000/cards?difficulty=" + difficulty);
    if (!response.ok) throw new Error("Failed to fetch cards: " + response.status);
    return response.json();
}

function submitScore(username, score, difficulty) {
    return fetch("http://localhost:3000/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, score, difficulty }),
    });
}

async function buildCardPairs(totalCards, difficulty) {
    const allCards = await fetchCards(difficulty);

    // Deduplicate by name, then pick enough unique pairs
    const unique = [];
    for (const card of allCards) {
        if (!unique.some(c => c.name === card.name)) unique.push(card);
        if (unique.length === totalCards / 2) break;
    }

    // Duplicate each card to make a pair, then shuffle
    // 🟡 [important] - sort(() => Math.random() - 0.5) produces a biased shuffle.
    return [...unique, ...unique].sort(() => Math.random() - 0.5);
}

// Clone the hidden template card once at startup
const cardTemplate = UI.board.querySelector(".card")?.cloneNode(true);
UI.board.querySelector(".card")?.remove();

function createCardElement(emoji) {
    const card = cardTemplate.cloneNode(true);
    const inner = card.querySelector(".card-inner");
    const img = card.querySelector("#cardImg");

    card.dataset.emojiName = emoji.name;
    card.style.display = "";
    card.style.visibility = "visible";
    // 🔴 [blocking] - Same hardcoded localhost issue here
    img.src = "http://localhost:3000/" + emoji.image;
    img.alt = emoji.name;
    inner.classList.remove("flipped");
    inner.addEventListener("click", () => onCardClick(inner));

    return card;
}

async function renderBoard() {
    const config = LEVEL_CONFIG[DIFFICULTY];
    if (!config) return;

    const { rows, cols } = config;
    const totalCards = rows * cols;

    state.totalPairs = totalCards / 2;

    UI.board.style.setProperty("--rows", rows);
    UI.board.style.setProperty("--columns", cols);
    UI.board.innerHTML = "";

    showSpinner();

    const pairs = await buildCardPairs(totalCards, DIFFICULTY);
    if (state.gameOver) return; // guard: game ended while awaiting

    hideSpinner();
    pairs.forEach(emoji => UI.board.appendChild(createCardElement(emoji)));
}

function resetState() {
    state.firstCard = null;
    state.secondCard = null;
    state.locked = false;
    state.gameOver = false;
    state.moves = 0;
    state.score = 0;
    state.matchedPairs = 0;

    UI.moves.textContent = 0;
    UI.score.textContent = 0;

    resetClock();
}

function unlockBoard() {
    state.firstCard = null;
    state.secondCard = null;
    state.locked = false;
}

function updateScore(delta) {
    state.score = Math.max(0, state.score + delta);
    UI.score.textContent = state.score;
}

function incrementMoves() {
    state.moves++;
    UI.moves.textContent = state.moves;
}

function onCardClick(cardInner) {
    if (state.gameOver) return;
    if (state.locked) return;
    if (cardInner === state.firstCard) return;

    cardInner.classList.add("flipped");

    if (!clock.started) startClock();

    if (!state.firstCard) {
        state.firstCard = cardInner;
        return;
    }

    state.secondCard = cardInner;
    state.locked = true;
    incrementMoves();

    setTimeout(evaluateMatch, 1000);
}

function getEmojiName(cardInner) {
    return cardInner.closest(".card").dataset.emojiName;
}

async function evaluateMatch() {
    if (state.gameOver) return;

    const isMatch = getEmojiName(state.firstCard) === getEmojiName(state.secondCard);

    if (isMatch) {
        updateScore(+10);
        await onMatchFound();
    } else {
        updateScore(-5);
        flipCardsBack();
    }
}

async function onMatchFound() {
    state.firstCard.closest(".card").style.visibility = "hidden";
    state.secondCard.closest(".card").style.visibility = "hidden";
    state.matchedPairs++;

    if (state.matchedPairs === state.totalPairs) {
        await onGameComplete();
        return;
    }

    unlockBoard();
}

function flipCardsBack() {
    state.firstCard.classList.remove("flipped");
    state.secondCard.classList.remove("flipped");
    unlockBoard();
}

async function onGameComplete() {
    stopClock();
    state.locked = true;
    state.gameOver = true;

    const victoryUrl = buildVictoryUrl();

    submitScore(PLAYER_NAME || "Player", state.score, DIFFICULTY)
        .finally(() => { window.location.href = victoryUrl; });
}

function buildVictoryUrl() {
    const query = new URLSearchParams({
        playerName: PLAYER_NAME || "",
        moves: state.moves,
        score: state.score,
        time: clock.seconds,
        level: DIFFICULTY || "",
    });
    return "../endGamePanel/victory.html?" + query.toString();
}

document.querySelectorAll(".level-page").forEach(link => {
    link.href = "../levels/levels.html?playerName=" + encodeURIComponent(PLAYER_NAME || "");
});

// 🟡 [important] - No try/catch around renderBoard(). If the server is down,
// the user sees a spinner forever with no error message.
async function init() {
    resetState();
    await renderBoard();
}

init();



const movesDisplay = document.getElementById("moves");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");

let firstCard = null;
let secondCard = null;
let lockBoard = false;  

let moves = 0;
let score = 0;
let matchedPairs = 0;
let totalPairs = 0;

let timer = 0;
let timerInterval = null;
let timerStarted = false;

const startTimer = () => {
    timerInterval = setInterval(() => {
        timer++;
        timeDisplay.textContent = timer;
    }, 1000);
}

const stopTimer = () => {
    clearInterval(timerInterval);
}


// Card Image Setup
function setUpCardImages(cardElement){
    if(lockBoard) return; // Prevent clicking when board is locked
    if(cardElement === firstCard) return; // Prevent clicking the same card twice

    console.log('setting up card images');
    cardElement.classList.toggle('flipped');
    if(!timerStarted){
        startTimer();
        timerStarted = true;
    }

    if(!firstCard){
        firstCard = cardElement;
        return;
    } else {
        secondCard = cardElement;

        moves++;   
        movesDisplay.textContent = moves;

        lockBoard = true;
        setTimeout(checkForMatch, 1000); 
    }    
}


// Game board creation ----- 

const params = new URLSearchParams(window.location.search);
const level = params?.get('level');
const player = params?.get('playerName');

const linkElements = document.querySelectorAll(".level-page");
linkElements.forEach(link => {
    link.href = `../levels/levels.html?playerName=${player}`;
});

console.log("Selected level : "+level);

const levelConfig = {
    easy : {
        rows : 3,
        columns : 4
    },
    medium : {
        rows : 4,
        columns : 4
    },
    hard : {
        rows : 4,
        columns : 5
    }
    }

console.log("Cards R & C ::: "+levelConfig[level]?.rows);

const board= document.querySelector(".game-board");
const templateCard = document.querySelector('.card')?.cloneNode(true);
const buttons = document.querySelectorAll("[data-rows]");
createGameBoard(levelConfig[level]?.rows, levelConfig[level]?.columns);


// Fetching Emojis
async function fetchEmojis(difficulty) {
   try { const response = await fetch(`http://localhost:3000/cards?difficulty=${difficulty}`); 
   if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const emojis = await response.json();
    return emojis;
    } catch (error) {
        console.error("Failed to fetch emojis:", error); 
        return [];
    }
}

// Random Emoji pairs Assignment

async function assignEmojisToCards(count , difficulty) {
    const allEmojis= await fetchEmojis(difficulty);
    const shuffled= allEmojis.sort(() => 0.5 - Math.random());
    // prevent duplicate emojis in the selected pairs
    const selectedEmojis=[];
    for (let i=0; i<shuffled.length && selectedEmojis.length < count / 2; i++) {
        const alreadySelected = selectedEmojis.some(emoji => emoji.name === shuffled[i].name);
        if (!alreadySelected) {
            selectedEmojis.push(shuffled[i]);
        }
    }

    const emojiPairs= [...selectedEmojis, ...selectedEmojis];
    return emojiPairs.sort(() => 0.5 - Math.random());
}   


async function createGameBoard(rows, columns) {
    firstCard = null;
    secondCard = null;
    lockBoard = false;  

    moves = 0;
    matchedPairs = 0;
    timer = 0;
    timerStarted = false;
    stopTimer();

    movesDisplay.textContent = 0;
    scoreDisplay.textContent = 0;
    timeDisplay.textContent = 0;

    board.style.setProperty('--rows', rows);
    board.style.setProperty('--columns', columns);
    
    const totalCards= rows * columns; 
    totalPairs = totalCards / 2;

    document.getElementById("victory-overlay").classList.add("hidden");

    board.innerHTML = '';

    const emojiPairs= await assignEmojisToCards(totalCards, level);

    for (let i=0; i< totalCards; i++) {
        const card = templateCard.cloneNode(true);
        card.style.visibility = 'visible';
        const emoji = emojiPairs[i];
        card.dataset.emojiName = emoji.name;

        const imgElement = card.querySelector('#cardImg');
        imgElement.src = `http://localhost:3000/${emoji.image}`;
        imgElement.alt = emoji.name;

        const cardInner = card.querySelector('.card-inner');
        cardInner.classList.remove('flipped');

        board.appendChild(card);
    }
}

// card matching logic
function checkForMatch() {
    const isMatch = firstCard.closest('.card').dataset.emojiName === secondCard.closest('.card').dataset.emojiName;

    if(isMatch){
        disappearCards();
        score = score + 10;
        scoreDisplay.textContent = score;
    } else {
       unFlipCards();
       score = Math.max(0, score - 5);
       scoreDisplay.textContent = score;
    }
}

function disappearCards() {
    firstCard.closest('.card').style.visibility = 'hidden';
    secondCard.closest('.card').style.visibility = 'hidden';

    matchedPairs++;

    if(matchedPairs === totalPairs){
        stopTimer();
        finishedGame();
    }

    resetBoard();
}

function finishedGame() {
            setTimeout(() => {
            document.getElementById("final-moves").textContent = moves;
            document.getElementById("final-score").textContent = score;
            document.getElementById("final-time").textContent = timer;
            document.getElementById("player-name-victory").textContent = player ? player+"!" : "Player!";

            document.getElementById("victory-overlay").classList.remove("hidden");

            confetti({
                particleCount: 500,
                spread: 250,
                scalar: Math.random() * 2.5 + 1,
                origin: {y: 0.3, x: 0.5},
                zIndex: 2001
            });
            confetti({
                particleCount: 500,
                spread: 300,
                scalar: Math.random() * 2 + 1,
                origin: {y: 0.9, x: 0.5},
                zIndex: 2001
            });

        }, 500);

        //winning page is not shown after adding these 2 lines
        savescore(player, score, level);
        const leaderboard = fetchLeaderboard(level);
}   

async function savescore(userName, score, difficulty) {
    try {
        const response = await fetch('http://localhost:3000/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: userName,
                score: score,
                difficulty: difficulty
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save score');
        }
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

async function fetchLeaderboard(difficulty) {
    try {const response = await fetch(`http://localhost:3000/leaderboard?difficulty=${difficulty}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }   
    const leaderboard = await response.json();
    return leaderboard;
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        return [];
    }
}



function unFlipCards() {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
}   

function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}   

// Screen Switcher

const homeScreen = document.getElementById('home');
const levelScreen = document.getElementById('levels');
const gameScreen = document.getElementById('game');

let firstCard = null;
let secondCard = null;
let lockBoard = false;  

function showHomeScreen(){
    console.log('showing home screen');
  homeScreen.style.display = 'flex';
  levelScreen.style.display = 'none';
  gameScreen.style.display = 'none';
}

function showLevelsScreen(){
    console.log('showing levels screen');
  homeScreen.style.display = 'none';
  levelScreen.style.display = 'flex';
  gameScreen.style.display = 'none';
}

function showGameScreen(level){
    console.log('showing game screen :::: '+level);
  homeScreen.style.display = 'none';
  levelScreen.style.display = 'none';
  gameScreen.style.display = 'flex';
}

// Card Image Setup
function setUpCardImages(cardElement){
    if(lockBoard) return; // Prevent clicking when board is locked
    if(cardElement === firstCard) return; // Prevent clicking the same card twice

    console.log('setting up card images');
    cardElement.classList.toggle('flipped');
    // const backCard = document.getElementById('cardImg');
    // backCard.src = './assets/cool.png';

    if(!firstCard){
        firstCard = cardElement;
        return;
    } else {
        secondCard = cardElement;
        lockBoard = true;
        setTimeout(checkForMatch, 1500); 
    }    
}


// Game board creation ----- 


const board= document.querySelector(".game-board");
const templateCard = document.querySelector('.card').cloneNode(true);
const buttons = document.querySelectorAll("[data-rows]");
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const rows= Number(button.dataset.rows);
        const columns= Number(button.dataset.columns);
        creategameBoard(rows, columns);
    });
});

// Fetching Emojis from API
async function fetchEmojis(category = "smileys and people") {
    const response = await fetch(`https://emojihub.yurace.pro/api/all/category/${category}`); 
    const emojis = await response.json();
    return emojis;
}

// Random Emoji pairs Assignment

async function assignEmojisToCards(count , category= "smileys and people") {
    const allEmojis= await fetchEmojis(category);
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


async function creategameBoard(rows, columns) {
    firstCard = null;
    secondCard = null;
    lockBoard = false;  

    board.style.setProperty('--rows', rows);
    board.style.setProperty('--columns', columns);
    const totalCards= rows * columns; 

    board.innerHTML = '';

    const emojipairs= await assignEmojisToCards(totalCards);

    for (let i=0; i< totalCards; i++) {
        const card = templateCard.cloneNode(true);
        card.style.visibility = 'visible';
        const emoji = emojipairs[i];
        card.dataset.emojiName = emoji.name;

        const imgElement = card.querySelector('#cardImg');
        imgElement.innerHTML = emoji.htmlCode[0];
        imgElement.removeAttribute("src");

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
    } else {
       unflipCards();
    }
}

function disappearCards() {
    firstCard.closest('.card').style.visibility = 'hidden';
    secondCard.closest('.card').style.visibility = 'hidden';
    resetBoard();
}

function unflipCards() {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
}   

function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}   
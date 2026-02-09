
// Screen Switcher

const homeScreen = document.getElementById('home');
const levelScreen = document.getElementById('levels');
const gameScreen = document.getElementById('game');

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
    console.log('setting up card images');
    cardElement.classList.toggle('flipped');
    const backCard = document.getElementById('cardImg');
    backCard.src = './assets/cool.png';

}



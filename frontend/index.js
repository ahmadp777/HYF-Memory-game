
const form = document.querySelector("form");

const savePlayerName = () => {
    const playerName = document.getElementById("playerName").value;

    // validate and save in localstorage
    playerName ? localStorage.setItem("player", playerName) : localStorage.setItem("player", "Player");

}
form.addEventListener("submit", (e) => {
    e.preventDefault();
    savePlayerName();
    // Redirect to the levels page
    window.location.href = "./levels/levels.html";

});



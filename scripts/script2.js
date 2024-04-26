const total_pokemons = 100;
const NUM_BALLS = 7;
const player = document.querySelector(".player");
const player_pos = {
    x: parseInt(window.innerWidth / 2),
    y: parseInt(window.innerHeight / 2),
};
const player_vel = {
    x: 0,
    y: 0,
};
const balls = [];
const sound = new Audio("assets/coin.mp3");
function generateBall() {
    const div = document.createElement("div");
    div.classList.add("pokeball");
    let x = Math.random() * 100 + "%";
    let y = Math.random() * 100 + "%";
    div.style.left = x;
    div.style.top = y;
    balls.push({
        ball: div,
        pos: {
        x: x,
        y: y,
    },
});
    document.body.appendChild(div);
}
function createBalls() {
    for (let i = 0; i < NUM_BALLS; i++) {
        generateBall();
    }
}

function collision($div1, $div2) {
    var x1 = $div1.getBoundingClientRect().left;
    var y1 = $div1.getBoundingClientRect().top;
    var h1 = $div1.clientHeight;
    var w1 = $div1.clientWidth;
    var b1 = y1 + h1;
    var r1 = x1 + w1;

    var x2 = $div2.getBoundingClientRect().left;
    var y2 = $div2.getBoundingClientRect().top;
    var h2 = $div2.clientHeight;
    var w2 = $div2.clientWidth;
    var b2 = y2 + h2;
    var r2 = x2 + w2;

    if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
    return true;
}

// function checkCollisions() {
//     balls.forEach((ball) => {
//         if (collision(ball.ball, player)) {
//             sound.play();
//             ball.ball.remove();
//             generateBall();
//             start();
//         }
//     });
// }
function run() {
    player_pos.x += player_vel.x;
    player_pos.y += player_vel.y;
    player.style.left = player_pos.x + "px";
    player.style.bottom = player_pos.y + "px";
    checkCollisions();
    requestAnimationFrame(run);
}
function play() {
    createBalls();
    run();
}

play();

window.addEventListener("keydown", function (e) {
    if (e.key == "ArrowUp") {
        player_vel.y = 3;
        player.style.backgroundImage = 'url("assets/player_front.png")';
    }
    if (e.key == "ArrowDown") {
        player_vel.y = -1;
        player.style.backgroundImage = 'url("assets/player_back.png")';
    }
    if (e.key == "ArrowLeft") {
        player_vel.x = -1;
        player.style.backgroundImage = 'url("assets/player_left.png")';
    }
    if (e.key == "ArrowRight") {
        player_vel.x = 1;
        player.style.backgroundImage = 'url("assets/player_right.png")';
    }
    player.classList.add("active");
});
window.addEventListener("keyup", function () {
    player_vel.x = 0;
    player_vel.y = 0;
    player.classList.remove("active");
});

async function fetchRandomPokemon(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    return data;
}

async function checkCollisions() {
    balls.forEach(async (ball) => {
      if (collision(ball.ball, player)) {
          sound.play();
          ball.ball.remove();
          generateBall();
          const pokemon = await fetchRandomPokemon(
              randomInteger(1, total_pokemons)
          );
          const pokemonID = pokemon.species.url.split("/")[6];
          console.log(pokemonID);
          if (pokemonID) {
              window.location.href = `./pokemon.html?id=${pokemonID}`;
          }
      }
    });
}
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
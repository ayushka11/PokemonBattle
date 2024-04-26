let current_id = null;
let attacks=[];
let hp = localStorage.getItem("hp"); //done
let hp_o = localStorage.getItem("hp_o"); //done
let attacks_o = [];
let multiplier = 5;
let waitForPressResolve = null;
const hpElement = document.getElementById('hpValue');
const hpElement_o = document.getElementById('hpValue_o');
var maxhp = 500;
var maxhp_o = 500;

document.addEventListener("DOMContentLoaded", () => {
    const total_pokemons = 100;
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    var id = parseInt(pokemonID);

    if (id<1 || id >total_pokemons) {
        id = 3;
    }

    current_id = id;
    loadPokemon(id);
});

function showLoadingScreen() {
  var loadingScreen = document.createElement("div");
  loadingScreen.id = "loading-screen";
  loadingScreen.style.position = "fixed";
  loadingScreen.style.top = "0";
  loadingScreen.style.left = "0";
  loadingScreen.style.width = "100%";
  loadingScreen.style.height = "100%";
  loadingScreen.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
  loadingScreen.style.zIndex = "9999";
  
  loadingScreen.innerHTML = "<p>Loading...</p>"; 
  
  document.body.appendChild(loadingScreen);
}

function hideLoadingScreen() {
  var loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
      loadingScreen.parentNode.removeChild(loadingScreen);
  }
}

function attack_audio() {
  var audio_a = new Audio('../assets/attack.mp3');
  audio_a.play();
}
const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    dark: "#EE99AC",
};

function updateHPBar(hpValue, maxHP, hpBarId) {
  const hpBar = document.getElementById(hpBarId);
  if (!hpBar) {
    console.error("HP bar element not found for ID:", hpBarId);
    return;
  }
  const hpPercentage = (hpValue / maxHP) * 100;
 
  hpBar.style.width = hpPercentage + "%";
}

function setElementStyles(elements, cssProperty, value) {
    elements.forEach((element) => {
      element.style[cssProperty] = value;
    });
  }
  
  function rgbaFromHex(hexColor) {
    return [
      parseInt(hexColor.slice(1, 3), 16),
      parseInt(hexColor.slice(3, 5), 16),
      parseInt(hexColor.slice(5, 7), 16),
    ].join(", ");
  }
  
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  
  function createAndAppendElement(parent, tag, options = {}) {
    const element = document.createElement(tag);
    Object.keys(options).forEach((key) => {
      element[key] = options[key];
    });
    parent.appendChild(element);
    return element;
  }

  async function search_pokemon_and_attacks(pokemon) {
    let attacks = [];
    for (let val of pokemon["moves"]) {
      if (
        val.version_group_details.some(
          (method) => method.move_learn_method.name === "level-up"
        )
      ) {
        let move_name = val["move"]["name"]; 
        let damage = await attack_damage(move_name); 
        if (damage[1] != null) {
          attacks.push([move_name, damage[0], damage[1]]); 
        }
      }
    }
    console.log ("search_pokemon_and_attack runs and returns ", attacks); //debug
    return attacks; 
  }

  async function attack_damage(query) {
    const res = await fetch(`https://pokeapi.co/api/v2/move/${query}`);
    if (!res.ok) {
      return query + " is invalid"; 
    } else {
      let attack = await res.json(); 
      if (
        attack.damage_class.name == "physical" ||
        attack.damage_class.name == "special"
      ) {
        console.log("attack_damage runs"); //debug
        return [attack.damage_class.name, attack["power"]]; 
      } else {
        console.log("attack_damage runs"); //debug
        return [attack.damage_class.name, null];
      }
    }
  }

  function getHP(data) {
    for (let stat of data.stats) {
      if (stat.stat.name == "hp") {
        console.log("get_hp runs"); //debug
        return Number(stat["base_stat"]);
      }
    }
  }

  function updateHP(newHP) {
    updateHPBar(newHP,maxhp, 'hpBar');
    hp = newHP;
    hpElement.textContent = hp; 
    localStorage.setItem('hp', hp); //done
    console.log("updateHP runs"); //debug
    
  }

  function updateHP_o(newHP) {
    updateHPBar(newHP, maxhp_o, 'hpBar_o');
    hp_o = newHP;
    hpElement_o.textContent = hp_o; 
    localStorage.setItem('hp_o', hp_o); //done
    console.log("updateHP_o runs"); //debug
  }


  
async function loadPokemon(id) {
    showLoadingScreen();
    try {
        const[pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json()),
        ]);

        attacks = await search_pokemon_and_attacks(pokemon);
        hp = getHP(pokemon);
        hp = hp * multiplier;
        
        localStorage.setItem('hp', hp); //done

        if (current_id === id) {
            displayDetails(pokemon);
        }
        console.log("loadPokemon runs"); //debug
        hideLoadingScreen();
        return true;
    } catch(error) {
        console.error("error while fetching", error);
        hideLoadingScreen();
        return false;
    }
    
}

function displayDetails(pokemon) {
    const {name, id, types, weight, height, abilities, stats} = pokemon;
    const pokemonName = capitalizeFirstLetter(name);

    const mainElement = document.querySelector(".main");
    mainElement.classList.add(name.toLowerCase());

    document.querySelector(".name-wrap .name").textContent = pokemonName;

    const image = document.querySelector(".img-wrap img");
    image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
    image.alt = name;

    const typeWrap = document.querySelector(".type-wrap");
    typeWrap.innerHTML = "";
    types.forEach(({ type }) => {
        createAndAppendElement(typeWrap, "p", {
            className: `font1 type ${type.name}`,
            textContent: type.name,
        });
    });

    //const hpElement = document.getElementById('hpValue');
    hpElement.textContent = hp;


    let button_html = "";
  for (let val of attacks) {
    button_html += `<button class="attack_buttons ${val[0]}"> ${val[0]} : ${val[2]} </button>`;
  }
  document.querySelector(".attacks").innerHTML = button_html;
  console.log("displayDetails runs"); //debug
}

let opponent_id = null;
let oid = null;

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

document.addEventListener("DOMContentLoaded", () => {
  const total_pokemons = 100;
  opponent_id = randomInteger(1, total_pokemons);
  if (opponent_id < 1 || opponent_id > total_pokemons) {
    opponent_id = 4;
  }
  oid = opponent_id;
  loadOpponent_o(opponent_id);
});

async function loadOpponent_o(opponent_id) {
  showLoadingScreen();
  try {
      //console.log("id ", opponent_id);
      const[pokemon, pokemonSpecies] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${opponent_id}`).then((res) => res.json()),
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${opponent_id}`).then((res) => res.json()),
      ]);

      //console.log("opponent data ", pokemon, pokemonSpecies);
      
      attacks_o = await search_pokemon_and_attacks(pokemon);
      hp_o = getHP(pokemon);
      hp_o = hp_o * multiplier;
  
      displayDetails_o(pokemon);
      console.log("loadOpponent runs"); //debug
      hideLoadingScreen();
      return true;
  } catch(error) {
      console.error("error while fetching", error);
      hideLoadingScreen();
      return false;
  }
  
}

function displayDetails_o(pokemon) {
  const {name, id, types, weight, height, abilities, stats} = pokemon;
  //console.log("display ", pokemon);
  const pokemonName_o = capitalizeFirstLetter(name);

  const mainElement_o = document.querySelector(".main_o");
  mainElement_o.classList.add(name.toLowerCase());

  document.querySelector(".name-wrap_o .name_o").textContent = pokemonName_o;

  const image_o = document.querySelector(".img-wrap_o img");
  image_o.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
  image_o.alt = name;

  const typeWrap_o = document.querySelector(".type-wrap_o");
  typeWrap_o.innerHTML = "";
  types.forEach(({ type }) => {
      createAndAppendElement(typeWrap_o, "p", {
          className: `font1 type ${type.name}`,
          textContent: type.name,
      });

  
  });

  //const hpElement_o = document.getElementById('hpValue_o');
    hpElement_o.textContent = hp_o;

  let button_html = "";
  for (let val of attacks_o) {
    button_html += `<button class="attack_buttons_o ${val[0]}"> ${val[0]} : ${val[2]} </button>`;
  }
  console.log(89)
  document.querySelector(".attacks_o").innerHTML = button_html;
  console.log("displayDetails_o runs"); //debug
  gameplay();
}
async function gameplay() {
//   document.querySelectorAll(".attack_buttons").forEach((button) => button.addEventListener("click", damager));
playerAttack();
//console.log("player_turn in gameplay: ", player_turn);
  // while (hp > 0 && hp_o > 0) {
    
  //   if (hp_o === 0 || hp === 0) {
  //     break;
  //   }
  //   if(!player_turn)
  //     opponentAttack();
  //   else
  //     playerAttack();
  //   setTimeout(() => console.log("time out done"), 1000);
  // }
  console.log("gameplay runs"); //debug
}

function playerAttack() {

  let buttons = document.querySelectorAll(".attack_buttons").forEach((button) => button.addEventListener("click",()=> {
    damager(event);
    console.log("button clicked");
    attack_audio();
    opponentAttack();
  }
  ));
  console.log("player: ", buttons);
  console.log("playerAttack runs"); //debug
  
}

async function damager(event) {
  const clicked_button = event.target;
  let button_details = clicked_button.className;
  button_details = button_details.split(" ");
  for (let val of attacks) {
    if (val[0] == button_details[1]) {
      hp_o -= val[2];
      updateHP_o(hp_o);
      if (hp_o <= 0) {
        hp_o = 0;
        updateHP_o(hp_o);
        window.location.href = `youwon.html`;
        console.log("damager runs"); //debug
        return;
      }
    }
  }
  btnResolver();
}

function waitForPress() {
  console.log("waitForPress runs"); //debug
  return new Promise((resolve) => (waitForPressResolve = resolve));
}

function btnResolver() {
  if (waitForPressResolve){ 
    waitForPressResolve()
    console.log("btnResolver runs"); //debug
  };
}

async function opponentAttack() {
    player_turn = true;
    let x = Math.floor(Math.random() * attacks_o.length);
    let his_attack = attacks_o[x];

    hp -= his_attack[2];
    attack_audio();
    console.log("hp after attack ", hp);
    updateHP(hp);

    if (hp <= 0) {
      hp = 0;
      updateHP(hp);
      window.location.href = `gameover.html`;
    }
    // let buttons = document
    // .querySelectorAll(".attack_buttons")
    // .forEach((button) => button.removeEventListener("click", damager));
    // console.log(buttons);
    console.log("opponentAttack runs"); //debug
    
}
let current_id = null;

document.addEventListener("DOMContentLoaded", () => {
    const total_pokemons = 100;
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonID);

    if (id<1 || id >total_pokemons) {
        id = 3;
    }

    current_id = id;
    loadPokemon(id);
});

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
  
async function loadPokemon(id) {
    try {
        const[pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json()),
        ]);

        //console.log(pokemon);

        const moveWrap = document.querySelector(".move-wrap");
        moveWrap.innerHTML = "";

        if (current_id === id) {
            displayDetails(pokemon);
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector(".font1 .tagline").textContent = flavorText;
            window.history.pushState({}, "", `./detail.html?id=${id}`);
        }

        return true;
    } catch(error) {
        console.error("error while fetching", error);
        return false;
    }
}

function getEnglishFlavorText(pokemonSpecies) {
    for (let entry of pokemonSpecies.flavor_text_entries) {
      if (entry.language.name === "en") {
        let flavor = entry.flavor_text.replace(/\f/g, " ");
        return flavor;
      }
    }
    return "";
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

    const movesWrap = document.querySelector(".move-wrap");
    abilities.forEach(({ability}) => {
        createAndAppendElement(movesWrap, "p", {
            className: "font1",
            textContent: ability.name,
        });
    });

    const statsWrap = document.querySelector(".stats-wrapper");
    statsWrap.innerHTML = "";

    const statName = {
        hp: "HP",
        attack: "ATK",
        defense: "DEF",
        "special-attack": "SATK",
        "special-defense": "SDEF",
        speed: "SPD",
    };

    console.log(statName);

    stats.forEach(({ stat, base_stat }) => {
        const statDiv = document.createElement("div");
        statDiv.className = "stats";
        statsWrap.appendChild(statDiv);
    
        createAndAppendElement(statDiv, "p", {
          className: "font2 stat",
          textContent: statName[stat.name],
        });
    
        createAndAppendElement(statDiv, "p", {
          className: "font2",
          textContent: String(base_stat).padStart(3, "0"),
        });
    });
} 

document.querySelector(".start").addEventListener("click", function() {
    window.location.href = `battle.html?id=${current_id}`;
});

document.querySelector(".search").addEventListener("click", function() {
    window.location.href = `game.html`;
});
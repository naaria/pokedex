// =========================================================
// Laboratorio 10 — Tu Pokédex, ahora desde la web
// =========================================================

// Logro 1: color de cada badge según el tipo
const coloresTipo = {
  grass: "bg-green-200 text-green-800",
  poison: "bg-purple-200 text-purple-800",
  fire: "bg-red-200 text-red-800",
  water: "bg-blue-200 text-blue-800",
  electric: "bg-yellow-200 text-yellow-800",
  normal: "bg-stone-200 text-stone-800",
  fairy: "bg-pink-200 text-pink-800",
  ghost: "bg-indigo-200 text-indigo-800"
};

const contenedor = document.getElementById("resultado");

function crearTarjeta(pokemon) {
  const { nombre, imagen, tipos } = pokemon;            // destructuring de objeto
  const img = imagen ?? "https://via.placeholder.com/96?text=?";   // ?? : respaldo si falta la imagen
  const [principal = "desconocido"] = tipos ?? [];      // Logro 3: destructuring de array

  // ?. : si a un Pokémon le faltaran los tipos, no se rompe
  const badges = tipos?.map(function (tipo) {
    const color = coloresTipo[tipo] ?? "bg-slate-200 text-slate-700";
    return `<span class="text-xs ${color} px-2 py-1 rounded-full">${tipo}</span>`;
  }).join("") ?? "";

  const articulo = document.createElement("article");
  articulo.className = "bg-white rounded-xl shadow p-4 text-center";
  articulo.innerHTML = `
    <img src="${img}" alt="${nombre}" class="w-24 h-24 mx-auto">
    <h2 class="capitalize font-bold text-slate-800 mt-2">${nombre}</h2>
    <div class="flex gap-1 justify-center mt-2 flex-wrap">${badges}</div>
    <p class="text-xs text-slate-500 mt-2">Tipo principal: ${principal}</p>
  `;
  return articulo;
}

function render(lista) {
  contenedor.innerHTML = "";                 // 1. limpia lo anterior
  lista.forEach(function (pokemon) {
    const tarjeta = crearTarjeta(pokemon);   // 2. crea el nodo
    contenedor.appendChild(tarjeta);         // 3. lo inserta en el DOM
  });
}

// Traduce la estructura de la API a la forma limpia que espera crearTarjeta
function adaptarPokemon(data) {
  return {
    nombre: data.name,
    imagen: data.sprites?.front_default ?? "https://via.placeholder.com/96?text=?",
    tipos:  data.types.map(t => t.type.name)   // [{type:{name:"electric"}}] → ["electric"]
  };
}

const nombres = ["bulbasaur", "charmander", "squirtle", "pikachu", "jigglypuff", "gengar"];
let pokedex = [];   // aquí guardamos la rejilla cargada

const buscador = document.getElementById("buscador");

// Mismo buscador de C09: solo cambia la fuente (antes pokemonLocal, ahora pokedex)
buscador.addEventListener("input", function () {
  const texto = buscador.value.toLowerCase();
  const filtrados = pokedex.filter(p => p.nombre.includes(texto));
  render(filtrados);
});

// Logro 1: spinner animado mientras llegan los datos
contenedor.innerHTML = `
  <div class="col-span-full flex flex-col items-center gap-3 py-8 text-slate-500" role="status">
    <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-yellow-400"></div>
    <p>Cargando…</p>
  </div>
`;

// un fetch por cada nombre → un array de promesas
const promesas = nombres.map(function (nombre) {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`).then(r => r.json());
});

Promise.all(promesas)
  .then(function (datos) {                 // datos = array con los 6 Pokémon crudos
    pokedex = datos.map(adaptarPokemon);   // adapta todos a tu forma limpia
    render(pokedex);
  })
  .catch(function () {
    contenedor.innerHTML = `<p class="col-span-full text-center text-red-600">No se pudo cargar la Pokédex.</p>`;
  });

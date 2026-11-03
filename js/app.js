// =========================================================
// Laboratorio 11 — async/await y búsqueda en la API
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
    tipos:  data.types.map(t => t.type.name),   // [{type:{name:"electric"}}] → ["electric"]
    stats:  data.stats.map(s => ({ nombre: s.stat.name, valor: s.base_stat }))
    // data.stats = [{ base_stat: 35, stat: { name: "hp" } }, ...]
  };
}

let pokedex = [];   // aquí guardamos la rejilla cargada

const buscador = document.getElementById("buscador");
const boton = document.getElementById("btn-buscar");

// Logro 1: spinner animado mientras llegan los datos
contenedor.innerHTML = `
  <div class="col-span-full flex flex-col items-center gap-3 py-8 text-slate-500" role="status">
    <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-yellow-400"></div>
    <p>Cargando…</p>
  </div>
`;

async function obtenerPokemon(idONombre) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idONombre}`);
  return response.json();
}

async function cargarPokedex() {
  const nombres = ["bulbasaur", "charmander", "squirtle", "pikachu", "jigglypuff", "gengar"];
  const datos = await Promise.all(nombres.map(obtenerPokemon));   // varios en paralelo, con await
  pokedex = datos.map(adaptarPokemon);
  render(pokedex);
}

cargarPokedex();

// HU2: buscar y traer un Pokémon de la API
async function buscarPokemon(nombre) {
  const data = await obtenerPokemon(nombre.toLowerCase());   // reusa obtenerPokemon de HU1
  return adaptarPokemon(data);
}

// HU3: suma el Pokémon a la colección, sin duplicar
function capturar(pokemon) {
  if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
    pokedex.push(pokemon);   // hace crecer tu colección
  }
  render(pokedex);           // vuelve la colección completa, ya con el nuevo
  buscador.value = "";
}

// muestra la tarjeta del Pokémon encontrado
function mostrarResultado(pokemon) {
  const tarjeta = crearTarjeta(pokemon);            // la tarjeta de C09 (un nodo)

  // HU4: estadísticas (solo en el resultado de búsqueda)
  const stats = document.createElement("div");
  stats.className = "mt-2 text-left text-xs space-y-1";
  stats.innerHTML = pokemon.stats.map(s => `
    <div class="flex justify-between"><span class="capitalize">${s.nombre}</span><span class="font-semibold">${s.valor}</span></div>
  `).join("");
  tarjeta.appendChild(stats);

  const boton = document.createElement("button");
  boton.textContent = "⚡ Capturar";
  boton.className = "mt-2 w-full bg-yellow-400 font-semibold rounded-lg py-1 hover:bg-yellow-500";
  boton.addEventListener("click", () => capturar(pokemon));
  tarjeta.appendChild(boton);                       // el botón SOLO en el resultado

  contenedor.innerHTML = "";
  contenedor.appendChild(tarjeta);
}

async function mostrarBusqueda(nombre) {
  const pokemon = await buscarPokemon(nombre);
  mostrarResultado(pokemon);
}

boton.addEventListener("click", function () {
  const nombre = buscador.value.trim();
  if (nombre !== "") mostrarBusqueda(nombre);
});

// Buscar también con Enter
buscador.addEventListener("keydown", function (event) {
  if (event.key === "Enter") boton.click();
});

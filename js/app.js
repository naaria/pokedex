// =========================================================
// Laboratorio 12 — Manejo de errores y estados
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

// Logro 2: botón para sacar un Pokémon de la colección
function crearBotonQuitar(pokemon) {
  const boton = document.createElement("button");
  boton.textContent = "Quitar";
  boton.setAttribute("aria-label", `Quitar a ${pokemon.nombre}`);
  boton.className = "mt-2 text-xs text-slate-500 underline hover:text-red-600";
  boton.addEventListener("click", function () {
    pokedex = pokedex.filter(p => p.nombre !== pokemon.nombre);
    render(pokedex);
  });
  return boton;
}

function render(lista) {
  contenedor.innerHTML = "";                 // 1. limpia lo anterior
  lista.forEach(function (pokemon) {
    const tarjeta = crearTarjeta(pokemon);   // 2. crea el nodo
    tarjeta.appendChild(crearBotonQuitar(pokemon));   // Logro 2 (solo en la rejilla)
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
const mensaje = document.getElementById("mensaje");
const spinner = document.getElementById("spinner");

// Logro 1: muestra un error con un botón "Reintentar" que repite la última acción
function mostrarError(texto, reintentar) {
  const boton = document.createElement("button");
  boton.textContent = "Reintentar";
  boton.className = "ml-2 px-3 py-1 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700";
  boton.addEventListener("click", reintentar);
  mensaje.replaceChildren(texto, boton);   // texto + botón dentro de #mensaje
  mensaje.classList.remove("hidden");
}

async function obtenerPokemon(idONombre) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idONombre}`);

  // Logro: "no existe" no es un fallo de la app → devolvemos null (resultado vacío)
  if (response.status === 404) {
    return null;
  }

  // HU2: fetch NO falla por un 404 ni un 500, hay que revisarlo con response.ok
  if (!response.ok) {                                    // 500, 503, etc.
    throw new Error(`La PokeAPI respondió con un error (${response.status}). Intenta de nuevo.`);
  }

  return response.json();
}

// HU3: la carga inicial también puede fallar (sin red al abrir)
async function cargarPokedex() {
  spinner.classList.remove("hidden");
  mensaje.classList.add("hidden");
  try {
    const nombres = ["bulbasaur", "charmander", "squirtle", "pikachu", "jigglypuff", "gengar"];
    const datos = await Promise.all(nombres.map(obtenerPokemon));   // varios en paralelo, con await
    pokedex = datos.map(adaptarPokemon);
    render(pokedex);
  } catch (error) {
    mostrarError("No se pudo cargar la Pokédex.", cargarPokedex);
  } finally {
    spinner.classList.add("hidden");   // corre SIEMPRE: con éxito o con error
  }
}

cargarPokedex();

// HU2: buscar y traer un Pokémon de la API
// Logro 1: la API también acepta números (/pokemon/25), así que sirve el mismo código
async function buscarPokemon(nombre) {
  const data = await obtenerPokemon(nombre.toLowerCase());   // reusa obtenerPokemon de HU1
  if (data === null) return null;                            // no existe: no hay nada que adaptar
  return adaptarPokemon(data);
}

// Aviso neutro (no es un error): la búsqueda funcionó, pero no hay resultado
function mostrarNoEncontrado(nombre) {
  const aviso = document.createElement("div");
  aviso.className = "col-span-full bg-white rounded-xl shadow p-6 text-center text-slate-600";
  const titulo = document.createElement("p");
  titulo.className = "font-semibold text-slate-800";
  titulo.textContent = `🔍 No se encontró "${nombre}"`;   // textContent: lo escrito no se interpreta como HTML
  const ayuda = document.createElement("p");
  ayuda.className = "text-sm mt-1";
  ayuda.textContent = "Revisa cómo se escribe o prueba con su número (ej. 25).";
  aviso.append(titulo, ayuda);
  contenedor.replaceChildren(aviso);
}

// HU3: suma el Pokémon a la colección, sin duplicar
function capturar(pokemon) {
  if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
    pokedex.push(pokemon);   // hace crecer tu colección
  }
  render(pokedex);           // vuelve la colección completa, ya con el nuevo
  buscador.value = "";
}

// ---------- HU-A (proyecto): estadísticas con barras ----------
const nombresStats = {
  "hp": "PS",
  "attack": "Ataque",
  "defense": "Defensa",
  "special-attack": "At. especial",
  "special-defense": "Def. especial",
  "speed": "Velocidad"
};
const STAT_MAXIMA = 255;   // el valor base más alto que existe en los juegos

// Color según qué tan alta es la estadística
function colorBarra(valor) {
  if (valor < 50) return "bg-red-400";
  if (valor < 90) return "bg-yellow-400";
  return "bg-green-500";
}

function crearBarrasStats(stats) {
  const contenedorStats = document.createElement("div");
  contenedorStats.className = "mt-3 text-left text-xs space-y-1.5";

  const filas = stats.map(function ({ nombre, valor }) {   // destructuring en el parámetro
    const ancho = Math.round((valor / STAT_MAXIMA) * 100);   // % de la barra
    const etiqueta = nombresStats[nombre] ?? nombre;
    return `
      <div>
        <div class="flex justify-between"><span>${etiqueta}</span><span class="font-semibold">${valor}</span></div>
        <div class="h-2 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
          <div class="h-2 rounded-full ${colorBarra(valor)}" style="width: ${ancho}%"></div>
        </div>
      </div>`;
  });

  const total = stats.reduce((suma, s) => suma + s.valor, 0);
  contenedorStats.innerHTML = filas.join("") + `
    <div class="flex justify-between border-t border-slate-200 pt-1.5 font-semibold">
      <span>Total</span><span>${total}</span>
    </div>`;
  return contenedorStats;
}

// muestra la tarjeta del Pokémon encontrado
function mostrarResultado(pokemon) {
  const tarjeta = crearTarjeta(pokemon);            // la tarjeta de C09 (un nodo)

  // HU4 (C11) + HU-A del proyecto: estadísticas con barras (solo en el resultado de búsqueda)
  tarjeta.appendChild(crearBarrasStats(pokemon.stats));

  const boton = document.createElement("button");
  boton.textContent = "⚡ Capturar";
  boton.className = "mt-2 w-full bg-yellow-400 font-semibold rounded-lg py-1 hover:bg-yellow-500";
  boton.addEventListener("click", () => capturar(pokemon));
  tarjeta.appendChild(boton);                       // el botón SOLO en el resultado

  contenedor.innerHTML = "";
  contenedor.appendChild(tarjeta);
}

// HU1: si la búsqueda falla, se muestra un mensaje y la app sigue viva
async function mostrarBusqueda(nombre) {
  spinner.classList.remove("hidden");   // ⏳ muestra carga
  mensaje.classList.add("hidden");      // limpia errores anteriores

  try {
    const pokemon = await buscarPokemon(nombre);
    if (pokemon === null) {
      mostrarNoEncontrado(nombre);   // "no hay nada" → aviso neutro en #resultado
    } else {
      mostrarResultado(pokemon);     // muestra la tarjeta con el botón Capturar (de C11)
    }
  } catch (error) {
    // "algo se rompió" (sin red, error del servidor) → mensaje de error en rojo
    const texto = error.message === "Failed to fetch"
      ? "Algo salió mal. Revisa tu conexión."
      : error.message;
    mostrarError(texto, () => mostrarBusqueda(nombre));   // repite la misma búsqueda
  } finally {
    spinner.classList.add("hidden");      // ✅ oculta carga SIEMPRE
  }
}

boton.addEventListener("click", function () {
  const nombre = buscador.value.trim();
  if (nombre !== "") mostrarBusqueda(nombre);
});

// Buscar también con Enter
buscador.addEventListener("keydown", function (event) {
  if (event.key === "Enter") boton.click();
});

// HU5: paginación con parámetros de consulta
let offset = 0;   // desde qué Pokémon empezamos

async function cargarMas() {
  spinner.classList.remove("hidden");
  mensaje.classList.add("hidden");
  try {
    // ?limit (cuántos) y ?offset (desde dónde) = parámetros de consulta
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=${offset}`);
    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar más Pokémon.");
    }
    const lista = await respuesta.json();   // { results: [{ name, url }, ...] }

    // cada item trae solo name + url → pide el detalle de cada uno en paralelo
    const datos = await Promise.all(
      lista.results.map(item => fetch(item.url).then(r => r.json()))
    );

    datos.map(adaptarPokemon).forEach(function (pokemon) {
      if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
        pokedex.push(pokemon);   // sin duplicar
      }
    });

    offset += 12;     // la próxima vez, la siguiente página (solo si todo salió bien)
    render(pokedex);
  } catch (error) {
    mostrarError("No se pudieron cargar más Pokémon. Revisa tu conexión.", cargarMas);
  } finally {
    spinner.classList.add("hidden");
  }
}

document.getElementById("cargar-mas").addEventListener("click", cargarMas);

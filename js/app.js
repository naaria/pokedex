// =========================================================
// Laboratorio 12 — Manejo de errores y estados
// =========================================================

// Logro 1: color de cada badge según el tipo (paleta clásica de los juegos)
const coloresTipo = {
  fighting: "#C03028", fire: "#F08030", electric: "#F8D030",
  bug: "#A8B820", grass: "#78C850", ice: "#98D8D8",
  water: "#6890F0", dragon: "#7038F8", ghost: "#705898",
  poison: "#A040A0", psychic: "#F85888", flying: "#A890F0",
  steel: "#B8B8D0", normal: "#A8A878", ground: "#E0C068",
  rock: "#B8A038", dark: "#705848", fairy: "#EE99AC"
};

// Abreviaturas como en la pantalla de la Pokédex
const abreviaturas = { fighting: "fight", electric: "electr", psychic: "psychc" };

function badgeTipo(tipo) {
  const color = coloresTipo[tipo] ?? "#68A090";
  const texto = abreviaturas[tipo] ?? tipo;
  return `<span class="tipo" style="--color: ${color}">${texto}</span>`;
}

const contenedor = document.getElementById("resultado");

function crearTarjeta(pokemon) {
  const { nombre, imagen, tipos, numero } = pokemon;    // destructuring de objeto
  const img = imagen ?? "https://via.placeholder.com/96?text=?";   // ?? : respaldo si falta la imagen
  const [principal = "desconocido"] = tipos ?? [];      // Logro 3: destructuring de array

  // ?. : si a un Pokémon le faltaran los tipos, no se rompe
  const badges = tipos?.map(badgeTipo).join("") ?? "";

  // Número con 3 cifras como en la Pokédex: 25 → "025" (si no hay número, no se muestra)
  const numeroDex = numero ? `Nº${String(numero).padStart(3, "0")}` : "";

  const articulo = document.createElement("article");
  articulo.className = "tarjeta-dex text-center";
  articulo.innerHTML = `
    <div class="flex items-center gap-2 px-3 py-1.5 bg-[#f8f0b0] border-b-4 border-[#d8c078] text-left">
      <span class="inline-block w-3.5 h-3.5 rounded-full border-2 border-zinc-700 bg-[linear-gradient(180deg,#e3350d_0_45%,#27272a_45%_55%,#fff_55%)]" aria-hidden="true"></span>
      <span class="text-xl text-zinc-600">${numeroDex}</span>
      <h2 class="pixel-titulo uppercase text-[0.7rem] sm:text-sm text-zinc-800 truncate">${nombre}</h2>
    </div>
    <div class="p-3">
      <div class="marco-sprite mx-auto w-28 h-28 grid place-items-center">
        <img src="${img}" alt="${nombre}" class="pixelado w-24 h-24">
      </div>
      <div class="flex gap-1.5 justify-center mt-3 flex-wrap">${badges}</div>
      <p class="text-lg text-zinc-500 mt-1 uppercase">Tipo principal: ${principal}</p>
    </div>
  `;
  return articulo;
}

// Logro 2: botón para sacar un Pokémon de la colección
function crearBotonQuitar(pokemon) {
  const boton = document.createElement("button");
  boton.textContent = "Quitar";
  boton.setAttribute("aria-label", `Quitar a ${pokemon.nombre}`);
  boton.className = "mb-3 px-2 text-lg text-zinc-500 hover:text-[#dc0a2d]";
  boton.textContent = "✕ Quitar";
  boton.addEventListener("click", function () {
    pokedex = pokedex.filter(p => p.nombre !== pokemon.nombre);
    mostrarColeccion();
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
    numero: data.id,   // nº de la Pokédex (para la cabecera "Nº025")
    imagen: data.sprites?.front_default ?? "https://via.placeholder.com/96?text=?",
    tipos:  data.types.map(t => t.type.name),   // [{type:{name:"electric"}}] → ["electric"]
    stats:  data.stats.map(s => ({ nombre: s.stat.name, valor: s.base_stat }))
    // data.stats = [{ base_stat: 35, stat: { name: "hp" } }, ...]
  };
}

let pokedex = [];   // aquí guardamos la rejilla cargada

// ---------- HU-B (proyecto): filtrar la colección por tipo ----------
let tipoActivo = "todos";
const filtros = document.getElementById("filtros");

function crearBotonFiltro(tipo, cantidad) {
  const activo = tipo === tipoActivo;
  const color = tipo === "todos" ? "#52525b" : (coloresTipo[tipo] ?? "#68A090");
  const boton = document.createElement("button");
  boton.textContent = `${tipo === "todos" ? "Todos" : (abreviaturas[tipo] ?? tipo)} ${cantidad}`;
  boton.setAttribute("aria-pressed", String(activo));   // lectores de pantalla: cuál está activo
  boton.className = `tipo ${activo ? "" : "opacity-60 hover:opacity-100"}`;
  boton.style.setProperty("--color", color);
  boton.addEventListener("click", function () {
    tipoActivo = tipo;
    mostrarColeccion();
  });
  return boton;
}

// Dibuja los botones con los tipos que hay HOY en la colección
function renderFiltros() {
  const tipos = [...new Set(pokedex.flatMap(p => p.tipos))].sort();   // tipos únicos (Set) y ordenados
  filtros.innerHTML = "";
  filtros.appendChild(crearBotonFiltro("todos", pokedex.length));
  tipos.forEach(function (tipo) {
    const cantidad = pokedex.filter(p => p.tipos.includes(tipo)).length;
    filtros.appendChild(crearBotonFiltro(tipo, cantidad));
  });
}

// Muestra la colección aplicando el filtro activo (reusa render de C09 sin cambiarlo)
function mostrarColeccion() {
  const hayTipo = pokedex.some(p => p.tipos.includes(tipoActivo));
  if (tipoActivo !== "todos" && !hayTipo) {
    tipoActivo = "todos";   // si quitaste el último de ese tipo, vuelve a "Todos"
  }
  renderFiltros();

  const lista = tipoActivo === "todos"
    ? pokedex
    : pokedex.filter(p => p.tipos.includes(tipoActivo));
  render(lista);
}

const buscador = document.getElementById("buscador");
const boton = document.getElementById("btn-buscar");
const mensaje = document.getElementById("mensaje");
const spinner = document.getElementById("spinner");

// Logro 1: muestra un error con un botón "Reintentar" que repite la última acción
function mostrarError(texto, reintentar) {
  const boton = document.createElement("button");
  boton.textContent = "Reintentar";
  boton.className = "boton-ds ml-3 px-3 py-1 text-sm bg-[#fecb00] text-zinc-800 hover:bg-[#ffd83d]";
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
    mostrarColeccion();
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
  aviso.className = "col-span-full caja-dialogo max-w-xl w-full mx-auto px-5 py-4 text-center";
  const titulo = document.createElement("p");
  titulo.className = "pixel-titulo text-base font-bold";
  titulo.textContent = `🔍 No se encontró "${nombre}"`;   // textContent: lo escrito no se interpreta como HTML
  const ayuda = document.createElement("p");
  ayuda.className = "mt-1 text-zinc-600";
  ayuda.textContent = "Revisa cómo se escribe o prueba con su número (ej. 25).";
  aviso.append(titulo, ayuda);
  contenedor.replaceChildren(aviso);
}

// HU3: suma el Pokémon a la colección, sin duplicar
function capturar(pokemon) {
  if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
    pokedex.push(pokemon);   // hace crecer tu colección
  }
  mostrarColeccion();           // vuelve la colección completa, ya con el nuevo
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
  if (valor < 50) return "bg-[#f05030]";
  if (valor < 90) return "bg-[#f8c030]";
  return "bg-[#48b048]";
}

function crearBarrasStats(stats) {
  const contenedorStats = document.createElement("div");
  contenedorStats.className = "caja-dialogo mx-3 mt-1 mb-4 px-3 py-2 text-left text-xl leading-tight space-y-1";

  const filas = stats.map(function ({ nombre, valor }) {   // destructuring en el parámetro
    const ancho = Math.round((valor / STAT_MAXIMA) * 100);   // % de la barra
    const etiqueta = nombresStats[nombre] ?? nombre;
    return `
      <div>
        <div class="flex justify-between uppercase tracking-wide"><span>${etiqueta}</span><span class="font-bold">${valor}</span></div>
        <div class="h-2.5 bg-zinc-200 border-2 border-zinc-700 rounded-sm overflow-hidden" aria-hidden="true">
          <div class="h-full ${colorBarra(valor)}" style="width: ${ancho}%"></div>
        </div>
      </div>`;
  });

  const total = stats.reduce((suma, s) => suma + s.valor, 0);
  contenedorStats.innerHTML = filas.join("") + `
    <div class="flex justify-between border-t-2 border-dashed border-zinc-300 pt-1.5 font-bold uppercase tracking-wide">
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
  boton.className = "boton-ds mb-4 w-[calc(100%-1.5rem)] py-2 bg-[#fecb00] text-zinc-800 hover:bg-[#ffd83d]";
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
    mostrarColeccion();
  } catch (error) {
    mostrarError("No se pudieron cargar más Pokémon. Revisa tu conexión.", cargarMas);
  } finally {
    spinner.classList.add("hidden");
  }
}

document.getElementById("cargar-mas").addEventListener("click", cargarMas);

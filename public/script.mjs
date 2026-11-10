/* =========================================================
   Buscador de sinónimos y antónimos
   - Free Dictionary API (no pide clave ni registro)
   ========================================================= */

// URL pública de la API y ruta de nuestro backend (server.js)
const API_DIRECTA = "https://freedictionaryapi.com/api/v1/entries/es/";
const API_BACKEND = "/api/palabra/";


// La API devuelve la categoría gramatical en inglés
const CATEGORIAS = {
    noun: "sustantivo",
    verb: "verbo",
    adjective: "adjetivo",
    adverb: "adverbio",
    pronoun: "pronombre",
    preposition: "preposición",
    conjunction: "conjunción",
    interjection: "interjección",
    article: "artículo",
    determiner: "determinante",
    phrase: "locución"
};


// ---------- Elementos del DOM ----------
const formulario = document.querySelector("#formulario");
const palabra = document.querySelector("#palabra");
const buscar = document.querySelector("#buscar");
const spinner = document.querySelector("#spinner");
const textoBoton = document.querySelector("#textoBoton");
const mensaje = document.querySelector("#mensaje");

const resultado = document.querySelector("#resultado");
const nombre = document.querySelector("#nombre");
const definicion = document.querySelector("#definicion");
const sinonimos = document.querySelector("#sinonimos");
const antonimos = document.querySelector("#antonimos");
const contadorSinonimos = document.querySelector("#contadorSinonimos");
const contadorAntonimos = document.querySelector("#contadorAntonimos");


// ---------- Mensajes integrados (en vez de alert) ----------
let temporizadorMensaje;

function mostrarMensaje(texto, tipo) {
    clearTimeout(temporizadorMensaje);

    if (!texto) {
        mensaje.replaceChildren();
        mensaje.className = "mt-3";
        return;
    }

    mensaje.className = "mt-3 alert alert-" + tipo + " mb-0";
    mensaje.textContent = texto;

    // Los mensajes de éxito desaparecen solos
    if (tipo === "success") {
        temporizadorMensaje = setTimeout(function () {
            mostrarMensaje("");
        }, 3000);
    }
}


// ---------- Búsqueda ----------
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    buscarPalabra(palabra.value);
});

let buscando = false;

async function buscarPalabra(textoOriginal) {

    const texto = textoOriginal.trim().toLowerCase();

    if (texto === "") {
        palabra.classList.add("is-invalid");
        mostrarMensaje("Por favor, escribe una palabra.", "warning");
        resultado.hidden = true;
        palabra.focus();
        return;
    }

    // Evita búsquedas repetidas si el usuario hace clic varias veces
    if (buscando) {
        return;
    }

    palabra.classList.remove("is-invalid");
    palabra.value = texto;
    ponerCargando(true);
    mostrarMensaje("Buscando \"" + texto + "\"...", "info");

    try {

        const datos = await obtenerDatos(texto);

        mostrarResultado(datos);
        mostrarMensaje("");

    } catch (error) {

        resultado.hidden = true;
        mostrarMensaje(error.message, "danger");

    } finally {

        ponerCargando(false);

    }
}

function ponerCargando(cargando) {
    buscando = cargando;
    buscar.disabled = cargando;
    spinner.hidden = !cargando;
    textoBoton.textContent = cargando ? "Buscando" : "Buscar";
    formulario.setAttribute("aria-busy", String(cargando));
}


// Pide los datos: primero a la caché de la pestaña, luego a
// nuestro backend (si existe) y si no, directo a la API pública.
async function obtenerDatos(texto) {

    let datos = null;

    if (location.protocol.startsWith("http")) {
        datos = await pedirJSON(API_BACKEND + encodeURIComponent(texto), true);
    }

    if (datos === null) {
        datos = await pedirJSON(API_DIRECTA + encodeURIComponent(texto), false);
    }

    return datos;
}


// Devuelve el JSON, lanza un error con mensaje claro, o devuelve
// null si es el backend y no está disponible (sitio estático).
async function pedirJSON(url, esBackend) {

    const control = new AbortController();
    const limite = setTimeout(function () {
        control.abort();
    }, 10000);

    let respuesta;

    try {
        respuesta = await fetch(url, { signal: control.signal });
    } catch (error) {
        if (esBackend) {
            return null;
        }
        if (error.name === "AbortError") {
            throw new Error("La búsqueda tardó demasiado. Inténtalo de nuevo.");
        }
        throw new Error("No hay conexión con el diccionario. Revisa tu internet.");
    } finally {
        clearTimeout(limite);
    }

    const tipo = respuesta.headers.get("content-type") || "";

    // En Netlify o con Live Server no hay backend: /api/... no devuelve JSON
    // Si el backend falla (error 5xx), se intenta directo con la API
    if (esBackend && (!tipo.includes("json") || respuesta.status >= 500)) {
        return null;
    }

    if (respuesta.status === 404) {
        throw new Error("No se encontró esa palabra. Revisa la ortografía.");
    }

    if (!respuesta.ok) {
        throw new Error("El diccionario no respondió (error " + respuesta.status + ").");
    }

    return respuesta.json();
}


// ---------- Mostrar el resultado ----------
function mostrarResultado(datos) {

    resultado.hidden = false;

    nombre.textContent = datos.word;

    const listaSinonimos = [];
    const listaAntonimos = [];
    let primeraDefinicion = "";
    let categoria = "";

    function agregarSinRepetir(lista, elementos) {
        if (!Array.isArray(elementos)) {
            return;
        }
        elementos.forEach(function (elemento) {
            if (elemento && !lista.includes(elemento)) {
                lista.push(elemento);
            }
        });
    }

    // Los sentidos pueden tener subsentidos: se recorren todos
    function recorrerSentidos(sentidos) {
        if (!Array.isArray(sentidos)) {
            return;
        }
        sentidos.forEach(function (sentido) {
            if (!primeraDefinicion && sentido.definition) {
                primeraDefinicion = sentido.definition;
            }
            agregarSinRepetir(listaSinonimos, sentido.synonyms);
            agregarSinRepetir(listaAntonimos, sentido.antonyms);
            recorrerSentidos(sentido.subsenses);
        });
    }

    (datos.entries || []).forEach(function (entrada) {
        if (!categoria && entrada.partOfSpeech) {
            categoria = entrada.partOfSpeech;
        }
        agregarSinRepetir(listaSinonimos, entrada.synonyms);
        agregarSinRepetir(listaAntonimos, entrada.antonyms);
        recorrerSentidos(entrada.senses);
    });

    const categoriaES = CATEGORIAS[categoria] || categoria;

    definicion.textContent = primeraDefinicion
        ? (categoriaES ? "(" + categoriaES + ") " : "") + primeraDefinicion
        : "";
    definicion.hidden = !primeraDefinicion;

    contadorSinonimos.textContent = listaSinonimos.length;
    contadorAntonimos.textContent = listaAntonimos.length;

    mostrarLista(sinonimos, listaSinonimos, "No hay sinónimos disponibles.", "btn-outline-primary");
    mostrarLista(antonimos, listaAntonimos, "No hay antónimos disponibles.", "btn-antonimo");

}


// Cada palabra es un botón: al pulsarlo se busca esa palabra
function mostrarLista(listaHTML, lista, mensajeVacio, estilo) {

    listaHTML.replaceChildren();

    if (lista.length === 0) {
        const li = document.createElement("li");
        li.className = "text-body-secondary";
        li.textContent = mensajeVacio;
        listaHTML.appendChild(li);
        return;
    }

    lista.forEach(function (elemento) {
        listaHTML.appendChild(crearChip(elemento, estilo));
    });
}

function crearChip(texto, estilo) {
    const li = document.createElement("li");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-sm chip " + estilo;
    boton.textContent = texto;
    boton.setAttribute("aria-label", "Buscar " + texto);
    boton.addEventListener("click", function () {
        buscarPalabra(texto);
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    li.appendChild(boton);
    return li;
}


// ---------- Al cargar la página ----------

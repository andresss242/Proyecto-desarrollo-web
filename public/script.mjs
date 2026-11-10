
const API_DIRECTA = "https://freedictionaryapi.com/api/v1/entries/es/";
const API_BACKEND = "/api/palabra/";

const CLAVES = {
    modo: "modo",                       
    ultima: "ultimaPalabra",            
    contador: "busquedasSesion",        
    cache: "cache:"                     
};


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


const html = document.documentElement;
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

const botonModo = document.querySelector("#modo");
const olvidar = document.querySelector("#olvidar");
const contadorSesion = document.querySelector("#contadorSesion");




function leer(almacen, clave, porDefecto) {
    try {
        const texto = almacen.getItem(clave);
        return texto === null ? porDefecto : JSON.parse(texto);
    } catch (error) {
        return porDefecto;
    }
}

function guardar(almacen, clave, valor) {
    try {
        almacen.setItem(clave, JSON.stringify(valor));
    } catch (error) {
        console.log("No se pudo guardar", clave);
    }
}



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


    if (tipo === "success") {
        temporizadorMensaje = setTimeout(function () {
            mostrarMensaje("");
        }, 3000);
    }
}



function aplicarTema(modo) {
    const oscuro = modo === "oscuro";
    html.dataset.bsTheme = oscuro ? "dark" : "light";
    botonModo.textContent = oscuro ? "Tema claro" : "Tema oscuro";
    botonModo.setAttribute("aria-pressed", String(oscuro));
}

botonModo.addEventListener("click", function () {
    const nuevo = html.dataset.bsTheme === "dark" ? "claro" : "oscuro";
    aplicarTema(nuevo);
    guardar(localStorage, CLAVES.modo, nuevo);
    mostrarMensaje("Tema " + nuevo + " guardado.", "success");
});


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
        guardar(sessionStorage, CLAVES.ultima, texto);
        sumarBusquedaSesion();
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


async function obtenerDatos(texto) {

    const enCache = leer(sessionStorage, CLAVES.cache + texto, null);
    if (enCache) {
        return enCache;
    }

    let datos = null;

    if (location.protocol.startsWith("http")) {
        datos = await pedirJSON(API_BACKEND + encodeURIComponent(texto), true);
    }

    if (datos === null) {
        datos = await pedirJSON(API_DIRECTA + encodeURIComponent(texto), false);
    }

    guardar(sessionStorage, CLAVES.cache + texto, datos);
    return datos;
}



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


function sumarBusquedaSesion() {
    const total = Number(leer(sessionStorage, CLAVES.contador, 0)) + 1;
    guardar(sessionStorage, CLAVES.contador, total);
    pintarContador();
}

function pintarContador() {
    const total = Number(leer(sessionStorage, CLAVES.contador, 0));
    contadorSesion.textContent = total > 0
        ? "Búsquedas en esta pestaña: " + total + "."
        : "";
}


let confirmando = false;
let temporizadorOlvidar;

olvidar.addEventListener("click", function () {

    if (!confirmando) {
        confirmando = true;
        olvidar.textContent = "¿Seguro? Pulsa de nuevo para borrar";
        temporizadorOlvidar = setTimeout(reiniciarBotonOlvidar, 4000);
        return;
    }

    clearTimeout(temporizadorOlvidar);
    reiniciarBotonOlvidar();

    try {
        Object.values(CLAVES).forEach(function (clave) {
            localStorage.removeItem(clave);
        });
        sessionStorage.clear();
    } catch (error) {
    }

    aplicarTema("claro");
    resultado.hidden = true;
    palabra.value = "";
    pintarContador();
    mostrarMensaje("Se borraron todos los datos guardados en este navegador.", "success");
});

function reiniciarBotonOlvidar() {
    confirmando = false;
    olvidar.textContent = "Olvidar mis datos";
}


aplicarTema(leer(localStorage, CLAVES.modo, "claro"));
pintarContador();

const ultima = leer(sessionStorage, CLAVES.ultima, null);
if (ultima) {
    const datosGuardados = leer(sessionStorage, CLAVES.cache + ultima, null);
    if (datosGuardados) {
        palabra.value = ultima;
        mostrarResultado(datosGuardados);
    }
}

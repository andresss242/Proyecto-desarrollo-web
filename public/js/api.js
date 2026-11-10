import { API_DIRECTA, API_BACKEND, TIEMPO_LIMITE } from "./config.js";
import { leerCache, guardarCache } from "./almacenamiento.js";

export async function obtenerDatos(texto) {

    const enCache = leerCache(texto);
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

    guardarCache(texto, datos);
    return datos;
}

async function pedirJSON(url, esBackend) {

    const control = new AbortController();
    const limite = setTimeout(function () {
        control.abort();
    }, TIEMPO_LIMITE);

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

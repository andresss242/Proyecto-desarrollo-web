import { API_URL, TIEMPO_LIMITE } from "../config.js";
import { obtenerDeCache, guardarEnCache } from "./cache.js";

export class ErrorDiccionario extends Error {
    constructor(mensaje, estado) {
        super(mensaje);
        this.estado = estado;
    }
}

export async function consultarPalabra(texto) {

    const enCache = obtenerDeCache(texto);
    if (enCache) {
        return enCache;
    }

    let respuesta;

    try {
        respuesta = await fetch(API_URL + encodeURIComponent(texto), {
            signal: AbortSignal.timeout(TIEMPO_LIMITE)
        });
    } catch (error) {
        console.error("Error consultando la API:", error.message);
        throw new ErrorDiccionario("No se pudo consultar el diccionario.", 502);
    }

    if (respuesta.status === 404) {
        throw new ErrorDiccionario("No se encontró esa palabra.", 404);
    }

    if (!respuesta.ok) {
        throw new ErrorDiccionario("El diccionario no respondió.", 502);
    }

    const datos = await respuesta.json();
    guardarEnCache(texto, datos);
    return datos;
}

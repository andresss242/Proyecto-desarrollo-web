import { DURACION_CACHE } from "../config.js";

const cache = new Map();

export function obtenerDeCache(clave) {
    const guardado = cache.get(clave);
    if (guardado && Date.now() - guardado.hora < DURACION_CACHE) {
        return guardado.datos;
    }
    return null;
}

export function guardarEnCache(clave, datos) {
    cache.set(clave, { datos, hora: Date.now() });
}

export function tamanoCache() {
    return cache.size;
}

import { CLAVES } from "./config.js";

export function leer(almacen, clave, porDefecto) {
    try {
        const texto = almacen.getItem(clave);
        return texto === null ? porDefecto : JSON.parse(texto);
    } catch (error) {
        return porDefecto;
    }
}

export function guardar(almacen, clave, valor) {
    try {
        almacen.setItem(clave, JSON.stringify(valor));
    } catch (error) {
        console.log("No se pudo guardar", clave);
    }
}

export function leerCache(palabra) {
    return leer(sessionStorage, CLAVES.cache + palabra, null);
}

export function guardarCache(palabra, datos) {
    guardar(sessionStorage, CLAVES.cache + palabra, datos);
}

export function leerUltima() {
    return leer(sessionStorage, CLAVES.ultima, null);
}

export function guardarUltima(palabra) {
    guardar(sessionStorage, CLAVES.ultima, palabra);
}

export function leerContador() {
    return Number(leer(sessionStorage, CLAVES.contador, 0));
}

export function sumarContador() {
    const total = leerContador() + 1;
    guardar(sessionStorage, CLAVES.contador, total);
    return total;
}

export function borrarTodo() {
    try {
        Object.values(CLAVES).forEach(function (clave) {
            localStorage.removeItem(clave);
        });
        sessionStorage.clear();
    } catch (error) {
    }
}

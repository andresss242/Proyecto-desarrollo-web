import { CLAVES } from "./config.js";
import { leer, guardar } from "./almacenamiento.js";
import { mostrarMensaje } from "./interfaz.js";

const html = document.documentElement;
const botonModo = document.querySelector("#modo");

export function aplicarTema(modo) {
    const oscuro = modo === "oscuro";
    html.dataset.bsTheme = oscuro ? "dark" : "light";
    botonModo.textContent = oscuro ? "Tema claro" : "Tema oscuro";
    botonModo.setAttribute("aria-pressed", String(oscuro));
}

export function iniciarTema() {
    aplicarTema(leer(localStorage, CLAVES.modo, "claro"));

    botonModo.addEventListener("click", function () {
        const nuevo = html.dataset.bsTheme === "dark" ? "claro" : "oscuro";
        aplicarTema(nuevo);
        guardar(localStorage, CLAVES.modo, nuevo);
        mostrarMensaje("Tema " + nuevo + " guardado.", "success");
    });
}

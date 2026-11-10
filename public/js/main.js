import { obtenerDatos } from "./api.js";
import { procesarDatos } from "./procesar.js";
import { leerCache, leerUltima, guardarUltima, leerContador, sumarContador } from "./almacenamiento.js";
import {
    elementos,
    mostrarMensaje,
    ponerCargando,
    marcarCampoVacio,
    limpiarCampo,
    ocultarResultado,
    mostrarResultado,
    pintarContador
} from "./interfaz.js";
import { iniciarTema } from "./tema.js";
import { iniciarPrivacidad } from "./privacidad.js";

let buscando = false;

async function buscarPalabra(textoOriginal) {

    const texto = textoOriginal.trim().toLowerCase();

    if (texto === "") {
        marcarCampoVacio();
        mostrarMensaje("Por favor, escribe una palabra.", "warning");
        return;
    }

    if (buscando) {
        return;
    }

    buscando = true;
    limpiarCampo();
    elementos.palabra.value = texto;
    ponerCargando(true);
    mostrarMensaje("Buscando \"" + texto + "\"...", "info");

    try {

        const datos = await obtenerDatos(texto);

        mostrarResultado(procesarDatos(datos), buscarPalabra);
        guardarUltima(texto);
        pintarContador(sumarContador());
        mostrarMensaje("");

    } catch (error) {

        ocultarResultado();
        mostrarMensaje(error.message, "danger");

    } finally {

        buscando = false;
        ponerCargando(false);

    }
}

function recuperarUltimaBusqueda() {
    const ultima = leerUltima();
    if (!ultima) {
        return;
    }
    const datos = leerCache(ultima);
    if (datos) {
        elementos.palabra.value = ultima;
        mostrarResultado(procesarDatos(datos), buscarPalabra);
    }
}

elementos.formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    buscarPalabra(elementos.palabra.value);
});

iniciarTema();
iniciarPrivacidad();
pintarContador(leerContador());
recuperarUltimaBusqueda();

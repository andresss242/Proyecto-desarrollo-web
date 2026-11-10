import { borrarTodo } from "./almacenamiento.js";
import { aplicarTema } from "./tema.js";
import { elementos, mostrarMensaje, ocultarResultado, pintarContador } from "./interfaz.js";

const olvidar = document.querySelector("#olvidar");

let confirmando = false;
let temporizadorOlvidar;

function reiniciarBoton() {
    confirmando = false;
    olvidar.textContent = "Olvidar mis datos";
}

export function iniciarPrivacidad() {

    olvidar.addEventListener("click", function () {

        if (!confirmando) {
            confirmando = true;
            olvidar.textContent = "¿Seguro? Pulsa de nuevo para borrar";
            temporizadorOlvidar = setTimeout(reiniciarBoton, 4000);
            return;
        }

        clearTimeout(temporizadorOlvidar);
        reiniciarBoton();

        borrarTodo();
        aplicarTema("claro");
        ocultarResultado();
        elementos.palabra.value = "";
        pintarContador(0);
        mostrarMensaje("Se borraron todos los datos guardados en este navegador.", "success");
    });
}

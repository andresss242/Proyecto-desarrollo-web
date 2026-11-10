export const elementos = {
    formulario: document.querySelector("#formulario"),
    palabra: document.querySelector("#palabra"),
    buscar: document.querySelector("#buscar"),
    spinner: document.querySelector("#spinner"),
    textoBoton: document.querySelector("#textoBoton"),
    mensaje: document.querySelector("#mensaje"),
    resultado: document.querySelector("#resultado"),
    nombre: document.querySelector("#nombre"),
    definicion: document.querySelector("#definicion"),
    sinonimos: document.querySelector("#sinonimos"),
    antonimos: document.querySelector("#antonimos"),
    contadorSinonimos: document.querySelector("#contadorSinonimos"),
    contadorAntonimos: document.querySelector("#contadorAntonimos"),
    contadorSesion: document.querySelector("#contadorSesion")
};

let temporizadorMensaje;

export function mostrarMensaje(texto, tipo) {
    clearTimeout(temporizadorMensaje);

    if (!texto) {
        elementos.mensaje.replaceChildren();
        elementos.mensaje.className = "mt-3";
        return;
    }

    elementos.mensaje.className = "mt-3 alert alert-" + tipo + " mb-0";
    elementos.mensaje.textContent = texto;

    if (tipo === "success") {
        temporizadorMensaje = setTimeout(function () {
            mostrarMensaje("");
        }, 3000);
    }
}

export function ponerCargando(cargando) {
    elementos.buscar.disabled = cargando;
    elementos.spinner.hidden = !cargando;
    elementos.textoBoton.textContent = cargando ? "Buscando" : "Buscar";
    elementos.formulario.setAttribute("aria-busy", String(cargando));
}

export function marcarCampoVacio() {
    elementos.palabra.classList.add("is-invalid");
    elementos.resultado.hidden = true;
    elementos.palabra.focus();
}

export function limpiarCampo() {
    elementos.palabra.classList.remove("is-invalid");
}

export function ocultarResultado() {
    elementos.resultado.hidden = true;
}

export function mostrarResultado(info, alElegirPalabra) {

    elementos.resultado.hidden = false;
    elementos.nombre.textContent = info.palabra;

    elementos.definicion.textContent = info.definicion
        ? (info.categoria ? "(" + info.categoria + ") " : "") + info.definicion
        : "";
    elementos.definicion.hidden = !info.definicion;

    elementos.contadorSinonimos.textContent = info.sinonimos.length;
    elementos.contadorAntonimos.textContent = info.antonimos.length;

    mostrarLista(elementos.sinonimos, info.sinonimos, "No hay sinónimos disponibles.", "btn-outline-primary", alElegirPalabra);
    mostrarLista(elementos.antonimos, info.antonimos, "No hay antónimos disponibles.", "btn-antonimo", alElegirPalabra);
}

function mostrarLista(listaHTML, lista, mensajeVacio, estilo, alElegirPalabra) {

    listaHTML.replaceChildren();

    if (lista.length === 0) {
        const li = document.createElement("li");
        li.className = "text-body-secondary";
        li.textContent = mensajeVacio;
        listaHTML.appendChild(li);
        return;
    }

    lista.forEach(function (elemento) {
        listaHTML.appendChild(crearChip(elemento, estilo, alElegirPalabra));
    });
}

function crearChip(texto, estilo, alElegirPalabra) {
    const li = document.createElement("li");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-sm chip " + estilo;
    boton.textContent = texto;
    boton.setAttribute("aria-label", "Buscar " + texto);
    boton.addEventListener("click", function () {
        alElegirPalabra(texto);
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    li.appendChild(boton);
    return li;
}

export function pintarContador(total) {
    elementos.contadorSesion.textContent = total > 0
        ? "Búsquedas en esta pestaña: " + total + "."
        : "";
}

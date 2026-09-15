const palabra = document.querySelector("#palabra");
const buscar = document.querySelector("#buscar");
const resultado = document.querySelector("#resultado");

const nombre = document.querySelector("#nombre");
const sinonimos = document.querySelector("#sinonimos");
const antonimos = document.querySelector("#antonimos");
const mensaje = document.querySelector("#mensaje");


buscar.addEventListener("click", buscarPalabra);


async function buscarPalabra() {

    const texto = palabra.value.trim();

    if (texto === "") {
        mensaje.textContent = "Por favor, escribe una palabra.";
        resultado.hidden = true;
        return;
    }

    mensaje.textContent = "Buscando...";
    resultado.hidden = true;

    try {

        const url =
            "https://freedictionaryapi.com/api/v1/entries/es/" +
            encodeURIComponent(texto);

        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error("No se encontró esa palabra.");
        }

        const datos = await respuesta.json();

        mostrarResultado(datos);

        mensaje.textContent = "";

    } catch (error) {

        mensaje.textContent = error.message;

    }
}


function mostrarResultado(datos) {

    resultado.hidden = false;

    nombre.textContent = datos.word;

    sinonimos.replaceChildren();
    antonimos.replaceChildren();

    const listaSinonimos = [];
    const listaAntonimos = [];


    datos.entries.forEach(function(entrada) {

        if (entrada.synonyms) {

            entrada.synonyms.forEach(function(sinonimo) {

                if (!listaSinonimos.includes(sinonimo)) {
                    listaSinonimos.push(sinonimo);
                }

            });

        }


        if (entrada.antonyms) {

            entrada.antonyms.forEach(function(antonimo) {

                if (!listaAntonimos.includes(antonimo)) {
                    listaAntonimos.push(antonimo);
                }

            });

        }


        if (entrada.senses) {

            entrada.senses.forEach(function(sentido) {

                if (sentido.synonyms) {

                    sentido.synonyms.forEach(function(sinonimo) {

                        if (!listaSinonimos.includes(sinonimo)) {
                            listaSinonimos.push(sinonimo);
                        }

                    });

                }


                if (sentido.antonyms) {

                    sentido.antonyms.forEach(function(antonimo) {

                        if (!listaAntonimos.includes(antonimo)) {
                            listaAntonimos.push(antonimo);
                        }

                    });

                }

            });

        }

    });


    mostrarLista(
        sinonimos,
        listaSinonimos,
        "No hay sinónimos disponibles."
    );


    mostrarLista(
        antonimos,
        listaAntonimos,
        "No hay antónimos disponibles."
    );
}


function mostrarLista(listaHTML, lista, mensajeVacio) {

    if (lista.length === 0) {

        const li = document.createElement("li");

        li.textContent = mensajeVacio;

        listaHTML.appendChild(li);

        return;
    }


    lista.forEach(function(elemento) {

        const li = document.createElement("li");

        li.textContent = elemento;

        listaHTML.appendChild(li);

    });
}
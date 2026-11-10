import { CATEGORIAS } from "./config.js";

export function procesarDatos(datos) {

    const sinonimos = [];
    const antonimos = [];
    let definicion = "";
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
            if (!definicion && sentido.definition) {
                definicion = sentido.definition;
            }
            agregarSinRepetir(sinonimos, sentido.synonyms);
            agregarSinRepetir(antonimos, sentido.antonyms);
            recorrerSentidos(sentido.subsenses);
        });
    }

    (datos.entries || []).forEach(function (entrada) {
        if (!categoria && entrada.partOfSpeech) {
            categoria = entrada.partOfSpeech;
        }
        agregarSinRepetir(sinonimos, entrada.synonyms);
        agregarSinRepetir(antonimos, entrada.antonyms);
        recorrerSentidos(entrada.senses);
    });

    return {
        palabra: datos.word,
        categoria: CATEGORIAS[categoria] || categoria,
        definicion: definicion,
        sinonimos: sinonimos,
        antonimos: antonimos
    };
}

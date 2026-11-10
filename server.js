

import express from "express";
import dotenv from "dotenv";

dotenv.config(); // carga el archivo .env si existe

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "https://freedictionaryapi.com/api/v1/entries/es/";

// Caché simple en memoria: palabra -> { datos, hora }
const cache = new Map();
const DURACION_CACHE = 1000 * 60 * 60; // 1 hora

app.use(express.json());
app.use(express.static("public"));


// Ruta de prueba para verificar que el servidor está vivo
app.get("/api/estado", (req, res) => {
    res.json({ estado: "ok", palabrasEnCache: cache.size });
});


app.get("/api/palabra/:texto", async (req, res) => {

    const texto = req.params.texto.trim().toLowerCase();

    // Validación: solo letras (con tildes y ñ), espacios y guiones
    if (!/^[\p{L}\s-]{1,40}$/u.test(texto)) {
        return res.status(400).json({ error: "Palabra no válida." });
    }

    const guardado = cache.get(texto);
    if (guardado && Date.now() - guardado.hora < DURACION_CACHE) {
        return res.json(guardado.datos);
    }

    try {
        const respuesta = await fetch(API_URL + encodeURIComponent(texto), {
            signal: AbortSignal.timeout(8000)
        });

        if (respuesta.status === 404) {
            return res.status(404).json({ error: "No se encontró esa palabra." });
        }

        if (!respuesta.ok) {
            return res.status(502).json({ error: "El diccionario no respondió." });
        }

        const datos = await respuesta.json();
        cache.set(texto, { datos, hora: Date.now() });
        res.json(datos);

    } catch (error) {
        console.error("Error consultando la API:", error.message);
        res.status(502).json({ error: "No se pudo consultar el diccionario." });
    }
});


// Cualquier otra ruta /api que no exista responde en JSON
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Ruta no encontrada." });
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

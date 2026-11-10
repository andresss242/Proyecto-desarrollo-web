import express from "express";
import rutaPalabra from "./rutas/palabra.js";
import rutaEstado from "./rutas/estado.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/api/palabra", rutaPalabra);
app.use("/api/estado", rutaEstado);

app.use("/api", (req, res) => {
    res.status(404).json({ error: "Ruta no encontrada." });
});

export default app;

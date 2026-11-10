import { Router } from "express";
import { validarPalabra } from "../middlewares/validarPalabra.js";
import { consultarPalabra, ErrorDiccionario } from "../servicios/diccionario.js";

const router = Router();

router.get("/:texto", validarPalabra, async (req, res) => {
    try {
        const datos = await consultarPalabra(req.palabra);
        res.json(datos);
    } catch (error) {
        const estado = error instanceof ErrorDiccionario ? error.estado : 500;
        res.status(estado).json({ error: error.message });
    }
});

export default router;

import { Router } from "express";
import { tamanoCache } from "../servicios/cache.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ estado: "ok", palabrasEnCache: tamanoCache() });
});

export default router;

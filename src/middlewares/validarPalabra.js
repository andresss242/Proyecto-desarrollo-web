const PATRON = /^[\p{L}\s-]{1,40}$/u;

export function validarPalabra(req, res, next) {

    const texto = req.params.texto.trim().toLowerCase();

    if (!PATRON.test(texto)) {
        return res.status(400).json({ error: "Palabra no válida." });
    }

    req.palabra = texto;
    next();
}

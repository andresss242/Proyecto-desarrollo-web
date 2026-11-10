import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const API_URL = process.env.API_URL || "https://freedictionaryapi.com/api/v1/entries/es/";
export const DURACION_CACHE = 1000 * 60 * 60;
export const TIEMPO_LIMITE = 8000;

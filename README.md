# Buscador de sinónimos y antónimos

Aplicación web que busca sinónimos y antónimos de palabras en español usando la
[Free Dictionary API](https://freedictionaryapi.com), que no pide clave ni registro.

## Qué incluye

| Tema de clase | Cómo se aplica en el proyecto |
|---|---|
| **Bootstrap 5.3.8** | Cuadrícula `container / row / col`, tarjetas (`card`), botones, `form-control`, alertas (`alert-*`), `badge`, spinner y utilidades de espaciado. Diseño mobile-first. |
| **UX/UI** | Retroalimentación en cada acción (mensajes integrados con `role="status"` en lugar de `alert()`), spinner y botón deshabilitado mientras se busca, chips clicables, animación suave del resultado, foco visible con teclado, enlace "Saltar al buscador", contraste medido (todo ≥ 4.5 a 1) y respeto a `prefers-reduced-motion`. |
| **localStorage** | Tema claro/oscuro (`modo`), guardado con `JSON.stringify` / `JSON.parse`. |
| **sessionStorage** | Caché de respuestas (`cache:<palabra>`), última palabra buscada (`ultimaPalabra`, se recupera al pulsar F5) y contador de búsquedas de la pestaña (`busquedasSesion`). |
| **Buenas prácticas de almacenamiento** | Lectura/escritura dentro de `try/catch`, la página funciona aunque no se pueda guardar, aviso de privacidad y botón **Olvidar mis datos** con confirmación en dos clics. |
| **Backend (Node.js + Express)** | `server.js` sirve el frontend (`express.static`) y la ruta `GET /api/palabra/:texto`, que valida la palabra, consulta la API y guarda las respuestas en caché en memoria. `GET /api/estado` sirve para comprobar que el servidor está vivo. |
| **Despliegue** | `package.json` con `"type": "module"` y script `start`, `.gitignore` (excluye `node_modules/` y `.env`), `.env.example`, puerto con `process.env.PORT`. |

El frontend intenta primero el backend propio; si no existe (por ejemplo en Netlify o con Live
Server) consulta la API pública directamente. Así funciona en ambos casos.

## Estructura (programación modular)

```
/proyecto
|-- server.js                     Arranca el servidor
|-- /src                          Backend
|    |-- config.js                Puerto, URL de la API y tiempos
|    |-- app.js                   Crea la app de Express y monta las rutas
|    |-- /rutas
|    |    |-- palabra.js          GET /api/palabra/:texto
|    |    |-- estado.js           GET /api/estado
|    |-- /middlewares
|    |    |-- validarPalabra.js   Valida la palabra antes de consultar
|    |-- /servicios
|         |-- diccionario.js      Consulta la Free Dictionary API
|         |-- cache.js            Caché en memoria (1 hora)
|-- /public                       Frontend
     |-- index.html
     |-- /css
     |    |-- variables.css       Paleta de colores (claro y oscuro)
     |    |-- base.css            Fondo y títulos
     |    |-- botones.css         Botón principal y chips
     |    |-- componentes.css     Contadores, tarjeta, animación, aviso
     |    |-- accesibilidad.css   Foco visible y movimiento reducido
     |-- /js
          |-- main.js             Punto de entrada: une todos los módulos
          |-- config.js           Constantes (URLs, claves, categorías)
          |-- almacenamiento.js   localStorage y sessionStorage
          |-- api.js              fetch al backend o a la API
          |-- procesar.js         Extrae sinónimos, antónimos y definición
          |-- interfaz.js         Todo lo que toca el DOM
          |-- tema.js             Tema claro / oscuro
          |-- privacidad.js       Botón "Olvidar mis datos"
```

## Ejecutar en local

```bash
npm install
npm start
```

Abrir `http://localhost:3000`.

Solo el frontend: abrir `public/index.html` con Live Server.

## Desplegar

**Opción B (recomendada): un solo servicio en Render**

1. Subir el proyecto a GitHub (`git init`, `git add .`, `git commit -m "..."`, `git push`).
2. En render.com: **New → Web Service** y elegir el repositorio.
3. Language: `Node` · Build Command: `npm install` · Start Command: `node server.js` · Plan: `Free`.

**Solo frontend en Netlify o Vercel**

Importar el repositorio y poner `public` como carpeta de publicación (publish directory).

## Comprobar el almacenamiento

F12 → pestaña **Application** → **Local storage** y **Session storage**.

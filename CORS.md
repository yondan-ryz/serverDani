# CORS change: allow frontend https://server-dani.vercel.app

- Adds a global CORS middleware in `server.js`.
- Allows origin: `https://server-dani.vercel.app`.
- Allows all standard HTTP methods and request headers.
- Enables CORS for all `/api/*` routes.
- Keeps preflight (`OPTIONS`) requests working.

Implementation location:
- `serverDani/server.js`


/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin when the API is hosted separately, e.g. https://your-api.up.railway.app */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ACTUATOR_URL: string;
  readonly VITE_DATA_MODE: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_DEFAULT_TENANT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FEATURE_MULTI_CARRIER_QUOTES?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

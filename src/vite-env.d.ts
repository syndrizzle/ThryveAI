/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_RETELL_API_KEY: string
    readonly VITE_AGENT_ID: string
    readonly VITE_FROM_PHONE_NUMBER: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

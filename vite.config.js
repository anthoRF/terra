import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { FileStore } from './server/store.mjs';
import { createApp } from './server/app.mjs';
import { nodeAdapter } from './server/node-adapter.mjs';

export default defineConfig({
  plugins: [react(), { name: 'terra-local-api', configureServer(server) {
    server.middlewares.use(nodeAdapter(createApp({ store: new FileStore(resolve('.terra-data')), teacherKey: process.env.DOCENTE_CLAVE })));
  } }],
  server: {
    host: '0.0.0.0', allowedHosts: true,
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.terra-data/**', '**/.netlify/**', '**/server/**', '**/tests/**'] },
  },
  build: { target: 'es2022', chunkSizeWarningLimit: 700, license: { fileName: 'THIRD_PARTY_LICENSES.md' } },
});

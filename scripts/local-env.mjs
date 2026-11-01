import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export function loadLocalEnvironment() {
  const path = fileURLToPath(new URL('../.env', import.meta.url));
  if (!existsSync(path) && !process.env.DOCENTE_CLAVE) {
    writeFileSync(path, `# Solo para tu computadora. No publiques este archivo.\nDOCENTE_CLAVE=${randomBytes(24).toString('base64url')}\n`, { mode: 0o600 });
    console.log('Terra: se creó una clave docente local privada en .env. Consulta ese archivo para ingresar.');
  }
  if (existsSync(path)) process.loadEnvFile(path);
}

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { loadLocalEnvironment, projectRoot } from './local-env.mjs';
import { FileStore } from '../server/store.mjs';
import { createApp } from '../server/app.mjs';
import { nodeAdapter } from '../server/node-adapter.mjs';
loadLocalEnvironment();
const api = nodeAdapter(createApp({ store: new FileStore(resolve(projectRoot, '.terra-data')), teacherKey: process.env.DOCENTE_CLAVE }));
const directory = resolve(projectRoot, 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain' };
createServer((req, res) => api(req, res, async () => {
  try {
    let path = resolve(directory, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
    if (path !== directory && !path.startsWith(directory + sep)) { res.writeHead(403); res.end(); return; }
    if (path === directory || !extname(path)) path = resolve(directory, 'index.html');
    const bytes = await readFile(path); res.writeHead(200, { 'Content-Type': `${types[extname(path)] || 'application/octet-stream'}; charset=utf-8` }); res.end(bytes);
  } catch { res.writeHead(404); res.end('No encontrado'); }
})).listen(Number(process.env.PORT || 4173), '0.0.0.0', () => console.log(`Terra local: http://localhost:${process.env.PORT || 4173}`));

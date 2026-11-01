import { loadLocalEnvironment } from './local-env.mjs';
import { parseArgs } from 'node:util';
loadLocalEnvironment();
const { createServer } = await import('vite');
const { values } = parseArgs({ options: { host: { type: 'string' }, port: { type: 'string' }, strictPort: { type: 'boolean' }, open: { type: 'boolean' } } });
const server = await createServer({ server: { host: values.host || '0.0.0.0', port: Number(values.port || 5173), strictPort: values.strictPort || false, open: values.open || false } });
await server.listen();
server.printUrls();

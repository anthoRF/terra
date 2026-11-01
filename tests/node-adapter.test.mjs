import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { nodeAdapter } from '../server/node-adapter.mjs';

function request(method, path, body = '', headers = {}) {
  const req = Readable.from(body ? [Buffer.from(body)] : []);
  Object.assign(req, { method, url: path, headers: { host: 'localhost:5173', ...headers }, socket: { remoteAddress: '127.0.0.1' } }); return req;
}
async function invoke(adapter, req) {
  const out = { status: null, headers: null, body: null, next: false };
  await adapter(req, { writeHead(status, headers) { out.status = status; out.headers = headers; }, end(value) { out.body = value?.toString(); } }, () => { out.next = true; }); return out;
}

test('el adaptador local conserva origen, JSON y cookies protegidas', async () => {
  let observed;
  const adapter = nodeAdapter(async (req, context) => {
    observed = { url: req.url, origin: req.headers.get('origin'), data: await req.json(), ip: context.ip };
    return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'content-type': 'application/json', 'set-cookie': 'terra_session=test; HttpOnly; SameSite=Strict; Path=/' } });
  });
  const result = await invoke(adapter, request('POST', '/api/register', '{"alias":"Prueba"}', { origin: 'http://localhost:5173', 'content-type': 'application/json' }));
  assert.equal(observed.url, 'http://localhost:5173/api/register'); assert.equal(observed.origin, 'http://localhost:5173'); assert.deepEqual(observed.data, { alias: 'Prueba' }); assert.equal(observed.ip, '127.0.0.1');
  assert.equal(result.status, 201); assert.match(result.headers['set-cookie'], /HttpOnly/); assert.deepEqual(JSON.parse(result.body), { ok: true });
});

test('el adaptador deja pasar recursos estáticos y limita el cuerpo de las peticiones', async () => {
  let calls = 0; const adapter = nodeAdapter(async () => { calls++; return new Response('{}'); });
  const asset = await invoke(adapter, request('GET', '/assets/earth-day.jpg')); assert.equal(asset.next, true); assert.equal(calls, 0);
  const huge = await invoke(adapter, request('POST', '/api/register', 'x'.repeat(24001))); assert.equal(huge.status, 413); assert.equal(calls, 0);
});
